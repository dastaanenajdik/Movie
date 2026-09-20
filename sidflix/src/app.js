/*
 * SidFlix — Express app
 * Legal data sources only:
 *  - TMDB API (metadata, trailers, official watch providers) when TMDB_API_KEY is set
 *  - Built-in Open Movies catalog (Creative Commons / Public Domain, self-hosted streams)
 */
const path = require('path');
const express = require('express');
const demoCatalog = require('./demoCatalog');

const app = express();

const TMDB_API_KEY = process.env.TMDB_API_KEY || '';
const REGION = (process.env.SIDFLIX_REGION || 'IN').toUpperCase();
const TMDB_BASE = 'https://api.themoviedb.org/3';
const IMG = {
  poster: (p) => `https://image.tmdb.org/t/p/w500${p}`,
  backdrop: (p) => `https://image.tmdb.org/t/p/w1280${p}`,
  logo: (p) => `https://image.tmdb.org/t/p/w92${p}`
};

const hasTmdb = () => TMDB_API_KEY.length >= 10;

async function tmdb(pathname, params = {}) {
  if (!hasTmdb()) return null;
  const url = new URL(TMDB_BASE + pathname);
  url.searchParams.set('api_key', TMDB_API_KEY);
  url.searchParams.set('language', 'en-US');
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

const mapTmdbItem = (m) => ({
  id: m.id,
  type: m.media_type === 'tv' ? 'tv' : 'movie',
  title: m.title || m.name || 'Untitled',
  year: (m.release_date || m.first_air_date || '').slice(0, 4),
  rating: m.vote_average ? Math.round(m.vote_average * 10) / 10 : null,
  overview: m.overview || '',
  poster: m.poster_path ? IMG.poster(m.poster_path) : null,
  backdrop: m.backdrop_path ? IMG.backdrop(m.backdrop_path) : null
});

const keepWatchable = (m) =>
  (m.media_type === 'movie' || m.media_type === 'tv') && (m.title || m.name);

/* ----------------------------- API routes ----------------------------- */

app.get('/api/config', (req, res) => {
  res.json({ tmdb: hasTmdb(), region: REGION });
});

// Trending (TMDB) — ya TMDB key na ho to Open Catalog
app.get('/api/trending', async (req, res) => {
  if (hasTmdb()) {
    const data = await tmdb('/trending/all/week');
    if (data && Array.isArray(data.results)) {
      return res.json({
        source: 'tmdb',
        items: data.results.filter(keepWatchable).slice(0, 18).map(mapTmdbItem)
      });
    }
  }
  res.json({ source: 'open', items: demoCatalog });
});

// Search: TMDB search/multi, fallback = Open Catalog filter
app.get('/api/search', async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (!q) return res.json({ source: hasTmdb() ? 'tmdb' : 'open', query: q, items: [] });

  if (hasTmdb()) {
    const data = await tmdb('/search/multi', {
      query: q,
      include_adult: 'false',
      page: '1'
    });
    if (data && Array.isArray(data.results)) {
      return res.json({
        source: 'tmdb',
        query: q,
        items: data.results.filter(keepWatchable).slice(0, 24).map(mapTmdbItem)
      });
    }
  }

  const needle = q.toLowerCase();
  const items = demoCatalog.filter((m) => {
    const hay = [m.title, m.year, m.overview, ...(m.keywords || [])]
      .join(' ')
      .toLowerCase();
    return needle.split(/\s+/).every((w) => hay.includes(w));
  });
  res.json({ source: 'open', query: q, items });
});

// Title details + trailer + official watch providers + similar
app.get('/api/title/:type/:id', async (req, res) => {
  const { type, id } = req.params;

  // Open catalog items resolve locally (string ids jaise 'bbb')
  const openItem = demoCatalog.find((m) => String(m.id) === String(id));
  if (openItem) {
    return res.json({ source: 'open', item: openItem, similar: demoCatalog.filter((m) => m.id !== openItem.id) });
  }

  if (!['movie', 'tv'].includes(type) || !/^\d+$/.test(id)) {
    return res.status(400).json({ error: 'invalid_request' });
  }

  if (!hasTmdb()) return res.status(503).json({ error: 'tmdb_not_configured' });

  const data = await tmdb(`/${type}/${id}`, {
    append_to_response: 'videos,watch/providers,similar'
  });
  if (!data || data.success === false) return res.status(502).json({ error: 'upstream_error' });

  const videos = (data.videos && data.videos.results) || [];
  const yt = videos.filter((v) => v.site === 'YouTube');
  const trailer =
    yt.find((v) => v.type === 'Trailer' && v.official) ||
    yt.find((v) => v.type === 'Trailer') ||
    yt[0] ||
    null;

  const wp = (data['watch/providers'] && data['watch/providers'].results) || {};
  const reg = wp[REGION] || {};
  const mapProv = (arr) =>
    (arr || []).map((p) => ({ name: p.provider_name, logo: IMG.logo(p.logo_path) }));

  const similar = ((data.similar && data.similar.results) || [])
    .filter(keepWatchable)
    .slice(0, 14)
    .map((m) => mapTmdbItem({ ...m, media_type: type }));

  res.json({
    source: 'tmdb',
    item: mapTmdbItem({ ...data, media_type: type }),
    tagline: data.tagline || '',
    genres: (data.genres || []).map((g) => g.name),
    runtime: data.runtime || (data.episode_run_time && data.episode_run_time[0]) || null,
    seasons: data.number_of_seasons || null,
    episodes: data.number_of_episodes || null,
    trailer: trailer ? { key: trailer.key, name: trailer.name } : null,
    providers: {
      link: reg.link || (data.homepage || null),
      stream: mapProv(reg.flatrate),
      rent: mapProv(reg.rent),
      buy: mapProv(reg.buy)
    },
    similar
  });
});

// Open catalog list
app.get('/api/open-catalog', (req, res) => {
  res.json({ items: demoCatalog });
});

app.use('/api', (req, res) => res.status(404).json({ error: 'not_found' }));

/* --------------------------- Static frontend -------------------------- */

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
app.use(express.static(PUBLIC_DIR, { maxAge: '1h', index: 'index.html' }));

// SPA fallback (non-API GET)
app.use((req, res) => {
  if (req.method !== 'GET') return res.status(404).end();
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

module.exports = app;
