// ============ FUNKCJE TRYBU GNIAZDA ZOMBIE ============

function startNest() {
    try {
        gameMode = 'nest';
        document.getElementById('lobby').style.display = 'none';
        document.getElementById('gameScreen').style.display = 'block';
        document.getElementById('superBtn').style.display = 'block';
        canvas = document.getElementById('arenaCanvas');
        ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Inicjalizacja 3D
        initArena3D();

        // Ustaw gracza
        var hpLevel = getUpgradeLevel(0);
        var atkLevel = getUpgradeLevel(1);
        var spdLevel = getUpgradeLevel(2);
        player.maxHp = 100 + (hpLevel - 1) * 20;
        player.attackDamage = (adminSettings.playerDamage > 0) ? adminSettings.playerDamage : (20 + (atkLevel - 1) * 5);
        player.speed = 3 + (spdLevel - 1) * 0.4;
        player.x = 100;
        player.y = ARENA_H / 2;
        player.hp = player.maxHp;
        player.superCharge = 0;
        player.isSupering = false;
        player.superReady = false;
        player.attackCooldown = 0;
        player.skin = currentSkin;
        player.character = selectedCharacter;
        player.blackHole = null;

        // Gniazdo zombie - na końcu mapy
        nestObject = { x: ARENA_W - 150, y: ARENA_H / 2, hp: 500, maxHp: 500 };
        nestSpawnTimer = 180; // co 3 sekundy spawn

        // Kilka początkowych zombie
        enemies = [];
        for (var i = 0; i < 5; i++) {
            enemies.push(createZombie());
        }

        // Ściany terenu
        walls = [
            { x: 400, y: 200, w: 100, h: 100 },
            { x: 700, y: 500, w: 80, h: 80 },
            { x: 500, y: 600, w: 60, h: 150 }
        ];

        bushes = [];
        attacks = [];
        particles = [];
        damageTexts = [];
        gameRunning = true;
        updateSuperBtn();
        gameLoop();
    } catch(err) {
        alert('Błąd startNest: ' + err.message);
    }
}

// Funkcja createZombie jest w enemies.js

function updateNest() {
    if (!nestObject) return;

    // Spawn zombie co jakiś czas
    nestSpawnTimer--;
    if (nestSpawnTimer <= 0 && enemies.length < 15) {
        enemies.push(createZombie());
        nestSpawnTimer = 180; // co 3 sekundy
    }

    // Kolizja gracza z gniazdem (atak)
    var ndx = player.x - nestObject.x;
    var ndy = player.y - nestObject.y;
    var ndist = Math.sqrt(ndx*ndx + ndy*ndy);
    if (ndist < 60 && player.attackCooldown <= 0 && !player.isSupering) {
        // Auto-atak na gniazdo gdy blisko
        player.attackCooldown = 20;
        nestObject.hp -= player.attackDamage;
        damageTexts.push({ x: nestObject.x, y: nestObject.y - 50, text: '-' + player.attackDamage, life: 30, color: '#ff4444' });
        // Cząsteczki
        for (var p = 0; p < 5; p++) {
            particles.push({
                x: nestObject.x + (Math.random()-0.5)*40,
                y: nestObject.y + (Math.random()-0.5)*40,
                vx: (Math.random()-0.5)*4,
                vy: (Math.random()-0.5)*4,
                life: 20,
                color: '#4a148c'
            });
        }
    }
}
