const baseUrl = import.meta.env.BASE_URL;
const styleId = 'zombie-story-styles';
const scriptIds = new Set();
let legacyLoadPromise;
let initialized = false;
let autosaveTimer;

const legacyScripts = [
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
  'games/zombie-story/js/data/config.js?v=2',
  'games/zombie-story/js/data/characters.js?v=2',
  'games/zombie-story/js/data/rewards.js?v=2',
  'games/zombie-story/js/ui/lobby.js?v=2',
  'games/zombie-story/js/ui/upgrades.js?v=2',
  'games/zombie-story/js/ui/save-load.js?v=2',
  'games/zombie-story/js/ui/shop.js?v=2',
  'games/zombie-story/js/ui/panels.js?v=2',
  'games/zombie-story/js/rendering/arena-3d.js?v=2',
  'games/zombie-story/js/rendering/lobby-3d.js?v=2',
  'games/zombie-story/js/rendering/char-preview-3d.js?v=2',
  'games/zombie-story/js/rendering/lobby-characters.js?v=2',
  'games/zombie-story/js/rendering/game-characters.js?v=2',
  'games/zombie-story/js/rendering/lobby-background.js?v=2',
  'games/zombie-story/js/rendering/arena-renderer.js?v=2',
  'games/zombie-story/js/game/arena.js?v=2',
  'games/zombie-story/js/game/player.js?v=2',
  'games/zombie-story/js/game/enemies.js?v=2',
  'games/zombie-story/js/game/attacks.js?v=2',
  'games/zombie-story/js/game/football.js?v=2',
  'games/zombie-story/js/game/nest.js?v=2'
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
  link.href = withBase('games/zombie-story/css/styles.css');
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

function setupLegacyErrorHandler() {
  window.onerror = function(msg, url, line) {
    alert(`BŁĄD JS w ${url.split('/').pop()} linia ${line}: ${msg}`);
  };
}

function setupResizeHandler() {
  window.addEventListener('resize', function() {
    if (typeof window.resizeArenaCanvas === 'function') {
      window.resizeArenaCanvas();
    } else if (window.canvas) {
      window.canvas.width = window.innerWidth;
      window.canvas.height = window.innerHeight;
    }
  });
}

function createLobbyStars() {
  const stars = document.getElementById('stars');
  if (!stars || stars.childElementCount > 0) return;

  for (let i = 0; i < 60; i += 1) {
    const star = document.createElement('div');
    const size = Math.random() * 3 + 1;
    star.className = 'star';
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.animationDelay = `${Math.random() * 2}s`;
    stars.appendChild(star);
  }
}

function resetOldSaveOnce() {
  if (!localStorage.getItem('brawlblox_v6')) {
    localStorage.removeItem('brawlblox_save');
    localStorage.setItem('brawlblox_v6', 'true');
  }
}

async function ensureLegacyGameLoaded() {
  if (!legacyLoadPromise) {
    loadStyle();
    setupLegacyErrorHandler();
    setupResizeHandler();
    legacyLoadPromise = legacyScripts.reduce(
      (chain, script) => chain.then(() => loadScript(script)),
      Promise.resolve()
    );
  }

  return legacyLoadPromise;
}

function showZombieLobby() {
  document.documentElement.style.overflow = 'hidden';
  document.body.classList.remove('platform-mode');
  document.body.classList.add('game-shell');
  document.getElementById('mikiGameShop').style.display = 'none';
  document.getElementById('gameScreen').style.display = 'none';
  document.getElementById('lobby').style.display = 'flex';
}

export async function startZombieStoryApp() {
  await ensureLegacyGameLoaded();
  showZombieLobby();

  if (initialized) {
    window.updateLobbyCharacter3D?.();
    window.drawLobbyCharacter?.();
    window.drawLobbyBackground?.();
    return;
  }

  createLobbyStars();
  resetOldSaveOnce();
  window.loadGame();
  window.updateUpgradeBtns();
  try {
    window.initLobby3D();
  } catch {
    window.drawLobbyCharacter?.();
    window.drawLobbyBackground?.();
  }
  window.updateArenaLevelDisplay();
  initialized = true;

  autosaveTimer = window.setInterval(() => window.saveGame(), 5000);
  window.addEventListener('beforeunload', () => window.saveGame());
}

export function showMikiGameShop() {
  if (typeof window.saveGame === 'function' && initialized) window.saveGame();
  if (autosaveTimer && !initialized) window.clearInterval(autosaveTimer);

  document.documentElement.style.overflowX = 'hidden';
  document.documentElement.style.overflowY = 'auto';
  document.body.classList.add('platform-mode');
  document.body.classList.remove('game-shell');
  document.getElementById('mikiGameShop').style.display = '';
  document.getElementById('lobby').style.display = 'none';
  document.getElementById('gameScreen').style.display = 'none';
  document.getElementById('creditsScreen').style.display = 'none';
  window.disposeArena3D?.();
}

window.showMikiGameShop = showMikiGameShop;
