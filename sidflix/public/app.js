/* ============ SidFlix frontend ============ */
(() => {
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

  const state = {
    config: { tmdb: false, region: 'IN' },
    hls: null,
    blobUrl: null,
    searchTimer: null
  };

  /* ---------------- helpers ---------------- */
  async function getJSON(url) {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  }

  let toastTimer;
  function toast(msg, ms = 3200) {
    const t = $('#toast');
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (t.hidden = true), ms);
  }

  const esc = (s = '') =>
    String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------------- cards ---------------- */
  function cardEl(item) {
    const btn = document.createElement('button');
    btn.className = 'card';
    btn.type = 'button';
    btn.setAttribute('aria-label', item.title);

    const poster = document.createElement('div');
    poster.className = 'card-poster';

    if (item.poster || item.posterImg) {
      const img = document.createElement('img');
      img.loading = 'lazy';
      img.src = item.poster || item.posterImg;
      img.alt = item.title;
      img.onerror = () => { img.replaceWith(gradientArt(item)); };
      poster.appendChild(img);
    } else {
      poster.appendChild(gradientArt(item));
    }

    if (item.open) {
      const b = document.createElement('span');
      b.className = 'badge-open';
      b.textContent = '▶ PLAY';
      poster.appendChild(b);
    }
    if (item.rating) {
      const r = document.createElement('span');
      r.className = 'card-rate';
      r.textContent = `★ ${item.rating}`;
      poster.appendChild(r);
    }

    const meta = document.createElement('div');
    meta.className = 'card-meta';
    meta.innerHTML = `<span class="card-title">${esc(item.title)}</span>
      <span class="card-sub">${esc(item.year || '')}${item.type === 'tv' ? ' • Series' : ''}</span>`;

    btn.append(poster, meta);
    btn.addEventListener('click', () => openItem(item));
    return btn;
  }

  function gradientArt(item) {
    const art = document.createElement('div');
    art.className = 'card-art';
    const [c1, c2] = item.colors || ['#e50914', '#14141c'];
    art.style.background = `linear-gradient(160deg, ${c1}, ${c2})`;
    art.textContent = item.title;
    return art;
  }

  function fillRow(el, items) {
    el.innerHTML = '';
    items.forEach((i) => el.appendChild(cardEl(i)));
  }

  /* ---------------- hero ---------------- */
  function setHero(item) {
    $('#hero').hidden = false;
    $('#hero-tag').textContent = item.open ? 'Free & Legal • yahin dekho' : 'Trending this week';
    $('#hero-title').textContent = item.title;
    $('#hero-meta').textContent = [item.year, item.rating ? `★ ${item.rating}` : null, item.open ? item.license : null]
      .filter(Boolean).join('  •  ');
    $('#hero-overview').textContent = item.overview || '';

    const bd = $('#hero-backdrop');
    if (item.backdrop) {
      bd.style.background = `url('${item.backdrop}') center 20% / cover no-repeat`;
    } else {
      const [c1, c2] = item.colors || ['#e50914', '#14141c'];
      bd.style.background = `linear-gradient(150deg, ${c1}22, ${c2} 90%)`;
    }

    const actions = $('#hero-actions');
    actions.innerHTML = '';
    if (item.open && item.stream) {
      const play = document.createElement('button');
      play.className = 'btn';
      play.innerHTML = '▶&nbsp; Play Now';
      play.onclick = () => openPlayer(item.stream.url, item.title, item.stream.kind);
      actions.appendChild(play);
    }
    const info = document.createElement('button');
    info.className = 'btn ghost';
    info.textContent = 'ℹ Details';
    info.onclick = () => openItem(item);
    actions.appendChild(info);
  }

  /* ---------------- details modal ---------------- */
  function openModal() { $('#modal').hidden = false; }
  function closeModal() {
    $('#modal').hidden = true;
    $('#modal-content').innerHTML = '';
    $('#modal-banner').style.background = '';
  }

  async function openItem(item) {
    if (item.open) return showOpenModal(item);
    try {
      const d = await getJSON(`/api/title/${item.type}/${item.id}`);
      showTmdbModal(d);
    } catch {
      toast('Details load nahi ho payi. Thodi der baad try karo.');
    }
  }

  function banner(item) {
    const b = $('#modal-banner');
    if (item.backdrop) b.style.background = `url('${item.backdrop}') center 25% / cover no-repeat`;
    else {
      const [c1, c2] = item.colors || ['#e50914', '#14141c'];
      b.style.background = `linear-gradient(150deg, ${c1}55, ${c2})`;
    }
  }

  function showOpenModal(item) {
    banner(item);
    const c = $('#modal-content');
    c.innerHTML = `
      <h2 class="modal-title">${esc(item.title)}</h2>
      <div class="modal-meta">
        ${esc(item.year || '')} ${item.rating ? ` • ★ ${item.rating}` : ''}
        <span class="pill" style="align-self:center">${esc(item.license || 'Open license')}</span>
      </div>
      <p class="modal-overview">${esc(item.overview || '')}</p>
      <div class="modal-actions">
        <button class="btn" id="m-play">▶&nbsp; Play Now — yahin</button>
        <a class="btn ghost" href="${esc(item.stream.url)}" target="_blank" rel="noopener">⬇ Direct file</a>
      </div>`;
    $('#m-play').onclick = () => { closeModal(); openPlayer(item.stream.url, item.title, item.stream.kind); };
    openModal();
  }

  function showTmdbModal(d) {
    const item = d.item;
    banner(item);
    const c = $('#modal-content');
    const prov = d.providers || {};
    const chips = (arr) =>
      (arr || []).map((p) => `<span class="watch-chip">${p.logo ? `<img src="${p.logo}" alt="">` : ''}${esc(p.name)}</span>`).join('');

    c.innerHTML = `
      <h2 class="modal-title">${esc(item.title)}</h2>
      ${d.tagline ? `<p class="modal-tagline">“${esc(d.tagline)}”</p>` : ''}
      <div class="modal-meta">
        ${esc(item.year || '')} ${item.rating ? ` • ★ ${item.rating}` : ''}
        ${d.runtime ? ` • ${d.runtime} min` : ''}
        ${d.seasons ? ` • ${d.seasons} season${d.seasons > 1 ? 's' : ''}` : ''}
      </div>
      ${(d.genres || []).length ? `<div class="genres">${d.genres.map((g) => `<span>${esc(g)}</span>`).join('')}</div>` : ''}
      <p class="modal-overview">${esc(item.overview || 'Overview available nahi hai.')}</p>
      <div class="modal-actions">
        ${d.trailer ? `<button class="btn" id="m-trailer">▶&nbsp; Trailer dekho</button>` : ''}
        ${prov.link ? `<a class="btn ghost" href="${esc(prov.link)}" target="_blank" rel="noopener">Where to watch ↗</a>` : ''}
      </div>
      <div id="m-trailer-frame"></div>
      ${(prov.stream?.length || prov.rent?.length || prov.buy?.length) ? `
        <div class="watch-box">
          <h4>📺 Kahaan dekhein (${esc(state.config.region)}) — official sources</h4>
          ${prov.stream?.length ? `<div class="watch-group"><span>Stream</span><div class="watch-chips">${chips(prov.stream)}</div></div>` : ''}
          ${prov.rent?.length ? `<div class="watch-group"><span>Rent</span><div class="watch-chips">${chips(prov.rent)}</div></div>` : ''}
          ${prov.buy?.length ? `<div class="watch-group"><span>Buy</span><div class="watch-chips">${chips(prov.buy)}</div></div>` : ''}
        </div>` : ''}
      ${(d.similar || []).length ? `<h4 class="similar-title">Iske jaisi aur</h4><div class="similar-row" id="m-similar"></div>` : ''}`;

    if (d.trailer) {
      $('#m-trailer').onclick = () => {
        $('#m-trailer-frame').innerHTML =
          `<iframe class="trailer-frame" src="https://www.youtube-nocookie.com/embed/${esc(d.trailer.key)}?autoplay=1&rel=0"
             title="Trailer" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
        $('#m-trailer').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      };
    }
    const sim = $('#m-similar');
    if (sim) d.similar.forEach((s) => sim.appendChild(cardEl(s)));
    openModal();
  }

  /* ---------------- player ---------------- */
  const video = () => $('#player-video');

  function detectKind(url) {
    try {
      const p = new URL(url, location.href).pathname.toLowerCase();
      if (p.endsWith('.m3u8')) return 'hls';
      if (/\.(mp4|webm|ogv|ogg|mov|m4v)$/.test(p)) return 'native';
    } catch { /* ignore */ }
    return 'native';
  }

  async function attachStream(url, kind) {
    const v = video();
    cleanupStream();
    const k = kind || detectKind(url);

    if (k === 'hls') {
      if (v.canPlayType('application/vnd.apple.mpegurl')) {
        v.src = url; // Safari native HLS
      } else {
        try {
          const { default: Hls } = await import('https://cdn.jsdelivr.net/npm/hls.js@1/+esm');
          if (Hls.isSupported()) {
            state.hls = new Hls({ enableWorker: true });
            state.hls.loadSource(url);
            state.hls.attachMedia(v);
            state.hls.on(Hls.Events.ERROR, (_e, data) => {
              if (data?.fatal) toast('Stream load nahi ho payi (network/CORS). Doosri URL try karo.');
            });
          } else {
            toast('Is browser me HLS support nahi hai. Safari try karo ya MP4 use karo.');
            return;
          }
        } catch {
          toast('HLS engine load nahi hua (internet check karo).');
          return;
        }
      }
    } else {
      v.src = url;
    }

    v.play().catch(() => { /* autoplay blocked — user press play */ });
    v.onerror = () => {
      if (v.error) toast('Ye format browser me nahi chal paya. MP4 (H.264) ya .m3u8 try karo.');
    };
  }

  function cleanupStream() {
    const v = video();
    if (state.hls) { state.hls.destroy(); state.hls = null; }
    v.pause();
    v.removeAttribute('src');
    v.load();
    v.onerror = null;
    if (state.blobUrl) { URL.revokeObjectURL(state.blobUrl); state.blobUrl = null; }
  }

  function openPlayer(url, title, kind) {
    $('#player-title').textContent = title || 'SidFlix Player';
    const chip = $('#player-kind');
    const k = kind || detectKind(url);
    chip.hidden = false;
    chip.textContent = k === 'hls' ? 'HLS adaptive' : 'Direct file';
    $('#player-url').value = url || '';
    $('#player-modal').hidden = false;
    if (url) attachStream(url, k);
  }

  function closePlayer() {
    $('#player-modal').hidden = true;
    cleanupStream();
  }

  $('#player-load').addEventListener('click', () => {
    const url = $('#player-url').value.trim();
    if (!url) return toast('Pehle video URL paste karo.');
    $('#player-title').textContent = 'Custom Stream';
    attachStream(url, detectKind(url));
  });

  $('#player-file').addEventListener('change', (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    state.blobUrl = URL.createObjectURL(f);
    $('#player-title').textContent = f.name;
    attachStream(state.blobUrl, 'native');
    e.target.value = '';
  });

  /* ---------------- search ---------------- */
  async function runSearch(q) {
    const results = $('#results');
    const rows = $('#rows');
    if (!q.trim()) {
      results.hidden = true;
      rows.hidden = false;
      return;
    }
    $('#results-title').textContent = `Results for “${q}”`;
    try {
      const d = await getJSON(`/api/search?q=${encodeURIComponent(q)}`);
      const grid = $('#results-grid');
      grid.innerHTML = '';
      d.items.forEach((i) => grid.appendChild(cardEl(i)));
      $('#results-empty').hidden = d.items.length > 0;
      results.hidden = false;
      rows.hidden = true;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      toast('Search fail ho gaya. Network check karo.');
    }
  }

  $('#search-input').addEventListener('input', (e) => {
    clearTimeout(state.searchTimer);
    const q = e.target.value;
    state.searchTimer = setTimeout(() => runSearch(q), 350);
  });
  $('#search-form').addEventListener('submit', (e) => {
    e.preventDefault();
    clearTimeout(state.searchTimer);
    runSearch($('#search-input').value);
  });

  /* ---------------- nav ---------------- */
  function goHome() {
    $('#search-input').value = '';
    $('#results').hidden = true;
    $('#rows').hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    $$('.nav-link').forEach((a) => a.classList.toggle('active', a.dataset.nav === 'home'));
  }
  $$('.nav-link').forEach((a) =>
    a.addEventListener('click', (e) => {
      e.preventDefault();
      goHome();
      if (a.dataset.nav === 'open') {
        $$('.nav-link').forEach((x) => x.classList.toggle('active', x === a));
        $('#row-open-sec').scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    })
  );
  $('#logo-home').addEventListener('click', (e) => { e.preventDefault(); goHome(); });

  /* ---------------- modal closing ---------------- */
  $$('[data-close]').forEach((el) =>
    el.addEventListener('click', () => { closeModal(); closePlayer(); })
  );
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeModal(); closePlayer(); }
  });

  /* ---------------- init ---------------- */
  (async function init() {
    try {
      state.config = await getJSON('/api/config');
    } catch { /* defaults */ }
    $('#tmdb-hint').hidden = !!state.config.tmdb;

    let trending = [];
    try {
      const d = await getJSON('/api/trending');
      trending = d.items || [];
      fillRow($('#row-trending'), trending);
      if (trending.length) setHero(trending[0]);
    } catch { /* ignore */ }

    try {
      const d = await getJSON('/api/open-catalog');
      fillRow($('#row-open'), d.items || []);
      if (!trending.length && d.items?.length) setHero(d.items[0]);
    } catch { /* ignore */ }
  })();
})();
