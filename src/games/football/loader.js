const baseUrl = import.meta.env.BASE_URL;
const styleId = 'mini-football-styles';
const scriptIds = new Set();
let loadPromise = null;
let initialized = false;

const scripts = [
  'games/football/js/config.js',
  'games/football/js/save.js',
  'games/football/js/game.js',
  'games/football/js/lobby.js'
];

function withBase(path) {
  if (path.startsWith('http')) return path;
  return `${baseUrl}${path}`;
}

function loadStyle() {
  if (document.getElementById(styleId)) return;
  const link = document.createElement('link');
  link.id = styleId;
  link.rel = 'stylesheet';
  link.href = withBase('games/football/css/styles.css');
  document.head.appendChild(link);
}

function loadScript(src) {
  const fullSrc = withBase(src);
  if (scriptIds.has(fullSrc)) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = fullSrc;
    script.async = false;
    script.onload = () => {
      scriptIds.add(fullSrc);
      resolve();
    };
    script.onerror = () => reject(new Error(`Nie udało się załadować: ${src}`));
    document.body.appendChild(script);
  });
}

function ensureContainer() {
  let container = document.getElementById('footballContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'footballContainer';
    container.style.cssText = 'display:none;position:fixed;top:0;left:0;width:100%;height:100%;z-index:500;';
    document.body.appendChild(container);
  }
  return container;
}

async function ensureScriptsLoaded() {
  if (!loadPromise) {
    loadStyle();
    loadPromise = scripts.reduce(
      (chain, script) => chain.then(() => loadScript(script)),
      Promise.resolve()
    );
  }
  return loadPromise;
}

function showFootballScreen() {
  document.documentElement.style.overflow = 'hidden';
  document.body.classList.remove('platform-mode');
  document.body.classList.add('game-shell');
  document.getElementById('mikiGameShop').style.display = 'none';
  document.getElementById('lobby').style.display = 'none';
  document.getElementById('gameScreen').style.display = 'none';

  const container = ensureContainer();
  container.style.display = 'block';
}

export async function startMiniFootballApp() {
  await ensureScriptsLoaded();
  showFootballScreen();

  if (!initialized) {
    // Upewnij się, że fbLoadData istnieje
    if (typeof window.fbLoadData === 'function') {
      window.fbLoadData();
    }
    initialized = true;
  }

  // Pokaż lobby
  if (typeof window.fbShowLobby === 'function') {
    window.fbShowLobby();
  }
}

export function hideMiniFootball() {
  const container = document.getElementById('footballContainer');
  if (container) container.style.display = 'none';

  document.documentElement.style.overflowX = 'hidden';
  document.documentElement.style.overflowY = 'auto';
  document.body.classList.add('platform-mode');
  document.body.classList.remove('game-shell');
  document.getElementById('mikiGameShop').style.display = '';
}
