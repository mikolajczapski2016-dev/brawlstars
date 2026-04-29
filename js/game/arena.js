// ============ ZMIENNE STANU GRY ============

var canvas, ctx;
var gameRunning = false;
var keys = {};
var mouse = { x: 0, y: 0 };
var mobileMove = { x: 0, y: 0, active: false };
var mobileAim = { x: 0, y: 0, active: false };

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
var bossFloor0 = null;
var castleFloor = 0;
var bossFloor1 = null;
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

// === ZNAJDŹ WOLNE MIEJSCE (nie w ścianie ani krzewie) ===
function findFreePosition() {
    for (var tries = 0; tries < 100; tries++) {
        var fx = 50 + Math.random() * (ARENA_W - 100);
        var fy = 50 + Math.random() * (ARENA_H - 100);
        var valid = true;
        for (var i = 0; i < walls.length; i++) {
            if (rectsOverlap(fx - 20, fy - 25, 40, 50, walls[i].x, walls[i].y, walls[i].w, walls[i].h)) {
                valid = false; break;
            }
        }
        if (valid) {
            for (var i = 0; i < bushes.length; i++) {
                if (rectsOverlap(fx - 20, fy - 25, 40, 50, bushes[i].x, bushes[i].y, bushes[i].w, bushes[i].h)) {
                    valid = false; break;
                }
            }
        }
        if (valid) return { x: fx, y: fy };
    }
    // Fallback - środek areny (zazwyczaj wolny)
    return { x: ARENA_W / 2, y: ARENA_H / 2 };
}

function initArena() {
    // Ładuj poziom areny
    arenaLevel = getArenaLevel();

    // Sciany - wyrównane do kratek 50x50
    walls = [
        { x: 50, y: 50, w: 100, h: 100 },
        { x: 200, y: 50, w: 100, h: 50 },
        { x: 350, y: 50, w: 100, h: 100 },
        { x: 500, y: 50, w: 50, h: 100 },
        { x: 600, y: 50, w: 100, h: 100 },
        { x: 700, y: 50, w: 50, h: 100 },
        { x: 800, y: 50, w: 100, h: 50 },
        { x: 950, y: 50, w: 100, h: 50 },
        { x: 1100, y: 50, w: 50, h: 50 },
        { x: 250, y: 300, w: 100, h: 50 },
        { x: 400, y: 300, w: 50, h: 100 },
        { x: 600, y: 300, w: 100, h: 50 },
        { x: 750, y: 300, w: 100, h: 50 },
        { x: 950, y: 600, w: 50, h: 50 },
    ];
    // Krzewy - wyrównane do kratek 50x50
    bushes = [
        { x: 100, y: 300, w: 50, h: 50 },
        { x: 450, y: 200, w: 50, h: 50 },
        { x: 750, y: 600, w: 50, h: 50 },
        { x: 300, y: 700, w: 50, h: 50 },
        { x: 900, y: 150, w: 50, h: 50 },
        { x: 550, y: 500, w: 50, h: 50 },
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
    bossFloor0 = null;
    bossFloor1 = null;
    castleBoss = null;

    if (arenaLevel >= 90) {
        // Stwórz zamek po prawej stronie areny
        castle = {
            x: ARENA_W - 200,
            y: ARENA_H / 2 - 150,
            w: 180,
            h: 300,
            doorOpen: false,
            towerX: ARENA_W - 200,
            towerY: ARENA_H / 2 - 150 - 120,
            towerW: 80,
            towerH: 120,
            ladderY: ARENA_H / 2 + 80
        };

        // Od poziomu 90 dodaj 3 bossów w zamku
        if (arenaLevel >= 90) {
            var hpScale = 1 + (arenaLevel - 90) * 0.15;

            // Piętro 0 - Sługus (najsłabszy boss)
            bossFloor0 = {
                x: castle.x + castle.w / 2,
                y: castle.y + castle.h / 2,
                w: 50, h: 65,
                hp: Math.floor(600 * hpScale),
                maxHp: Math.floor(600 * hpScale),
                speed: 0.8,
                attackCooldown: 0,
                dir: 0,
                changeDir: 0,
                color: '#5d4037',
                type: 'bossFloor0',
                name: 'Sługus',
                damage: 8
            };

            // Piętro 1 - Generał Zła (średni boss)
            bossFloor1 = {
                x: castle.towerX + castle.towerW / 2,
                y: castle.towerY + castle.towerH / 2,
                w: 60, h: 75,
                hp: Math.floor(1500 * hpScale),
                maxHp: Math.floor(1500 * hpScale),
                speed: 1.0,
                attackCooldown: 0,
                dir: 0,
                changeDir: 0,
                color: '#4a148c',
                type: 'bossFloor1',
                name: 'Generał Zła',
                damage: 18
            };

            // Piętro 2 - Król Ciemności (najsilniejszy boss)
            bossDialogShown = false;
            bossDialogStep = 0;
            castleBoss = {
                x: castle.towerX + castle.towerW / 2,
                y: castle.towerY - 60,
                w: 80, h: 100,
                hp: Math.floor(2500 * hpScale),
                maxHp: Math.floor(2500 * hpScale),
                speed: 0.8,
                attackCooldown: 0,
                dir: 0,
                changeDir: 0,
                color: '#1a0000',
                type: 'boss',
                name: 'Król Ciemności',
                damage: 25
            };

            // 4 akumulatory zasilające zbroję tylko na poziomie 100
            if (arenaLevel >= 100) {
                bossHasArmor = true;
                var roomCenterX = canvas.width / 2;
                var roomCenterY = canvas.height / 2 - 50;
                accumulators = [
                    { x: roomCenterX - 220, y: roomCenterY - 120, hp: 400, maxHp: 400, active: true, pulse: 0 },
                    { x: roomCenterX + 220, y: roomCenterY - 120, hp: 400, maxHp: 400, active: true, pulse: 0 },
                    { x: roomCenterX - 220, y: roomCenterY + 120, hp: 400, maxHp: 400, active: true, pulse: 0 },
                    { x: roomCenterX + 220, y: roomCenterY + 120, hp: 400, maxHp: 400, active: true, pulse: 0 }
                ];
            }
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
    if (typeof updateLobbyCharacter3D === 'function') updateLobbyCharacter3D();
    drawLobbyCharacter();
    drawLobbyBackground();
}

function getUpgradeLevel(index) {
    // Zwróć poziom ulepszenia dla aktualnie wybranej postaci
    initCharacterUpgrades(selectedCharacter);
    var upgrades = characterUpgrades[selectedCharacter];
    return upgrades[index] || 1;
}

function resizeArenaCanvas() {
    if (!canvas) return;
    var gameScreen = document.getElementById('gameScreen');
    var width = (gameScreen && gameScreen.clientWidth) || window.innerWidth;
    var height = (gameScreen && gameScreen.clientHeight) || window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}

function startGame() {
  try {
    document.getElementById('lobby').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';
    document.getElementById('superBtn').style.display = 'block';
    canvas = document.getElementById('arenaCanvas');
    ctx = canvas.getContext('2d');
    resizeArenaCanvas();

    // Inicjalizacja 3D
    initArena3D();

    var hpLevel = getUpgradeLevel(0);
    var atkLevel = getUpgradeLevel(1);
    var spdLevel = getUpgradeLevel(2);

    player.maxHp = (adminSettings.playerHp > 0) ? adminSettings.playerHp : (100 + (hpLevel - 1) * 20);
    player.attackDamage = (adminSettings.playerDamage > 0) ? adminSettings.playerDamage : (20 + (atkLevel - 1) * 5);
    player.speed = 3 + (spdLevel - 1) * 0.4;

    attacks = [];
    particles = [];
    damageTexts = [];
    gameMode = 'arena';
    gamePaused = false;
    initArena();

    // Ustaw gracza na wolnym miejscu (nie w ścianie!)
    var spawnPos = findFreePosition();
    player.x = spawnPos.x;
    player.y = spawnPos.y;
    player.hp = player.maxHp;
    player.superCharge = 0;
    player.isSupering = false;
    player.superReady = false;
    player.attackCooldown = 0;
    player.skin = currentSkin;
    player.character = selectedCharacter;
    player.blackHole = null;
    player.isDashing = false;

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
    if (typeof updateLobbyCharacter3D === 'function') updateLobbyCharacter3D();
    drawLobbyCharacter();
    drawLobbyBackground();
    saveGame();
    // Wyczyść scenę 3D
    disposeArena3D();
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
    if (!gameRunning || gamePaused || e.target.id === 'superBtn' || e.target.id === 'pauseBtn' || isMobileControlElement(e.target)) return;
    if (player.superReady) {
        launchSuper();
    } else if (!player.isSupering) {
        playerAttack();
    }
});

// === KONTROLKI MOBILNE ===
var joystickPointerId = null;
var aimPointerId = null;
var joystickCenter = { x: 0, y: 0 };
var joystickMaxDistance = 1;

function updateJoystickKnob(dx, dy) {
    var knob = document.getElementById('joystickKnob');
    if (!knob) return;
    knob.style.transform = 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px))';
}

function resetJoystickKnob() {
    var knob = document.getElementById('joystickKnob');
    if (knob) knob.style.transform = 'translate(-50%, -50%)';
}

function resetMobileMove() {
    mobileMove.x = 0;
    mobileMove.y = 0;
    mobileMove.active = false;
    resetJoystickKnob();
}

function updateMobileMove(clientX, clientY) {
    var dx = clientX - joystickCenter.x;
    var dy = clientY - joystickCenter.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    var max = joystickMaxDistance || 1;
    var limited = Math.min(dist, max);
    var nx = dist > 0 ? dx / dist : 0;
    var ny = dist > 0 ? dy / dist : 0;
    updateJoystickKnob(nx * limited, ny * limited);
    mobileMove.x = nx * Math.min(1, dist / max);
    mobileMove.y = ny * Math.min(1, dist / max);
    mobileMove.active = dist > 8;
}

function isMobileControlElement(el) {
    while (el) {
        if (el.id === 'mobileControls' || el.id === 'joystickArea' || el.id === 'joystickKnob' || el.id === 'fireBtn' || el.id === 'superMobileBtn') return true;
        el = el.parentElement;
    }
    return false;
}

function setAimWorldTarget(x, y) {
    mouse.x = x - camera.x;
    mouse.y = y - camera.y;
    if (typeof mouseWorld3D !== 'undefined') {
        mouseWorld3D.x = x;
        mouseWorld3D.z = y;
    }
}

function aimAtNearestEnemy() {
    if (!gameRunning || mobileAim.active) return;
    var best = null;
    var bestDist = Infinity;
    for (var i = 0; i < enemies.length; i++) {
        var e = enemies[i];
        if (!e || e.hp <= 0) continue;
        var dx = e.x - player.x;
        var dy = e.y - player.y;
        var dist = dx * dx + dy * dy;
        if (dist < bestDist) {
            best = e;
            bestDist = dist;
        }
    }
    if (best) {
        setAimWorldTarget(best.x, best.y);
    } else if (mobileMove.active) {
        setAimWorldTarget(player.x + mobileMove.x * 160, player.y + mobileMove.y * 160);
    }
}

function initMobileControls() {
    var joystickArea = document.getElementById('joystickArea');
    var fireBtn = document.getElementById('fireBtn');
    var superMobileBtn = document.getElementById('superMobileBtn');
    var gameScreen = document.getElementById('gameScreen');

    if (joystickArea) {
        joystickArea.addEventListener('pointerdown', function(e) {
            e.preventDefault();
            if (joystickPointerId !== null) return;
            joystickPointerId = e.pointerId;
            joystickArea.setPointerCapture(e.pointerId);
            var rect = joystickArea.getBoundingClientRect();
            joystickCenter.x = rect.left + rect.width / 2;
            joystickCenter.y = rect.top + rect.height / 2;
            joystickMaxDistance = rect.width * 0.32;
            updateMobileMove(e.clientX, e.clientY);
        });

        joystickArea.addEventListener('pointermove', function(e) {
            if (e.pointerId !== joystickPointerId) return;
            e.preventDefault();
            updateMobileMove(e.clientX, e.clientY);
        });

        function stopJoystick(e) {
            if (e.pointerId !== joystickPointerId) return;
            joystickPointerId = null;
            resetMobileMove();
        }
        joystickArea.addEventListener('pointerup', stopJoystick);
        joystickArea.addEventListener('pointercancel', stopJoystick);
    }

    if (gameScreen) {
        gameScreen.addEventListener('pointerdown', function(e) {
            if (!gameRunning || isMobileControlElement(e.target)) return;
            aimPointerId = e.pointerId;
            mobileAim.active = true;
            mobileAim.x = e.clientX;
            mobileAim.y = e.clientY;
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        gameScreen.addEventListener('pointermove', function(e) {
            if (!gameRunning || e.pointerId !== aimPointerId || isMobileControlElement(e.target)) return;
            mobileAim.x = e.clientX;
            mobileAim.y = e.clientY;
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        function stopAim(e) {
            if (e.pointerId !== aimPointerId) return;
            aimPointerId = null;
            mobileAim.active = false;
        }
        gameScreen.addEventListener('pointerup', stopAim);
        gameScreen.addEventListener('pointercancel', stopAim);
    }

    if (fireBtn) {
        fireBtn.addEventListener('pointerdown', function(e) {
            e.preventDefault();
            e.stopPropagation();
            fireBtn.classList.add('active');
            if (!gameRunning) return;
            aimAtNearestEnemy();
            if (player.superReady) {
                launchSuper();
            } else if (!player.isSupering) {
                playerAttack();
            }
        });

        fireBtn.addEventListener('pointerup', function(e) {
            e.preventDefault();
            fireBtn.classList.remove('active');
        });
        fireBtn.addEventListener('pointercancel', function() {
            fireBtn.classList.remove('active');
        });
    }

    if (superMobileBtn) {
        superMobileBtn.addEventListener('pointerdown', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (!gameRunning || superMobileBtn.disabled) return;
            superMobileBtn.classList.add('active');
            aimAtNearestEnemy();
            useSuper();
        });
        superMobileBtn.addEventListener('pointerup', function() {
            superMobileBtn.classList.remove('active');
        });
        superMobileBtn.addEventListener('pointercancel', function() {
            superMobileBtn.classList.remove('active');
        });
    }
}

initMobileControls();

// === GŁÓWNA PĘTLA GRY ===
function gameLoop() {
    if (!gameRunning || gamePaused) return;

    updatePlayer();
    updateEnemies();
    updateAttacks();
    updateSuperBtn();
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

    // === ŚMIERĆ BOSSÓW PIĘTER 0 I 1 ===
    if (bossFloor0 && bossFloor0.hp <= 0) {
        for (var p = 0; p < 15; p++) {
            particles.push({ x: bossFloor0.x, y: bossFloor0.y, vx: (Math.random()-0.5)*8, vy: (Math.random()-0.5)*8, life: 40, color: '#5d4037' });
        }
        coins += 50;
        updateCoins();
        bossFloor0 = null;
    }
    if (bossFloor1 && bossFloor1.hp <= 0) {
        for (var p = 0; p < 20; p++) {
            particles.push({ x: bossFloor1.x, y: bossFloor1.y, vx: (Math.random()-0.5)*10, vy: (Math.random()-0.5)*10, life: 45, color: '#9c27b0' });
        }
        coins += 100;
        updateCoins();
        bossFloor1 = null;
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
        if (arenaLevel >= 100) {
            showCredits();
            return;
        }
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
        if (arenaLevel >= 100) {
            showCredits();
            return;
        }
    }

    // === OTWÓRZ ZAMEK GDY WSZYSCY WRGOWIE NA ARENIE ZGINLI ===
    if (castle && !castle.doorOpen && enemies.length === 0) {
        castle.doorOpen = true;
        // Efekt otwarcia drzwi
        for (var p = 0; p < 20; p++) {
            particles.push({ x: castle.x + castle.w/2, y: castle.y + castle.h, vx: (Math.random()-0.5)*4, vy: (Math.random()-0.5)*4, life: 30, color: '#ffd700' });
        }
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
            // Jeśli jest zamek i poziom >= 90, najpierw przejdź przez zamek
            if (castle && arenaLevel >= 90) {
                if (!inCastle) {
                    // Musisz wejść do zamku
                } else if (castleFloor === 0) {
                    // Musisz pokonać bossa na parterze
                } else if (castleFloor === 1) {
                    // Musisz pokonać bossa na piętrze 1
                } else if (castleFloor === 2 && castleBoss && castleBoss.hp > 0) {
                    // Musisz pokonać Króla Ciemności na piętrze 2
                } else {
                    // Pokonano wszystkich bossów w zamku - wygrana!
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

    // Aktualizuj kamerę 2D (potrzebna dla damageTexts i ewentualnego fallbacku)
    if (player && canvas) {
        camera.x = player.x - canvas.width / 2;
        camera.y = player.y - canvas.height / 2;
        if (!inCastle) {
            camera.x = Math.max(0, Math.min(ARENA_W - canvas.width, camera.x));
            camera.y = Math.max(0, Math.min(ARENA_H - canvas.height, camera.y));
        }
    }

    // Rendering 3D (lub fallback 2D)
    var rendered3D = false;
    if (typeof renderArena3D === 'function') {
        renderArena3D();
        // Sprawdź czy faktycznie zrenderowaliśmy 3D (czy nie było fallbacku)
        rendered3D = (typeof use3D !== 'undefined' && use3D && typeof renderer3d !== 'undefined' && renderer3d);
    } else if (typeof drawArena === 'function') {
        drawArena();
    }

    // Jeśli 3D było aktywne — czyść canvas 2D overlay i rysuj damage texts + UI
    if (rendered3D && ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Teksty obrażeń (damage texts)
        for (var i = 0; i < damageTexts.length; i++) {
            var dt = damageTexts[i];
            ctx.globalAlpha = dt.life / 30;
            ctx.fillStyle = dt.color;
            ctx.font = 'bold 18px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(dt.text, dt.x - camera.x, dt.y - camera.y);
        }
        ctx.globalAlpha = 1;
    }

    // UI nadal rysujemy na canvas 2D overlay (lub wewnątrz drawArena)
    if (typeof drawUI === 'function') {
        drawUI();
    }

    requestAnimationFrame(gameLoop);
}
