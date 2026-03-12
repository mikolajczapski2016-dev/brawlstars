// ============ ZMIENNE STANU GRY ============

var canvas, ctx;
var gameRunning = false;
var keys = {};
var mouse = { x: 0, y: 0 };

var player = {
    x: 400, y: 400,
    w: 40, h: 50,
    speed: 3,
    hp: 100, maxHp: 100,
    superCharge: 0,
    isSupering: false,
    superReady: false,
    superX: 0, superY: 0, superTargetX: 0, superTargetY: 0, superProgress: 0,
    attackCooldown: 0,
    skin: 'default',
    blackHole: null
};

var enemies = [];
var attacks = [];
var particles = [];
var damageTexts = [];

// ARENA_W i ARENA_H zdefiniowane w js/data/config.js
var camera = { x: 0, y: 0 };

var walls = [];
var bushes = [];
var arenaLevel = parseInt(localStorage.getItem('arenaLevel')) || 1; // Poziom areny 1-100

// === ZAMEK ===
var castle = null;
var inCastle = false;
var castleEnemies = [];
var castleFloor = 0;
var towerEnemies = [];
var castleBoss = null;
var bossDialogShown = false;
var bossDialogStep = 0;

// === SYSTEM ZBROI BOSSA ===
var accumulators = [];
var bossHasArmor = false;
var bossPhase2Started = false;
var phase2Message = null; // komunikat "FAZA 2!" na ekranie

// bossDialogs zdefiniowane w js/data/config.js



function showBossDialog() {
    if (bossDialogStep >= bossDialogs.length) {
        bossDialogShown = true;
        return false;
    }
    return true;
}

// === POZIOMY ARENY - System ===
function getArenaLevel() {
    var saved = localStorage.getItem('arenaLevel');
    return parseInt(saved) || 1;
}

function setArenaLevel(lvl) {
    arenaLevel = Math.max(1, Math.min(100, lvl));
    localStorage.setItem('arenaLevel', arenaLevel);
    updateArenaLevelDisplay();
}

function updateArenaLevelDisplay() {
    var disp = document.getElementById('arenaLevelDisplay');
    if (disp) {
        disp.style.display = 'block';
        disp.textContent = '🏆 POZIOM ' + arenaLevel;
    }
}

// === TYPY PRZECIWNIKÓW (przekierowanie do enemies.js) ===
// createEnemyByLevel, createZombieNormal, createWizard, createBoss, spawnEnemy - patrz enemies.js

function initArena() {
    // Ładuj poziom areny
    arenaLevel = getArenaLevel();

    // Sciany
    walls = [
        { x: 200, y: 150, w: 80, h: 80 },
        { x: 500, y: 300, w: 120, h: 40 },
        { x: 800, y: 200, w: 80, h: 80 },
        { x: 350, y: 550, w: 40, h: 120 },
        { x: 700, y: 500, w: 80, h: 80 },
        { x: 950, y: 400, w: 60, h: 100 },
        { x: 150, y: 400, w: 100, h: 40 },
        { x: 600, y: 650, w: 80, h: 40 },
    ];
    // Krzewy
    bushes = [
        { x: 100, y: 300, w: 70, h: 70 },
        { x: 450, y: 200, w: 60, h: 60 },
        { x: 750, y: 600, w: 80, h: 60 },
        { x: 300, y: 700, w: 70, h: 50 },
        { x: 900, y: 150, w: 60, h: 70 },
        { x: 550, y: 500, w: 50, h: 60 },
    ];

    // Przeciwnicy
    enemies = [];
    for (var i = 0; i < 9; i++) {
        spawnEnemy();
    }

    // Reset systemu zbroi
    accumulators = [];
    bossHasArmor = false;
    bossPhase2Started = false;
    phase2Message = null;

    // Zamek (od poziomu 90)
    inCastle = false;
    castleFloor = 0;
    castleEnemies = [];
    towerEnemies = [];
    castleBoss = null;

    if (arenaLevel >= 90) {
        // Stwórz zamek po prawej stronie areny
        castle = {
            x: ARENA_W - 200,
            y: ARENA_H / 2 - 150,
            w: 180,
            h: 300,
            doorOpen: arenaLevel >= 100,
            towerX: ARENA_W - 200,
            towerY: ARENA_H / 2 - 150 - 120,
            towerW: 80,
            towerH: 120,
            ladderY: ARENA_H / 2 + 80
        };

        // Jeśli poziom 100, dodaj wrogów w zamku
        if (arenaLevel >= 100) {
            // Parter - czarodzieje
            for (var j = 0; j < 4; j++) {
                var cx = castle.x + 30 + Math.random() * 120;
                var cy = castle.y + 80 + Math.random() * 100;
                var hpScale = 1 + (arenaLevel - 90) * 0.15;
                castleEnemies.push({
                    x: cx, y: cy, w: 40, h: 50,
                    hp: 120 * hpScale,
                    maxHp: 120 * hpScale,
                    speed: 1.8,
                    attackCooldown: 0,
                    dir: Math.random() * Math.PI * 2,
                    changeDir: 0,
                    color: '#9c27b0',
                    hasBow: false,
                    isWizard: true,
                    type: 'wizard'
                });
            }
            // Wieża - strażnicy
            for (var k = 0; k < 3; k++) {
                var tx = castle.towerX + 20 + Math.random() * 40;
                var ty = castle.towerY + 30 + Math.random() * 50;
                towerEnemies.push({
                    x: tx, y: ty, w: 40, h: 50,
                    hp: 100 * 1.5,
                    maxHp: 100 * 1.5,
                    speed: 2.0,
                    attackCooldown: 0,
                    dir: Math.random() * Math.PI * 2,
                    changeDir: 0,
                    color: '#5d4037',
                    hasBow: false,
                    type: 'guard'
                });
            }

            // Boss na wieży - zresetuj dialog
            bossDialogShown = false;
            bossDialogStep = 0;
            castleBoss = {
                x: canvas.width / 2,
                y: canvas.height / 2 - 50,
                w: 80,
                h: 100,
                hp: 2000,
                maxHp: 2000,
                speed: 0.8,
                attackCooldown: 0,
                dir: Math.random() * Math.PI * 2,
                changeDir: 0,
                color: '#1a0000',
                type: 'boss'
            };

            // 4 akumulatory zasilające zbroję - rozstawione po arenie
            bossHasArmor = true;
            accumulators = [
                { x: 200, y: 200, hp: 400, maxHp: 400, active: true, pulse: 0 },
                { x: ARENA_W - 200, y: 200, hp: 400, maxHp: 400, active: true, pulse: 0 },
                { x: 200, y: ARENA_H - 200, hp: 400, maxHp: 400, active: true, pulse: 0 },
                { x: ARENA_W - 200, y: ARENA_H - 200, hp: 400, maxHp: 400, active: true, pulse: 0 }
            ];
        }
    } else {
        castle = null;
    }
}

// === RYSOWANIE BOSS ZAMKU ===
function drawBoss(x, y) {
    var time = Date.now() / 1000;
    var pulse = Math.sin(time * 4) * 5;

    // Poświata
    var gradient = ctx.createRadialGradient(x, y, 20, x, y, 100 + pulse);
    gradient.addColorStop(0, 'rgba(139, 0, 0, 0.6)');
    gradient.addColorStop(1, 'rgba(139, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, 100 + pulse, 0, Math.PI*2);
    ctx.fill();

    // Ciało bossa
    ctx.fillStyle = '#1a0000';
    ctx.beginPath();
    ctx.ellipse(x, y + 30, 50, 60, 0, 0, Math.PI*2);
    ctx.fill();

    // Korona
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.moveTo(x - 40, y - 60);
    ctx.lineTo(x - 30, y - 90 + pulse/2);
    ctx.lineTo(x - 20, y - 70);
    ctx.lineTo(x, y - 100 + pulse);
    ctx.lineTo(x + 20, y - 70);
    ctx.lineTo(x + 30, y - 90 + pulse/2);
    ctx.lineTo(x + 40, y - 60);
    ctx.closePath();
    ctx.fill();

    // Glowa
    ctx.fillStyle = '#2d1f1f';
    ctx.beginPath();
    ctx.arc(x, y - 30, 35, 0, Math.PI*2);
    ctx.fill();

    // Oczy
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(x - 12, y - 35, 8, 0, Math.PI*2);
    ctx.arc(x + 12, y - 35, 8, 0, Math.PI*2);
    ctx.fill();

    ctx.fillStyle = '#ff6666';
    ctx.beginPath();
    ctx.arc(x - 12, y - 35, 4, 0, Math.PI*2);
    ctx.arc(x + 12, y - 35, 4, 0, Math.PI*2);
    ctx.fill();

    // Usta
    ctx.fillStyle = '#4a0000';
    ctx.beginPath();
    ctx.ellipse(x, y - 15, 20, 10, 0, 0, Math.PI);
    ctx.fill();

    // Zęby
    ctx.fillStyle = '#fff';
    ctx.fillRect(x - 15, y - 18, 6, 8);
    ctx.fillRect(x + 9, y - 18, 6, 8);

    // Napis
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('👑 KRÓL ZOMBIE', x, y - 110);

    // Instrukcja
    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    ctx.fillText('Zabij bossa aby ukończyć poziom!', x, y + 110);
}

// === FAZA 2 - gdy zbroja zniszczona ===
function startBossPhase2() {
    bossPhase2Started = true;
    // Boss staje się silniejszy
    if (castleBoss) {
        castleBoss.hp = 4000;
        castleBoss.maxHp = 4000;
        castleBoss.speed = 2.0;
        castleBoss.phase2 = true;
        castleBoss.color = '#4a0000';
    }
    // Nowi wrogowie elitarni na arenie
    for (var i = 0; i < 6; i++) {
        var ex = 150 + Math.random() * (ARENA_W - 300);
        var ey = 150 + Math.random() * (ARENA_H - 300);
        enemies.push({
            x: ex, y: ey, w: 45, h: 55,
            hp: 300, maxHp: 300,
            speed: 2.5,
            attackCooldown: 0,
            dir: Math.random() * Math.PI * 2,
            changeDir: 0,
            color: '#b71c1c',
            hasBow: true,
            type: 'elite',
            elite: true
        });
    }
    // Komunikat na ekranie
    phase2Message = { timer: 180 }; // 3 sekundy przy 60fps
}

// === NAPISY KOŃCOWE ===
function showCredits() {
    gameRunning = false;
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('superBtn').style.display = 'none';
    var screen = document.getElementById('creditsScreen');
    screen.style.display = 'flex';
    var content = document.getElementById('creditsContent');
    content.style.transform = 'translateY(100vh)';
    var startTime = null;
    function scrollCredits(ts) {
        if (!startTime) startTime = ts;
        var progress = (ts - startTime) / 15000; // 15 sekund
        var translateY = 100 - progress * 220;
        content.style.transform = 'translateY(' + translateY + 'vh)';
        if (progress < 1.3) {
            requestAnimationFrame(scrollCredits);
        }
    }
    requestAnimationFrame(scrollCredits);
}

function restartFromCredits() {
    document.getElementById('creditsScreen').style.display = 'none';
    setArenaLevel(1);
    coins = Math.max(0, coins);
    saveGame();
    document.getElementById('lobby').style.display = 'flex';
    drawLobbyCharacter();
    drawLobbyBackground();
}

function getUpgradeLevel(index) {
    // Zwróć poziom ulepszenia dla aktualnie wybranej postaci
    initCharacterUpgrades(selectedCharacter);
    var upgrades = characterUpgrades[selectedCharacter];
    return upgrades[index] || 1;
}

function startGame() {
  try {
    document.getElementById('lobby').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';
    document.getElementById('superBtn').style.display = 'block';
    canvas = document.getElementById('arenaCanvas');
    ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    var hpLevel = getUpgradeLevel(0);
    var atkLevel = getUpgradeLevel(1);
    var spdLevel = getUpgradeLevel(2);

    player.maxHp = 100 + (hpLevel - 1) * 20;
    player.attackDamage = 20 + (atkLevel - 1) * 5;
    player.speed = 3 + (spdLevel - 1) * 0.4;

    player.x = 400;
    player.y = 400;
    player.hp = player.maxHp;
    player.superCharge = 0;
    player.isSupering = false;
    player.superReady = false;
    player.attackCooldown = 0;
    player.skin = currentSkin;
    player.character = selectedCharacter;
    player.blackHole = null;

    attacks = [];
    particles = [];
    damageTexts = [];
    gameMode = 'arena';
    gamePaused = false;
    initArena();
    gameRunning = true;
    updateSuperBtn();
    gameLoop();
  } catch(err) {
    alert('Błąd: ' + err.message);
  }
}

var gameMode = 'arena';
var gamePaused = false;

function togglePause() {
    gamePaused = !gamePaused;
    var overlay = document.getElementById('pauseOverlay');
    var btn = document.getElementById('pauseBtn');
    if (gamePaused) {
        overlay.style.display = 'flex';
        btn.textContent = '▶';
    } else {
        overlay.style.display = 'none';
        btn.textContent = '⏸';
        gameLoop();
    }
}

function backToLobby() {
    gameRunning = false;
    // Przywróć poprzednią postać po treningu
    if (previousCharacter) {
        selectedCharacter = previousCharacter;
        previousCharacter = null;
    }
    gameMode = 'arena';
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('superBtn').style.display = 'none';
    document.getElementById('lobby').style.display = 'flex';
    // Odśwież postać w lobby
    document.getElementById('selectedInfo').textContent = '🎮 Wybrana postać: ' + selectedCharacter;
    drawLobbyCharacter();
    drawLobbyBackground();
    saveGame();
}

// === HANDLERY INPUT ===
document.addEventListener('keydown', function(e) {
    keys[e.key.toLowerCase()] = true;
    if (e.key === ' ' && gameRunning && !castleBoss) {
        e.preventDefault();
        useSuper();
    }
    if (e.key === 'Escape' && gameRunning) {
        togglePause();
    }
    // Dialog z bossem - ENTER
    if (e.key === 'Enter' && gameRunning && castleBoss && !bossDialogShown) {
        bossDialogStep++;
        if (bossDialogStep >= bossDialogs.length) {
            bossDialogShown = true;
        }
    }
});
document.addEventListener('keyup', function(e) { keys[e.key.toLowerCase()] = false; });
document.addEventListener('mousemove', function(e) { mouse.x = e.clientX; mouse.y = e.clientY; });
document.addEventListener('click', function(e) {
    if (!gameRunning || e.target.id === 'superBtn') return;
    if (player.superReady) {
        launchSuper();
    } else if (!player.isSupering) {
        playerAttack();
    }
});

// === GŁÓWNA PĘTLA GRY ===
function gameLoop() {
    if (!gameRunning || gamePaused) return;

    updatePlayer();
    updateEnemies();
    updateAttacks();
    updateParticles();

    // === SPRAWDŹ AKUMULATORY ===
    if (arenaLevel >= 100 && bossHasArmor && accumulators.length > 0) {
        var allDestroyed = true;
        for (var ai = 0; ai < accumulators.length; ai++) {
            if (accumulators[ai].active) { allDestroyed = false; break; }
        }
        if (allDestroyed) {
            bossHasArmor = false;
            startBossPhase2();
        }
    }
    if (phase2Message) {
        phase2Message.timer--;
        if (phase2Message.timer <= 0) phase2Message = null;
    }

    // === SPRAWDŹ CZY BOSS ZGINĄŁ (przy normalnej walce - ze zbroją) ===
    if (castleBoss && castleBoss.hp <= 0 && !bossPhase2Started) {
        // Gracz pokonał bossa normalnie (przez zbroję) → napisy końcowe
        for (var p = 0; p < 40; p++) {
            particles.push({ x: castleBoss.x, y: castleBoss.y, vx: (Math.random()-0.5)*12, vy: (Math.random()-0.5)*12, life: 50, color: '#ffd700' });
        }
        coins += 300;
        trophies += 50;
        updateCoins();
        updateTrophies();
        saveGame();
        castleBoss = null;
        showCredits();
        return;
    }
    // Boss zginął po fazie 2 (zbroja zniszczona wcześniej)
    if (castleBoss && castleBoss.hp <= 0 && bossPhase2Started) {
        for (var p = 0; p < 60; p++) {
            particles.push({ x: castleBoss.x, y: castleBoss.y, vx: (Math.random()-0.5)*14, vy: (Math.random()-0.5)*14, life: 60, color: '#ff1744' });
        }
        coins += 500;
        trophies += 100;
        updateCoins();
        updateTrophies();
        saveGame();
        castleBoss = null;
        showCredits();
        return;
    }

    // === WARUNKI WYGRANEJ / PRZEGRANEJ ===

    if (gameMode === 'training' || gameMode === 'training-match') {
        // Tryb treningowy - nie ma wygranej
        if (gameMode === 'training' && enemies.length === 0) {
            // Arena treningowa - odradź roboty
            for (var i = 0; i < 5; i++) {
                enemies.push({ x: 200 + i * 180, y: 200 + (i % 2) * 200, w: 40, h: 50, hp: 80, maxHp: 80, speed: 0, attackCooldown: 0, color: '#607d8b', hasBow: false, isRobot: true });
            }
            enemies.push({ x: 900, y: 400, w: 60, h: 80, hp: 300, maxHp: 300, speed: 0, attackCooldown: 0, color: '#37474f', hasBow: false, isRobotBoss: true, chargeTimer: 0, isCharging: false });
        }
        // Mecz treningowy - po prostu nie ma wygranej
    } else {
        // Standardowa arena
        var arenaWon = false;

        // Sprawdź czy arena jest wygrana
        if (enemies.length === 0) {
            // Jeśli jest zamek i poziom >= 100, najpierw przejdź przez zamek
            if (castle && arenaLevel >= 100) {
                if (!inCastle || castleFloor === 0) {
                    // Musisz wejść do zamku
                } else if (castleFloor === 1 && castleEnemies.length > 0) {
                    // Musisz pokonać wrogów na parterze
                } else if (castleFloor === 1 && towerEnemies.length > 0) {
                    // Musisz pokonać wrogów na wieży
                } else {
                    // Pokonano wszystkich wrogów w zamku - boss pokonany!
                    arenaWon = true;
                }
            } else {
                arenaWon = true;
            }
        }

        if (arenaWon) {
            gameRunning = false;
            trophies += 10;
            robuxProgress += 5;

            // Zwiększ poziom areny (max 100)
            if (gameMode === 'arena') {
                setArenaLevel(arenaLevel + 1);
            }

            updateTrophies();
            updateRobux();
            saveGame();
            // Pytanie o nagrodę
            giveReward();
            return;
        }
    }

    // Śmierć gracza
    if (player.hp <= 0) {
        gameRunning = false;
        if (gameMode === 'training' || gameMode === 'training-match') {
            backToLobby();
        } else {
            saveGame();
            alert('💀 Zginąłeś! Nie dostajesz nagród.');
            backToLobby();
        }
        return;
    }

    // Rysowanie (powinno być w rendering/game.js)
    if (typeof drawArena === 'function') {
        drawArena();
    }
    
    requestAnimationFrame(gameLoop);
}
