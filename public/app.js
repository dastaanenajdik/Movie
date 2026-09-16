let allMovies = [];
let providersData = {};
let serversData = [];
let currentMovie = null;

// DOM Elements
const heroSection = document.getElementById('heroSection');
const heroBadge = document.getElementById('heroBadge');
const heroTitle = document.getElementById('heroTitle');
const heroRating = document.getElementById('heroRating');
const heroVotes = document.getElementById('heroVotes');
const heroYear = document.getElementById('heroYear');
const heroDuration = document.getElementById('heroDuration');
const heroAge = document.getElementById('heroAge');
const heroMatch = document.getElementById('heroMatch');
const heroDesc = document.getElementById('heroDesc');
const btnHeroPlay = document.getElementById('btnHeroPlay');
const btnHeroInfo = document.getElementById('btnHeroInfo');

const searchInput = document.getElementById('searchInput');
const rowsContainer = document.getElementById('rowsContainer');

// Player Modal
const playerModal = document.getElementById('playerModal');
const modalClose = document.getElementById('modalClose');
const modalVideo = document.getElementById('modalVideo');
const modalTitle = document.getElementById('modalTitle');
const modalRating = document.getElementById('modalRating');
const modalYear = document.getElementById('modalYear');
const modalDesc = document.getElementById('modalDesc');
const modalCast = document.getElementById('modalCast');
const modalDirector = document.getElementById('modalDirector');
const serverPills = document.getElementById('serverPills');

// Providers Modal
const providersModal = document.getElementById('providersModal');
const providersClose = document.getElementById('providersClose');
const btnOpenProviders = document.getElementById('btnOpenProviders');
const providersCount = document.getElementById('providersCount');
const providersGrid = document.getElementById('providersGrid');

// Navbar scroll effect
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 40) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// Load Initial Data
async function init() {
  try {
    // 1. Fetch movies data
    const moviesRes = await fetch('/data.json');
    allMovies = await moviesRes.json();

    // 2. Fetch repo providers & servers
    try {
      const pRes = await fetch('/api/providers');
      providersData = await pRes.json();
    } catch (e) {
      console.warn('Could not load providers API:', e);
    }

    try {
      const sRes = await fetch('/api/servers');
      serversData = await sRes.json();
    } catch (e) {
      console.warn('Could not load servers API:', e);
    }

    renderHero(allMovies[0]);
    renderMovieRows(allMovies);
    setupProvidersModal();
  } catch (err) {
    console.error('Initialization error:', err);
  }
}

// Render Hero Section
function renderHero(movie) {
  currentMovie = movie;
  heroBadge.textContent = movie.badge || 'Trending Now';
  heroTitle.textContent = movie.title;
  heroRating.textContent = `★ ${movie.rating}`;
  heroVotes.textContent = `(${movie.votes} votes)`;
  heroYear.textContent = movie.year;
  heroDuration.textContent = movie.duration;
  heroAge.textContent = movie.age;
  heroMatch.textContent = `${movie.match} Match`;
  heroDesc.textContent = movie.description;

  heroSection.style.background = `${movie.banner}`;

  btnHeroPlay.onclick = () => openPlayerModal(movie);
  btnHeroInfo.onclick = () => openPlayerModal(movie);
}

// Group movies by category and render rows
function renderMovieRows(movies) {
  rowsContainer.innerHTML = '';

  const categories = [...new Set(movies.map(m => m.category))];

  categories.forEach(category => {
    const rowEl = document.createElement('div');
    rowEl.className = 'category-row';

    const headerEl = document.createElement('div');
    headerEl.className = 'category-header';
    headerEl.innerHTML = `<h2 class="category-title">${category}</h2>`;

    const scrollContainer = document.createElement('div');
    scrollContainer.className = 'cards-scroll-container';

    const catMovies = movies.filter(m => m.category === category);
    catMovies.forEach(movie => {
      const card = createMovieCard(movie);
      scrollContainer.appendChild(card);
    });

    rowEl.appendChild(headerEl);
    rowEl.appendChild(scrollContainer);
    rowsContainer.appendChild(rowEl);
  });
}

// Create single card
function createMovieCard(movie) {
  const card = document.createElement('div');
  card.className = 'movie-card';

  card.innerHTML = `
    <div class="card-thumb" style="background: ${movie.banner};">
      <div class="card-thumb-pattern"></div>
      <div class="card-rating-badge">★ ${movie.rating}</div>
      <div class="card-play-hover">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5,3 19,12 5,21"></polygon>
        </svg>
      </div>
    </div>
    <div class="card-info">
      <div class="card-title" title="${movie.title}">${movie.title}</div>
      <div class="card-meta-row">
        <span>${movie.year}</span>
        <span>•</span>
        <span>${movie.duration}</span>
        <span>•</span>
        <span style="color:#46d369;">${movie.match}</span>
      </div>
      <div class="card-genres">
        ${movie.genre.map(g => `<span class="genre-tag">${g}</span>`).join('')}
      </div>
    </div>
  `;

  card.addEventListener('click', () => {
    openPlayerModal(movie);
  });

  return card;
}

// Open Video Player Modal
function openPlayerModal(movie) {
  currentMovie = movie;
  modalTitle.textContent = movie.title;
  modalRating.textContent = `★ ${movie.rating} IMDb (${movie.votes})`;
  modalYear.textContent = `${movie.year} • ${movie.duration} • ${movie.age}`;
  modalDesc.textContent = movie.description;
  modalCast.textContent = `Cast: ${movie.cast.join(', ')}`;
  modalDirector.textContent = `Director: ${movie.director}`;

  modalVideo.src = movie.videoUrl;
  modalVideo.play().catch(e => console.log('Autoplay handled:', e));

  // Render Server Switcher from servers.json
  renderServerPills();

  playerModal.classList.add('active');
}

// Switch servers
function renderServerPills() {
  serverPills.innerHTML = '';

  if (!serversData || serversData.length === 0) {
    serverPills.innerHTML = '<span style="color:#8b949e;font-size:13px;">Default SiddFlix Stream Server Active</span>';
    return;
  }

  serversData.forEach((server, index) => {
    const pill = document.createElement('button');
    pill.className = `server-pill ${index === 0 ? 'active' : ''}`;
    pill.innerHTML = `<span>${server.flag || '⚡'}</span> ${server.label || server.name}`;

    pill.addEventListener('click', () => {
      document.querySelectorAll('.server-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      // Toggle server fallback/stream
      if (server.isEmbed && server.embedUrl) {
        alert(`Connecting to fast upstream node: ${server.name} (${server.embedUrl})`);
      } else {
        // Restart or simulate server switch
        modalVideo.currentTime = 0;
        modalVideo.play();
      }
    });

    serverPills.appendChild(pill);
  });
}

function closePlayerModal() {
  playerModal.classList.remove('active');
  modalVideo.pause();
  modalVideo.src = '';
}

modalClose.addEventListener('click', closePlayerModal);
playerModal.addEventListener('click', (e) => {
  if (e.target === playerModal) closePlayerModal();
});

// Setup Providers Modal
function setupProvidersModal() {
  const providerKeys = Object.keys(providersData);
  providersCount.textContent = `${providerKeys.length} Available`;

  providersGrid.innerHTML = '';
  providerKeys.forEach(key => {
    const item = providersData[key];
    const link = document.createElement('a');
    link.className = 'provider-item';
    link.href = item.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.innerHTML = `
      <span class="provider-name">${item.name || key}</span>
      <span class="provider-url">${item.url}</span>
    `;
    providersGrid.appendChild(link);
  });

  btnOpenProviders.addEventListener('click', () => {
    providersModal.classList.add('active');
  });

  providersClose.addEventListener('click', () => {
    providersModal.classList.remove('active');
  });

  providersModal.addEventListener('click', (e) => {
    if (e.target === providersModal) {
      providersModal.classList.remove('active');
    }
  });
}

// Live Search
searchInput.addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase().trim();
  if (!query) {
    renderMovieRows(allMovies);
    return;
  }

  const filtered = allMovies.filter(m => 
    m.title.toLowerCase().includes(query) ||
    m.genre.some(g => g.toLowerCase().includes(query)) ||
    m.director.toLowerCase().includes(query) ||
    m.cast.some(c => c.toLowerCase().includes(query))
  );

  renderMovieRows(filtered);
});

// Init on DOM ready
document.addEventListener('DOMContentLoaded', init);
