# 🎬 SidFlix

**Search. Discover. Watch.**

SidFlix ek Netflix-style movie/TV discovery site hai:

- 🔍 **Movie & TV search** (TMDB se — posters, rating, overview, genres)
- 🎥 **Trailer** ek click me (YouTube embed)
- 📺 **"Kahaan dekhein"** — official streaming providers (region-wise, default India)
- ▶️ **Built-in player** — MP4 / WebM / OGG (native) + **HLS (.m3u8) adaptive** (hls.js), local file bhi chalta hai
- 🆓 **Open Movies** section — Creative Commons / Public Domain films, jo site ke andar hi directly & legally play hoti hain

> ⚖️ **Note:** SidFlix sirf legal content stream karta hai. Baaki sab titles ke liye
> sirf trailer + official watch-providers dikhaye jaate hain — pirated streams nahi.

---

## 🚀 Local run

```bash
cd sidflix
npm install
npm start
# → http://localhost:3000
```

Bina TMDB key ke bhi chalega — **Open Movies mode** (free & legal films + search unhi me).
Full movie/TV search ke liye TMDB key do:

```bash
cp .env.example .env    # apni key bharo
# ya Windows PowerShell:
# $env:TMDB_API_KEY="yahan_key"; npm start
```

**Free TMDB key kaise lein:**
1. [themoviedb.org](https://www.themoviedb.org) pe free account banao
2. Settings → **API** → *"API Key (v3 auth)"* copy karo
3. `.env` me `TMDB_API_KEY=` ke aage paste karo

---

## ☁️ Deploy — Vercel

1. Repo GitHub pe push karo
2. [vercel.com](https://vercel.com) → **Add New Project** → repo import karo
3. **Root Directory = `sidflix`** set karo (Edit button)
4. Environment Variables me `TMDB_API_KEY` add karo
5. **Deploy** — bas. `api/index.js` serverless function ban jayega, `vercel.json` routes sambhal lega.

CLI se: `cd sidflix && npx vercel --prod`

## ☁️ Deploy — Render

1. [render.com](https://render.com) → **New → Web Service** → repo connect karo
2. **Root Directory = `sidflix`**
3. Build Command: `npm install`  •  Start Command: `node server.js`
4. Env var `TMDB_API_KEY` add karo (aur chaho to `SIDFLIX_REGION=IN`)
5. Deploy.

(`render.yaml` bhi included hai — **New → Blueprint** se ek-click me ban jayega.)

---

## 🎮 Player ke baare me (important)

Browser VLC nahi hai — codec support browser ke upar depend karta hai:

| Format | Chalega? |
|---|---|
| MP4 (H.264/AAC) | ✅ Har jagah |
| WebM (VP8/VP9) | ✅ Chrome/Firefox/Edge |
| HLS `.m3u8` | ✅ Sab browsers (hls.js se, adaptive quality) |
| MKV / HEVC / AC3 / DTS | ⚠️ Browser-dependent — aksar nahi |

Isliye jab bhi possible ho **MP4 ya HLS** prefer karo.

---

## 📁 Structure

```
sidflix/
├── api/index.js      → Vercel serverless entry
├── src/app.js        → Express app (API routes + static)
├── src/demoCatalog.js→ Open Movies (CC / Public Domain streams)
├── public/           → Frontend (index.html, styles.css, app.js)
├── server.js         → Local / Render entry (node server.js)
├── vercel.json       → Vercel routes
└── render.yaml       → Render blueprint
```

This product uses the TMDB API but is not endorsed or certified by TMDB.
