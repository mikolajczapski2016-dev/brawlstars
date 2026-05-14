// ============ FUNKCJE PIŁKI NOŻNEJ ============

var ballHolder = null; // kto trzyma piłkę: null, 'player', allyIndex, enemyIndex

function startFootball() {
    try {
        gameMode = 'football';
        footballScore = { player: 0, enemy: 0 };
        footballAllies = [];
        footballRespawns = [];

        document.getElementById('lobby').style.display = 'none';
        document.getElementById('gameScreen').style.display = 'block';
        document.getElementById('superBtn').style.display = 'block';
        canvas = document.getElementById('arenaCanvas');
        ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Inicjalizacja 3D
        initArena3D();

        // Ustaw gracza (bramkarz/napastnik)
        var hpLevel = getUpgradeLevel(0);
        var atkLevel = getUpgradeLevel(1);
        var spdLevel = getUpgradeLevel(2);
        player.maxHp = (adminSettings.playerHp > 0) ? adminSettings.playerHp : (100 + (hpLevel - 1) * 20);
        player.attackDamage = (adminSettings.playerDamage > 0) ? adminSettings.playerDamage : (20 + (atkLevel - 1) * 5);
        player.speed = 3 + (spdLevel - 1) * 0.4;
        player.x = 150;
        player.y = ARENA_H / 2;
        player.hp = player.maxHp;
        player.superCharge = 0;
        player.isSupering = false;
        player.superReady = false;
        player.attackCooldown = 0;
        player.skin = currentSkin;
        player.character = selectedCharacter;
        player.team = 'player';
        player.respawnTimer = 0;
        player.blackHole = null;
        player.isDashing = false;

        // Piłka na środku
        footballBall = { x: ARENA_W / 2, y: ARENA_H / 2, vx: 0, vy: 0, radius: 15 };

        // 2 SOJUSZNIKÓW (AI) - niebiescy
        footballAllies = [];
        for (var i = 0; i < 2; i++) {
            footballAllies.push({
                x: 250 + i * 100,
                y: 200 + i * 250,
                hp: 80,
                maxHp: 80,
                speed: 2.8,
                color: '#2196f3', // niebiescy
                attackCooldown: 0,
                dir: 0,
                team: 'player',
                respawnTimer: 0,
                isDead: false
            });
        }

        // 3 PRZECIWNIKÓW (AI) - czerwoni
        enemies = [];
        for (var i = 0; i < 3; i++) {
            enemies.push({
                x: ARENA_W - 200 - i * 80,
                y: 150 + i * 250,
                hp: 80,
                maxHp: 80,
                speed: 2.5,
                color: '#e53935', // czerwoni
                attackCooldown: 0,
                dir: Math.PI,
                team: 'enemy',
                respawnTimer: 0,
                isDead: false
            });
        }

        // Ściany - boisko z bramkami
        walls = [
            { x: 0, y: -50, w: ARENA_W, h: 50 },
            { x: 0, y: ARENA_H, w: ARENA_W, h: 50 }
        ];

        attacks = [];
        particles = [];
        damageTexts = [];
        gameRunning = true;
        updateSuperBtn();
        gameLoop();
    } catch(err) {
        alert('Błąd startFootball: ' + err.message);
    }
}

function updateFootball() {
    if (!footballBall) return;

    // === RESPAWN ===
    // Gracz respawn
    if (player.hp <= 0 && player.respawnTimer <= 0) {
        player.respawnTimer = 180; // 3 sekundy
    }
    if (player.respawnTimer > 0) {
        player.respawnTimer--;
        if (player.respawnTimer === 0) {
            // Respawn w lewej bramce
            player.x = 50;
            player.y = ARENA_H / 2;
            player.hp = player.maxHp;
            if (ballHolder === 'player') ballHolder = null; // upuszczamy piłkę
        }
        return; // gracz martwy - nie rusza się
    }

    // Sojusznicy respawn
    for (var i = 0; i < footballAllies.length; i++) {
        var ally = footballAllies[i];
        if (ally.hp <= 0 && ally.respawnTimer <= 0) {
            ally.respawnTimer = 180;
            ally.isDead = true;
        }
        if (ally.respawnTimer > 0) {
            ally.respawnTimer--;
            if (ally.respawnTimer === 0) {
                ally.x = 50;
                ally.y = ARENA_H / 2 + (i === 0 ? -50 : 50);
                ally.hp = ally.maxHp;
                ally.isDead = false;
                if (ballHolder === 'ally' + i) ballHolder = null;
            }
        }
    }

    // Wrogowie respawn
    for (var i = 0; i < enemies.length; i++) {
        var e = enemies[i];
        if (e.hp <= 0 && e.respawnTimer <= 0) {
            e.respawnTimer = 180;
            e.isDead = true;
        }
        if (e.respawnTimer > 0) {
            e.respawnTimer--;
            if (e.respawnTimer === 0) {
                e.x = ARENA_W - 50;
                e.y = ARENA_H / 2 + (i === 0 ? -60 : i === 1 ? 0 : 60);
                e.hp = e.maxHp;
                e.isDead = false;
                if (ballHolder === 'enemy' + i) ballHolder = null;
            }
        }
    }

    // === TRZYMANIE PIŁKI ===
    // Jeśli nikt nie trzyma - sprawdź kto może podnieść
    if (ballHolder === null && footballBall) {
        // Gracz może podnieść? (zwiększona odległość do 60)
        var pdx = player.x - footballBall.x;
        var pdy = player.y - footballBall.y;
        var pdist = Math.sqrt(pdx*pdx + pdy*pdy);
        if (pdist < 60 && player.respawnTimer <= 0 && player.hp > 0) {
            ballHolder = 'player';
        }
        // Sojusznicy
        for (var i = 0; i < footballAllies.length; i++) {
            var ally = footballAllies[i];
            if (ally.isDead) continue;
            var adx = ally.x - footballBall.x;
            var ady = ally.y - footballBall.y;
            if (Math.sqrt(adx*adx + ady*ady) < 60) {
                ballHolder = 'ally' + i;
            }
        }
        // Wrogowie
        for (var i = 0; i < enemies.length; i++) {
            var e = enemies[i];
            if (e.isDead) continue;
            var edx = e.x - footballBall.x;
            var edy = e.y - footballBall.y;
            if (Math.sqrt(edx*edx + edy*edy) < 60) {
                ballHolder = 'enemy' + i;
            }
        }
    }

    // Pozycja piłki przy trzymającym
    if (!footballBall) {
        // Nic nie rób gdy piłki nie ma
    } else if (ballHolder === 'player') {
        footballBall.x = player.x;
        footballBall.y = player.y;
    } else if (ballHolder && ballHolder.startsWith('ally')) {
        var idx = parseInt(ballHolder.replace('ally', ''));
        if (footballAllies[idx]) {
            footballBall.x = footballAllies[idx].x;
            footballBall.y = footballAllies[idx].y;
        }
    } else if (ballHolder && ballHolder.startsWith('enemy')) {
        var idx = parseInt(ballHolder.replace('enemy', ''));
        if (enemies[idx]) {
            footballBall.x = enemies[idx].x;
            footballBall.y = enemies[idx].y;
        }
    } else {
        // Piłka wolna - tarcie i ruch
        footballBall.vx *= 0.98;
        footballBall.vy *= 0.98;
        if (Math.abs(footballBall.vx) < 0.1) footballBall.vx = 0;
        if (Math.abs(footballBall.vy) < 0.1) footballBall.vy = 0;
        footballBall.x += footballBall.vx;
        footballBall.y += footballBall.vy;

        // Granice boiska
        if (footballBall.y < footballBall.radius) {
            footballBall.y = footballBall.radius;
            footballBall.vy *= -0.8;
        }
        if (footballBall.y > ARENA_H - footballBall.radius) {
            footballBall.y = ARENA_H - footballBall.radius;
            footballBall.vy *= -0.8;
        }
    }

    // === BRAMKI ===
    if (!footballBall) return; // zabezpieczenie na wypadek gdyby piłka była undefined

    // Lewa bramka (wrogowie strzelają tu)
    if (footballBall.x < 30) {
        if (footballBall.y > ARENA_H/2 - 60 && footballBall.y < ARENA_H/2 + 60) {
            footballScore.enemy++;
            ballHolder = null;
            resetFootballBall();
            alert('😞 GOL przeciwnika! ' + footballScore.player + ':' + footballScore.enemy);
        } else {
            footballBall.x = 30;
            footballBall.vx *= -0.8;
        }
    }
    // Prawa bramka (gracze strzelają tu)
    if (footballBall.x > ARENA_W - 30) {
        if (footballBall.y > ARENA_H/2 - 60 && footballBall.y < ARENA_H/2 + 60) {
            footballScore.player++;
            ballHolder = null;
            resetFootballBall();
            alert('⚽ GOL! ' + footballScore.player + ':' + footballScore.enemy);
        } else {
            footballBall.x = ARENA_W - 30;
            footballBall.vx *= -0.8;
        }
    }

    // === AI SOJUSZNIKÓW ===
    updateFootballAI(footballAllies, 'player');
    // === AI WROGÓW ===
    updateFootballAI(enemies, 'enemy');
}

function shootBall(direction, power) {
    if (ballHolder !== 'player') return; // tylko gracz może strzelać na komendę
    if (!footballBall) return; // zabezpieczenie
    ballHolder = null; // upuszczamy piłkę
    footballBall.vx = Math.cos(direction) * power;
    footballBall.vy = Math.sin(direction) * power;
}

function updateFootballAI(bots, team) {
    if (!footballBall) return; // zabezpieczenie gdy piłka nie istnieje

    for (var i = 0; i < bots.length; i++) {
        var bot = bots[i];
        if (bot.isDead) continue;

        var holderKey = team === 'player' ? 'ally' + i : 'enemy' + i;
        var goalX = team === 'player' ? ARENA_W - 30 : 30;
        var goalY = ARENA_H / 2;

        // Domyślnie goni piłkę
        var targetX = footballBall.x;
        var targetY = footballBall.y;

        // Jeśli JA trzymam piłkę - idź do bramki przeciwnika!
        if (ballHolder === holderKey) {
            targetX = goalX;
            targetY = goalY;
        }
        // Jeśli wrogowie mają piłkę - cofaj się do bramki (obrona)
        else if (ballHolder && ballHolder.startsWith('player') && team === 'enemy') {
            targetX = ARENA_W - 100;
            targetY = ARENA_H / 2;
        }
        // Jeśli sojusznicy mają piłkę - atakuj (przesuń się do przodu)
        else if (ballHolder && ballHolder.startsWith('enemy') && team === 'player') {
            targetX = ARENA_W - 50;
            targetY = ARENA_H / 2;
        }

        var dx = targetX - bot.x;
        var dy = targetY - bot.y;
        var dist = Math.sqrt(dx*dx + dy*dy);

        if (dist > 10) {
            bot.x += (dx / dist) * bot.speed;
            bot.y += (dy / dist) * bot.speed;
        }

        // Boty strzelają gdy mają piłkę i są blisko bramki
        if (ballHolder === holderKey) {
            var distToGoal = Math.sqrt((goalX - bot.x)**2 + (goalY - bot.y)**2);

            if (distToGoal < 250 && Math.random() < 0.08) {
                // Strzał w bramkę - ZAWSZE strzelaj gdy blisko!
                ballHolder = null;
                if (footballBall) {
                    var angle = Math.atan2(goalY - bot.y, goalX - bot.x);
                    footballBall.vx = Math.cos(angle) * 22;
                    footballBall.vy = Math.sin(angle) * 22 + (Math.random()-0.5)*4; // lekki rozrzut
                }
            }
        }
    }
}

function resetFootballBall() {
    if (!footballBall) {
        // Przywróć piłkę jeśli została usunięta
        footballBall = { x: ARENA_W / 2, y: ARENA_H / 2, vx: 0, vy: 0, radius: 15 };
    } else {
        footballBall.x = ARENA_W / 2;
        footballBall.y = ARENA_H / 2;
        footballBall.vx = 0;
        footballBall.vy = 0;
    }
}
