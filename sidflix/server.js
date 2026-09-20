// Local / Render entrypoint — `node server.js`
const app = require('./src/app');

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎬 SidFlix running → http://localhost:${PORT}`);
  console.log(process.env.TMDB_API_KEY ? '✅ TMDB key loaded' : '⚠️  TMDB_API_KEY not set — Open Movies mode');
});
