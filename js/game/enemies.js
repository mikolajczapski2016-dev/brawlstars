// ============ FUNKCJE PRZECIWNIKÓW ============

// === TYPY PRZECIWNIKÓW ===
function createEnemyByLevel() {
    var ex, ey, valid;
    do {
        ex = 50 + Math.random() * (ARENA_W - 100);
        ey = 50 + Math.random() * (ARENA_H - 100);
        valid = true;
        var dx = ex - player.x;
        var dy = ey - player.y;
        if (Math.sqrt(dx*dx + dy*dy) < 150) valid = false;
        for (var j = 0; j < walls.length; j++) {
            if (rectsOverlap(ex-20, ey-25, 40, 50, walls[j].x, walls[j].y, walls[j].w, walls[j].h)) {
                valid = false;
            }
        }
    } while (!valid);

    var enemy;

    if (arenaLevel >= 100) {
        // Boss na poziomie 100
        enemy = createBoss(ex, ey);
    } else if (arenaLevel >= 90) {
        // Czarodzieje od poziomu 90
        if (Math.random() < 0.6) {
            enemy = createWizard(ex, ey);
        } else {
            enemy = createZombieNormal(ex, ey);
        }
    } else {
        // Normalne zombi do poziomu 89
        enemy = createZombieNormal(ex, ey);
    }

    enemies.push(enemy);
}

function createZombieNormal(ex, ey) {
    var hasBow = Math.random() < 0.25; // 25% szans na łuk
    var hpScale = 1 + (arenaLevel - 1) * 0.1; // Skalowanie HP
    return {
        x: ex, y: ey, w: 40, h: 50,
        hp: (hasBow ? 50 : 80) * hpScale,
        maxHp: (hasBow ? 50 : 80) * hpScale,
        speed: hasBow ? 2.2 : 1.2 + Math.random() * 0.8,
        attackCooldown: 0,
        dir: Math.random() * Math.PI * 2,
        changeDir: 0,
        color: hasBow ? '#6a1b9a' : ['#e53935', '#ff6f00', '#9c27b0', '#00897b', '#5d4037'][Math.floor(Math.random()*5)],
        hasBow: hasBow,
        type: 'zombie'
    };
}

function createWizard(ex, ey) {
    var hpScale = 1 + (arenaLevel - 90) * 0.15;
    return {
        x: ex, y: ey, w: 40, h: 50,
        hp: 120 * hpScale,
        maxHp: 120 * hpScale,
        speed: 1.8,
        attackCooldown: 0,
        dir: Math.random() * Math.PI * 2,
        changeDir: 0,
        color: '#9c27b0', // Fioletowy dla czarodzieja
        hasBow: false,
        isWizard: true,
        type: 'wizard'
    };
}

function createBoss(ex, ey) {
    return {
        x: ex, y: ey, w: 80, h: 100,
        hp: 2000,
        maxHp: 2000,
        speed: 0.8,
        attackCooldown: 0,
        dir: Math.random() * Math.PI * 2,
        changeDir: 0,
        color: '#000000', // Czarny boss
        hasBow: false,
        isBoss: true,
        type: 'boss'
    };
}

function spawnEnemy() {
    // Używa systemu poziomów areny
    createEnemyByLevel();
}

// === ZOMBIE DLA TRYBU GNIAZDA ===
function createZombie() {
    // Spawn w okolicy gniazda
    var angle = Math.random() * Math.PI * 2;
    var dist = 50 + Math.random() * 100;
    var hasBow = Math.random() < 0.3; // 30% szans na łuk
    return {
        x: nestObject.x + Math.cos(angle) * dist,
        y: nestObject.y + Math.sin(angle) * dist,
        hp: hasBow ? 40 : 60, // Łucznicy mają mniej HP
        maxHp: hasBow ? 40 : 60,
        speed: hasBow ? 2.5 : 2, // Łucznicy są szybsi
        color: hasBow ? '#6a1b9a' : '#4a148c',
        attackCooldown: 0,
        dir: Math.random() * Math.PI * 2,
        changeDir: 60,
        hasBow: hasBow
    };
}

function updateEnemies() {
    for (var i = enemies.length - 1; i >= 0; i--) {
        var e = enemies[i];
        if (e.hp <= 0) {
            // W trybie pilki noznej - oznacz jako martwy zamiast usunac (respawn)
            if (gameMode === 'football') {
                if (!e.isDead) {
                    e.respawnTimer = 180; // 3 sekundy
                    e.isDead = true;
                    // Czasteczki
                    for (var p = 0; p < 8; p++) {
                        particles.push({
                            x: e.x, y: e.y,
                            vx: (Math.random()-0.5)*5, vy: (Math.random()-0.5)*5,
                            life: 25, color: e.color
                        });
                    }
                }
                continue;
            }

            // Smierc - czasteczki (dla innych trybow)
            for (var p = 0; p < 8; p++) {
                particles.push({
                    x: e.x, y: e.y,
                    vx: (Math.random()-0.5)*5, vy: (Math.random()-0.5)*5,
                    life: 25, color: e.color
                });
            }
            
            // W trybie treningowym roboty się odradzają
            if (e.isRobot) {
                enemies.splice(i, 1);
                enemies.push({
                    x: 200 + Math.random() * 600,
                    y: 200 + Math.random() * 400,
                    w: 40, h: 50,
                    hp: 80, maxHp: 80,
                    speed: 0, attackCooldown: 0,
                    color: '#607d8b', hasBow: false, isRobot: true
                });
                continue;
            } else if (e.isRobotBoss) {
                enemies.splice(i, 1);
                enemies.push({
                    x: 900, y: 400, w: 60, h: 80,
                    hp: 300, maxHp: 300,
                    speed: 0, attackCooldown: 0,
                    color: '#37474f', hasBow: false, isRobotBoss: true, chargeTimer: 0, isCharging: false
                });
                continue;
            } else {
                coins += 20;
                updateCoins();
                saveGame();
                enemies.splice(i, 1);
            }
            continue;
        }

        var dx = player.x - e.x;
        var dy = player.y - e.y;
        var dist = Math.sqrt(dx*dx + dy*dy);

        // Roboty w trybie treningowym się nie ruszają
        if (e.isRobot || e.isRobotBoss) {
            e.changeDir--;
            // Boss robot atakuje ognistą kulą
            if (e.isRobotBoss) {
                var dx = player.x - e.x;
                var dy = player.y - e.y;
                var distToPlayer = Math.sqrt(dx*dx + dy*dy);
                
                if (!e.isCharging && distToPlayer < 350 && e.attackCooldown <= 0) {
                    // Zaczyna ładować atak
                    e.isCharging = true;
                    e.chargeTimer = 120; // 2 sekundy (60fps * 2)
                    e.attackCooldown = 180; // 3 sekundy cooldown
                }
                
                if (e.isCharging) {
                    e.chargeTimer--;
                    // Animacja zbierania ognia - czerwone cząsteczki lecą do bossa
                    for (var p = 0; p < 3; p++) {
                        var px = e.x + (Math.random()-0.5)*100;
                        var py = e.y + (Math.random()-0.5)*100;
                        particles.push({
                            x: px, y: py,
                            vx: (e.x - px) * 0.05,
                            vy: (e.y - py) * 0.05,
                            life: 25,
                            color: ['#ff5722', '#ff9800', '#ffeb3b'][Math.floor(Math.random()*3)]
                        });
                    }
                    
                    if (e.chargeTimer <= 0) {
                        // Rzuca ognistą kulę
                        e.isCharging = false;
                        var angle = Math.atan2(dy, dx);
                        attacks.push({
                            x: e.x, y: e.y, angle: angle,
                            dist: 0, maxDist: 800,
                            size: 25,
                            damage: 40,
                            owner: 'enemy',
                            life: 100,
                            type: 'fireball'
                        });
                        // Efekt wystrzału
                        for (var p = 0; p < 15; p++) {
                            var ang = (p/15) * Math.PI * 2;
                            particles.push({
                                x: e.x, y: e.y,
                                vx: Math.cos(ang)*5, vy: Math.sin(ang)*5,
                                life: 20, color: '#ff5722'
                            });
                        }
                    }
                }
                
                if (e.attackCooldown > 0) e.attackCooldown--;
            }
        } else {
            // AI
            e.changeDir--;
            if (e.changeDir <= 0 || dist < 200) {
                if (dist < 300) {
                    e.dir = Math.atan2(dy, dx);
                } else {
                    e.dir = Math.random() * Math.PI * 2;
                }
                e.changeDir = 60 + Math.random() * 60;
            }

            var eSpd = e.speed;
            if (e.slowTimer && e.slowTimer > 0) { eSpd *= 0.4; e.slowTimer--; }
            if (e.stunTimer && e.stunTimer > 0) { eSpd = 0; e.stunTimer--; }
            if (e.burnTimer && e.burnTimer > 0) {
                eSpd *= 0.8; // Wolniejszy gdy płonie
                e.burnTimer--;
                // Dodatkowe obrażenia od ognia co 30 klatek
                if (e.burnTimer % 30 === 0) {
                    e.hp -= 3;
                    damageTexts.push({ x: e.x, y: e.y - 30, text: '-3 🔥', life: 20, color: '#ff5722' });
                }
            }
            var newEX = e.x + Math.cos(e.dir) * eSpd;
            var newEY = e.y + Math.sin(e.dir) * eSpd;

            var eBlocked = false;
            for (var j = 0; j < walls.length; j++) {
                if (rectsOverlap(newEX-20, newEY-25, 40, 50, walls[j].x, walls[j].y, walls[j].w, walls[j].h)) {
                    eBlocked = true;
                }
            }
            // Kolizja z graczem - nie wchodzi w postac
            if (rectsOverlap(newEX-20, newEY-25, 40, 50, player.x-20, player.y-25, 40, 50)) {
                eBlocked = true;
            }
            if (!eBlocked) {
                e.x = Math.max(20, Math.min(ARENA_W - 20, newEX));
                e.y = Math.max(25, Math.min(ARENA_H - 25, newEY));
            } else {
                e.dir += Math.PI/2;
            }
        }

        // Atak - łucznicy strzelają z daleka, reszta melee
        if (e.hasBow) {
            // Zatrzymaj się i strzelaj z dystansu
            if (dist < 350 && dist > 100) {
                // Zachowaj dystans - stań w miejscu
            } else if (dist <= 100) {
                // Uciekaj od gracza
                e.dir = Math.atan2(e.y - player.y, e.x - player.x);
            }
            // Strzelaj z łuku
            if (dist < 300) {
                e.attackCooldown--;
                if (e.attackCooldown <= 0) {
                    var angle = Math.atan2(player.y - e.y, player.x - e.x);
                    attacks.push({
                        x: e.x,
                        y: e.y - 20,
                        angle: angle,
                        dist: 0,
                        damage: 8,
                        life: 50,
                        type: 'zombiearrow',
                        speed: 10
                    });
                    e.attackCooldown = 60;
                }
            }
        } else {
            // Melee atak
            if (dist < 65) {
                e.attackCooldown--;
                if (e.attackCooldown <= 0) {
                    player.hp -= 10;
                    damageTexts.push({ x: player.x, y: player.y - 30, text: '-10', life: 30, color: '#ff4444' });
                    e.attackCooldown = 40;
                }
            }
        }
    }

    // === AKTUALIZACJA WROGÓW W ZAMKU ===
    if (inCastle) {
        var enemyList = castleFloor === 0 ? castleEnemies : towerEnemies;

        for (var i = enemyList.length - 1; i >= 0; i--) {
            var e = enemyList[i];

            // Śmierć
            if (e.hp <= 0) {
                for (var p = 0; p < 8; p++) {
                    particles.push({
                        x: e.x, y: e.y,
                        vx: (Math.random()-0.5)*5, vy: (Math.random()-0.5)*5,
                        life: 25, color: e.color
                    });
                }
                coins += 25;
                updateCoins();
                enemyList.splice(i, 1);
                continue;
            }

            // AI - dąż do gracza
            var dx = player.x - e.x;
            var dy = player.y - e.y;
            var dist = Math.sqrt(dx*dx + dy*dy);

            e.changeDir--;
            if (e.changeDir <= 0 || dist < 200) {
                if (dist < 300) {
                    e.dir = Math.atan2(dy, dx);
                } else {
                    e.dir = Math.random() * Math.PI * 2;
                }
                e.changeDir = 60 + Math.random() * 60;
            }

            var eSpd = e.speed;
            if (e.slowTimer && e.slowTimer > 0) { eSpd *= 0.4; e.slowTimer--; }
            if (e.stunTimer && e.stunTimer > 0) { eSpd = 0; e.stunTimer--; }

            var newEX = e.x + Math.cos(e.dir) * eSpd;
            var newEY = e.y + Math.sin(e.dir) * eSpd;

            // Ograniczenia wewnątrz zamku
            newEX = Math.max(50, Math.min(canvas.width - 50, newEX));
            newEY = Math.max(100, Math.min(canvas.height - 120, newEY));

            e.x = newEX;
            e.y = newEY;

            // Atak
            if (dist < 65) {
                e.attackCooldown--;
                if (e.attackCooldown <= 0) {
                    player.hp -= 12;
                    damageTexts.push({ x: player.x, y: player.y - 30, text: '-12', life: 30, color: '#ff4444' });
                    e.attackCooldown = 40;
                }
            }
        }

        // === AKTUALIZACJA BOSS ===
        if (castleBoss && castleFloor === 1 && castleEnemies.length === 0 && towerEnemies.length === 0) {
            var b = castleBoss;
            var dx = player.x - b.x;
            var dy = player.y - b.y;
            var bdist = Math.sqrt(dx*dx + dy*dy);

            // Boss powoli podchodzi do gracza
            b.changeDir--;
            if (b.changeDir <= 0 || bdist < 300) {
                b.dir = Math.atan2(dy, dx);
                b.changeDir = 60;
            }

            var newBX = b.x + Math.cos(b.dir) * b.speed;
            var newBY = b.y + Math.sin(b.dir) * b.speed;
            newBX = Math.max(100, Math.min(canvas.width - 100, newBX));
            newBY = Math.max(150, Math.min(canvas.height - 150, newBY));
            b.x = newBX;
            b.y = newBY;

            // Boss atakuje
            if (bdist < 80) {
                b.attackCooldown--;
                if (b.attackCooldown <= 0) {
                    player.hp -= 25;
                    damageTexts.push({ x: player.x, y: player.y - 30, text: '-25 👑', life: 30, color: '#ff0000' });
                    b.attackCooldown = 50;
                }
            }
        }
    }
}
