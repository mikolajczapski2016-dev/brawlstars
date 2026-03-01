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
var castle = null; // Obiekt zamku
var inCastle = false; // Czy gracz jest w zamku
var castleEnemies = []; // Wrogowie w zamku
var castleFloor = 0; // 0 = parter, 1 = wieża
var towerEnemies = []; // Wrogowie na wieży
var castleBoss = null; // Boss w zamku
var bossDialogShown = false; // Czy dialog z bossem się pojawił
var bossDialogStep = 0; // Krok dialogu

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
    initArena();
    gameRunning = true;
    updateSuperBtn();
    gameLoop();
  } catch(err) {
    alert('Błąd: ' + err.message);
  }
}

var gameMode = 'arena';

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
        backToLobby();
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
    if (!gameRunning) return;

    updatePlayer();
    updateEnemies();
    updateAttacks();
    updateParticles();

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
