import { games } from './games.js';
import { startZombieStoryApp } from '../games/zombie-story/loader.js';
import { startMiniFootballApp } from '../games/football/loader.js';

const app = document.querySelector('#mikiGameShop');

function isMobileLike() {
  return window.matchMedia('(pointer: coarse), (max-width: 900px)').matches;
}

async function requestAppFullscreen() {
  if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
    try {
      await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
    } catch {
      if (isMobileLike()) {
        showToast('Na iPhonie dodaj stronę do ekranu głównego, żeby ukryć pasek przeglądarki.');
      }
    }
  }

  if (screen.orientation?.lock && isMobileLike()) {
    screen.orientation.lock('landscape').catch(() => {});
  }
}

function renderStars() {
  return Array.from({ length: 18 }, (_, index) => {
    const left = 4 + Math.random() * 92;
    const top = 4 + Math.random() * 86;
    const delay = Math.random() * 4;
    const size = 5 + Math.random() * 11;
    return `<span class="shop-spark" style="--x:${left}%;--y:${top}%;--delay:${delay}s;--size:${size}px"></span>`;
  }).join('');
}

function renderGameCard(game, index) {
  const isAvailable = game.status === 'available';
  const actionText = isAvailable ? 'Graj' : 'Wkrótce';
  const cardClass = isAvailable ? 'game-card game-card-ready' : 'game-card game-card-soon';

  return `
    <article class="${cardClass}" style="--accent:${game.accent};--delay:${index * 0.08}s" data-game-id="${game.id}">
      <div class="card-glow"></div>
      <div class="card-topline">
        <span class="game-badge">${game.badge}</span>
        <span class="game-tag">${game.tag}</span>
      </div>
      <div class="game-icon-wrap"><span class="game-icon">${game.icon}</span></div>
      <h2>${game.title}</h2>
      <h3>${game.subtitle}</h3>
      <p>${game.description}</p>
      <button class="game-action" type="button" data-game-id="${game.id}">${actionText}</button>
    </article>
  `;
}

function showToast(message) {
  const toast = document.querySelector('.gameshop-toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 1800);
}

function openGame(gameId) {
  if (gameId === 'zombie-story') {
    requestAppFullscreen();
    startZombieStoryApp().catch(() => {
      showToast('Nie udało się uruchomić gry. Spróbuj odświeżyć stronę.');
    });
    return;
  }

  if (gameId === 'mini-football') {
    requestAppFullscreen();
    startMiniFootballApp().catch(() => {
      showToast('Nie udało się uruchomić gry. Spróbuj odświeżyć stronę.');
    });
    return;
  }

  const game = games.find((item) => item.id === gameId);
  showToast(`${game?.title || 'Ta gra'} już niedługo!`);
}

function render() {
  app.innerHTML = `
    <section class="gameshop-shell">
      <div class="gameshop-bg" aria-hidden="true">
        <span class="blob blob-one"></span>
        <span class="blob blob-two"></span>
        <span class="blob blob-three"></span>
        ${renderStars()}
      </div>

      <header class="gameshop-hero">
        <div class="hero-kicker">Mobilna platforma gier</div>
        <h1><span>Miki</span> GameShop</h1>
        <p>Kolorowe gry Mikołaja w jednym miejscu. Wybierz kartę, kliknij graj i baw się na telefonie.</p>
        <div class="hero-badges" aria-label="Cechy platformy">
          <span>📱 Telefon first</span>
          <span>🎮 7 gier</span>
          <span>✨ Nowe światy</span>
          <button class="fullscreen-pill" type="button">⛶ Pełny ekran</button>
        </div>
      </header>

      <section class="featured-panel" aria-label="Wyróżniona gra">
        <div>
          <span class="featured-label">Pierwsza dostępna gra</span>
          <strong>Zombie Story</strong>
          <p>Twoja obecna gra jest już podpięta jako pierwsza karta platformy.</p>
        </div>
        <button class="featured-play" type="button" data-game-id="zombie-story">Start</button>
      </section>

      <section class="games-grid" aria-label="Wybór gier">
        ${games.map(renderGameCard).join('')}
      </section>

      <div class="gameshop-toast" role="status" aria-live="polite"></div>
    </section>
  `;

  app.querySelectorAll('[data-game-id]').forEach((button) => {
    button.addEventListener('click', () => openGame(button.dataset.gameId));
  });

  app.querySelector('.fullscreen-pill')?.addEventListener('click', requestAppFullscreen);
}

render();
