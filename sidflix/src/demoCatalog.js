// SidFlix "Open Movies" catalog.
// Har item open-license (Creative Commons) ya Public Domain hai,
// isliye ye films site ke andar hi legally stream ho sakti hain.

module.exports = [
  {
    id: 'bbb',
    type: 'movie',
    title: 'Big Buck Bunny',
    year: '2008',
    rating: 7.0,
    overview:
      'A giant gentle rabbit finally snaps after three forest rodents keep bullying him — and plans a hilarious payback. The classic Blender open movie.',
    open: true,
    license: 'CC BY 3.0 — Blender Foundation',
    stream: {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      kind: 'mp4'
    },
    keywords: ['animation', 'comedy', 'short', 'rabbit', 'blender', 'funny', 'kids'],
    colors: ['#ff8a3d', '#8a2be2']
  },
  {
    id: 'sintel',
    type: 'movie',
    title: 'Sintel',
    year: '2010',
    rating: 7.4,
    overview:
      'A young warrior crosses frozen wastelands searching for the baby dragon she once rescued and lost. A beautiful, emotional fantasy epic made with open tools.',
    open: true,
    license: 'CC BY 3.0 — Blender Foundation',
    stream: {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      kind: 'mp4'
    },
    keywords: ['fantasy', 'dragon', 'animation', 'adventure', 'sad', 'warrior'],
    colors: ['#38bdf8', '#0f172a']
  },
  {
    id: 'elephants-dream',
    type: 'movie',
    title: 'Elephants Dream',
    year: '2006',
    rating: 6.5,
    overview:
      'Two travellers explore a strange, endless machine-world and imagine what lies beyond it. The very first open-source animated short film ever made.',
    open: true,
    license: 'CC BY 2.5 — Blender Foundation',
    stream: {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      kind: 'mp4'
    },
    keywords: ['sci-fi', 'short', 'animation', 'machine', 'dream', 'surreal'],
    colors: ['#a3e635', '#134e4a']
  },
  {
    id: 'tears-of-steel',
    type: 'movie',
    title: 'Tears of Steel',
    year: '2012',
    rating: 6.9,
    overview:
      'Forty years after a heartbreak in Amsterdam, a group of scientists re-enacts the past to save the world from rampaging machines. Live-action + heavy VFX.',
    open: true,
    license: 'CC BY 3.0 — Blender Foundation',
    stream: {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      kind: 'mp4'
    },
    keywords: ['sci-fi', 'robots', 'amsterdam', 'action', 'vfx', 'future'],
    colors: ['#f43f5e', '#312e81']
  },
  {
    id: 'bbb-hls',
    type: 'movie',
    title: 'Big Buck Bunny (HLS Adaptive)',
    year: '2008',
    rating: 7.0,
    overview:
      'Same open movie, streamed as adaptive HLS (m3u8) — the player switches quality automatically based on your network, jaisa Netflix karta hai.',
    open: true,
    license: 'CC BY 3.0 — Blender Foundation',
    stream: {
      url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      kind: 'hls'
    },
    keywords: ['animation', 'hls', 'adaptive', 'stream', 'test'],
    colors: ['#facc15', '#7c2d12']
  },
  {
    id: 'his-girl-friday',
    type: 'movie',
    title: 'His Girl Friday',
    year: '1940',
    rating: 7.8,
    overview:
      'A newspaper editor tries every trick to stop his star reporter — and ex-wife — from remarrying, right in the middle of a huge murder-story scoop. Screwball-comedy classic.',
    open: true,
    license: 'Public Domain',
    stream: {
      url: 'https://archive.org/download/his_girl_friday/his_girl_friday_512kb.mp4',
      kind: 'mp4'
    },
    posterImg: 'https://archive.org/services/img/his_girl_friday',
    keywords: ['classic', 'comedy', 'romance', '1940', 'newspaper', 'noir-era'],
    colors: ['#e2e8f0', '#1e293b']
  },
  {
    id: 'detour',
    type: 'movie',
    title: 'Detour',
    year: '1945',
    rating: 7.3,
    overview:
      'A hitchhiking pianist takes a wrong lift, a stranger dies, and fate drags him into a nightmare he cannot talk his way out of. Legendary low-budget film noir.',
    open: true,
    license: 'Public Domain',
    stream: {
      url: 'https://archive.org/download/Detour/Detour_512kb.mp4',
      kind: 'mp4'
    },
    posterImg: 'https://archive.org/services/img/Detour',
    keywords: ['noir', 'crime', 'thriller', '1945', 'classic', 'hitchhike'],
    colors: ['#64748b', '#020617']
  }
];
