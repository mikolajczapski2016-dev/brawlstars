// ============ FUNKCJE ATAKÓW I CZĄSTECZEK ============

// === UTILITY: KOLIZJA PROSTOKĄTÓW ===
function rectsOverlap(x1,y1,w1,h1, x2,y2,w2,h2) {
    return x1 < x2+w2 && x1+w1 > x2 && y1 < y2+h2 && y1+h1 > y2;
}

function updateAttacks() {
    for (var i = attacks.length - 1; i >= 0; i--) {
        var a = attacks[i];

        // W zamku ignoruj ataki wrogów z areny (pozostaw tylko pioruny czarodziejów)
        if (inCastle && a.owner === 'enemy' && a.type !== 'lightning') {
            a.life--;
            if (a.life <= 0 || a.dist > a.maxDist) {
                attacks.splice(i, 1);
            }
            continue;
        }

        // RÓŻOWA CHMURA (UltraZombi) - tworzy strefę trucizny
        if (a.type === 'pinkcloud') {
            a.dist += 8;
            a.life--;

            var ax = a.x + Math.cos(a.angle) * a.dist;
            var ay = a.y + Math.sin(a.angle) * a.dist;

            // Rysuj chmurę
            for (var p = 0; p < 2; p++) {
                particles.push({
                    x: ax + (Math.random()-0.5) * 30,
                    y: ay + (Math.random()-0.5) * 30,
                    vx: (Math.random()-0.5) * 2,
                    vy: (Math.random()-0.5) * 2,
                    life: 20,
                    color: '#e91e63'
                });
            }

            // Sprawdź kolizję z wrogami
            for (var j = 0; j < enemies.length; j++) {
                var e = enemies[j];
                var dx = ax - e.x;
                var dy = ay - e.y;
                if (Math.sqrt(dx*dx+dy*dy) < 35) {
                    e.hp -= a.damage;
                    player.superCharge = Math.min(100, player.superCharge + 10);
                    damageTexts.push({ x: e.x, y: e.y - 30, text: '-' + a.damage + ' ☠️', life: 30, color: '#e91e63' });
                }
            }

            // Usuń gdy dotrze do końca zasięgu
            if (a.life <= 0 || a.dist > a.maxDist) {
                // Efekt zanikania chmury
                for (var p = 0; p < 15; p++) {
                    particles.push({
                        x: ax + (Math.random()-0.5) * 40,
                        y: ay + (Math.random()-0.5) * 40,
                        vx: (Math.random()-0.5) * 3,
                        vy: -Math.random() * 2,
                        life: 25,
                        color: '#f48fb1'
                    });
                }
                attacks.splice(i, 1);
            }
            continue;
        }

        // LECĄCA CZARNA DZIURA (super Cieniaka)
        if (a.type === 'flyingblackhole') {
            a.x += a.vx;
            a.y += a.vy;
            a.life--;

            // Sprawdź czy dotarła do celu
            var distToTarget = Math.sqrt((a.x - a.targetX)**2 + (a.y - a.targetY)**2);
            if (distToTarget < 20 || a.life <= 0) {
                // Stwórz czarną dziurę w miejscu lądowania
                player.blackHole = {
                    x: a.targetX,
                    y: a.targetY,
                    timer: a.duration,
                    maxTimer: a.duration,
                    radius: a.pullRadius
                };
                // Obrażenia przy lądowaniu
                for (var j = 0; j < enemies.length; j++) {
                    var e = enemies[j];
                    var dx = e.x - a.targetX, dy = e.y - a.targetY;
                    if (Math.sqrt(dx*dx+dy*dy) < 60) {
                        e.hp -= a.damage * 2;
                        damageTexts.push({ x: e.x, y: e.y - 30, text: '-' + (a.damage*2) + ' 🌑', life: 30, color: '#9c27b0' });
                    }
                }
                // Efekt lądowania
                for (var p = 0; p < 25; p++) {
                    var ang = (p/25) * Math.PI * 2;
                    particles.push({ x: a.targetX, y: a.targetY, vx: Math.cos(ang)*7, vy: Math.sin(ang)*7, life: 35, color: '#311b92' });
                }
                attacks.splice(i, 1);
            }
            continue;
        }

        // PIÓRUN CZARODZIEJA
        if (a.type === 'lightning') {
            a.dist += a.speed || 15;
            a.life--;
            
            var ax = a.x + Math.cos(a.angle) * a.dist;
            var ay = a.y + Math.sin(a.angle) * a.dist;
            
            // Efekt pioruna - żółte/fioletowe cząsteczki
            for (var p = 0; p < 3; p++) {
                particles.push({
                    x: ax + (Math.random()-0.5) * 15,
                    y: ay + (Math.random()-0.5) * 15,
                    vx: (Math.random()-0.5) * 3,
                    vy: (Math.random()-0.5) * 3,
                    life: 10,
                    color: Math.random() > 0.5 ? '#e040fb' : '#ffeb3b'
                });
            }
            
            // Sprawdź kolizję z graczem
            var dx = ax - player.x;
            var dy = ay - player.y;
            if (Math.sqrt(dx*dx+dy*dy) < 30) {
                player.hp -= a.damage;
                damageTexts.push({ x: player.x, y: player.y - 30, text: '-' + a.damage + ' ⚡', life: 30, color: '#e040fb' });
                // Efekt trafienia
                for (var p = 0; p < 15; p++) {
                    var ang = (p/15) * Math.PI * 2;
                    particles.push({ x: player.x, y: player.y, vx: Math.cos(ang)*5, vy: Math.sin(ang)*5, life: 20, color: '#e040fb' });
                }
                attacks.splice(i, 1);
                continue;
            }
            
            if (a.life <= 0 || a.dist > 400) {
                attacks.splice(i, 1);
            }
            continue;
        }

        // Ognista kula bossa robota
        if (a.type === 'fireball') {
            a.dist += 8;
            a.life--;
            
            var ax = a.x + Math.cos(a.angle) * a.dist;
            var ay = a.y + Math.sin(a.angle) * a.dist;
            
            // Rysuj ogień za kulą
            for (var p = 0; p < 3; p++) {
                particles.push({
                    x: ax + (Math.random()-0.5)*20,
                    y: ay + (Math.random()-0.5)*20,
                    vx: (Math.random()-0.5)*2,
                    vy: (Math.random()-0.5)*2,
                    life: 15,
                    color: Math.random() > 0.5 ? '#ff5722' : '#ff9800'
                });
            }
            
            // Sprawdź kolizję z graczem
            var dx = ax - player.x;
            var dy = ay - player.y;
            if (Math.sqrt(dx*dx+dy*dy) < 35) {
                player.hp -= a.damage;
                damageTexts.push({ x: player.x, y: player.y - 30, text: '-' + a.damage + ' 🔥', life: 30, color: '#ff5722' });
                // Wybuch
                for (var p = 0; p < 20; p++) {
                    var ang = (p/20) * Math.PI * 2;
                    particles.push({ x: ax, y: ay, vx: Math.cos(ang)*6, vy: Math.sin(ang)*6, life: 25, color: '#ff5722' });
                }
                attacks.splice(i, 1);
                continue;
            }
            
            if (a.life <= 0 || a.dist > a.maxDist) {
                attacks.splice(i, 1);
            }
            continue;
        }

        // Strzały zombie (łucznicy)
        if (a.type === 'zombiearrow') {
            a.dist += a.speed || 12;
            a.life--;

            var ax = a.x + Math.cos(a.angle) * a.dist;
            var ay = a.y + Math.sin(a.angle) * a.dist;

            // Sprawdź kolizję z graczem
            var dx = ax - player.x;
            var dy = ay - player.y;
            if (Math.sqrt(dx*dx+dy*dy) < 30) {
                player.hp -= a.damage;
                damageTexts.push({ x: player.x, y: player.y - 30, text: '-' + a.damage + ' 🏹', life: 30, color: '#ff4444' });
                attacks.splice(i, 1);
                continue;
            }

            if (a.life <= 0 || a.dist > 500) {
                attacks.splice(i, 1);
            }
            continue;
        }

        // MAGMA BOMB (Magmak) - wybucha przy kontakcie z wrogiem
        if (a.type === 'magmabomb') {
            a.dist += 10;
            a.life--;

            var max = a.x + Math.cos(a.angle) * a.dist;
            var may = a.y + Math.sin(a.angle) * a.dist;

            // Sprawdź kolizję z wrogami
            var hit = false;
            for (var j = 0; j < enemies.length; j++) {
                var e = enemies[j];
                var dx = max - e.x;
                var dy = may - e.y;
                if (Math.sqrt(dx*dx+dy*dy) < 30) {
                    hit = true;
                    break;
                }
            }

            // Wybuch! (przy kontakcie lub na końcu zasięgu)
            if (hit || a.dist > a.maxDist) {
                // Obrażenia w okolicy
                for (var j = 0; j < enemies.length; j++) {
                    var e = enemies[j];
                    var dx = may - e.y;
                    var dy = may - e.y;
                    var dist = Math.sqrt((max - e.x)**2 + (may - e.y)**2);
                    if (dist < 60) {
                        var dmg = Math.floor(a.damage * (1 - dist/60));
                        e.hp -= dmg;
                        player.superCharge = Math.min(100, player.superCharge + 10);
                        damageTexts.push({ x: e.x, y: e.y - 30, text: '-' + dmg + ' 💥', life: 30, color: '#ff5722' });
                    }
                }
                // Efekt wybuchu - cząsteczki ognia
                for (var p = 0; p < 20; p++) {
                    var ang = (p/20) * Math.PI * 2;
                    particles.push({ x: max, y: may, vx: Math.cos(ang)*5, vy: Math.sin(ang)*5, life: 25, color: '#ff5722' });
                }
                particles.push({ x: max, y: may, vx: 0, vy: 0, life: 15, color: '#ffab00' });
                attacks.splice(i, 1);
                continue;
            }

            if (a.life <= 0) {
                attacks.splice(i, 1);
            }
            continue;
        }

        // Standardowe ataki
        a.dist += 12;
        a.life--;

        var ax = a.x + Math.cos(a.angle) * a.dist;
        var ay = a.y + Math.sin(a.angle) * a.dist;

        if (a.owner === 'player') {
            // === TRAFIENIE W AKUMULATOR ===
            if (inCastle && castleFloor === 2 && accumulators && accumulators.length > 0) {
                var hitAcc = false;
                for (var aj = 0; aj < accumulators.length; aj++) {
                    var acc = accumulators[aj];
                    if (!acc.active) continue;
                    var adx = ax - acc.x;
                    var ady = ay - acc.y;
                    if (Math.sqrt(adx*adx + ady*ady) < (a.size || 10) + 25) {
                        acc.hp -= a.damage;
                        player.superCharge = Math.min(100, player.superCharge + 10);
                        damageTexts.push({ x: acc.x, y: acc.y - 30, text: '-' + a.damage + ' ⚡', life: 30, color: '#4fc3f7' });
                        if (acc.hp <= 0) {
                            acc.active = false;
                            for (var ep = 0; ep < 25; ep++) {
                                particles.push({ x: acc.x, y: acc.y, vx: (Math.random()-0.5)*12, vy: (Math.random()-0.5)*12, life: 45, color: ep%2===0 ? '#4fc3f7' : '#e3f2fd' });
                            }
                        }
                        attacks.splice(i, 1);
                        hitAcc = true;
                        break;
                    }
                }
                if (hitAcc) continue;
            }

            // Atak na wrogów na arenie (wszystkie tryby)
            var hitEnemy = false;
            for (var j = 0; j < enemies.length; j++) {
                var e = enemies[j];
                var dx = ax - e.x;
                var dy = ay - e.y;
                var dist = Math.sqrt(dx*dx+dy*dy);
                if (dist < a.size + 40) {
                    var finalDmg = e.hasArmor ? Math.max(1, Math.floor(a.damage * 0.4)) : a.damage;
                    e.hp -= finalDmg;
                    player.superCharge = Math.min(100, player.superCharge + 15);
                    var dmgTxt = e.hasArmor ? ('\u2694 ' + finalDmg) : ('-' + finalDmg);
                    var dmgCol = e.hasArmor ? '#bdbdbd' : '#ff0000';
                    damageTexts.push({ x: e.x, y: e.y - 30, text: dmgTxt, life: 30, color: dmgCol });
                    hitEnemy = true;
                    break;
                }
            }
            if (hitEnemy) {
                attacks.splice(i, 1);
            }

            // Atak na wrogów w zamku
            if (inCastle) {
                var castleEnemyList = castleFloor === 0 ? castleEnemies : towerEnemies;
                for (var j = 0; j < castleEnemyList.length; j++) {
                    var e = castleEnemyList[j];
                    var dx = ax - e.x;
                    var dy = ay - e.y;
                    if (Math.sqrt(dx*dx+dy*dy) < a.size + 20) {
                        e.hp -= a.damage;
                        player.superCharge = Math.min(100, player.superCharge + 15);
                        damageTexts.push({ x: e.x, y: e.y - 30, text: '-' + a.damage, life: 30, color: '#ff0000' });
                        attacks.splice(i, 1);
                        break;
                    }
                }

                // Atak na bossa
                if (castleBoss && castleFloor === 2) {
                    var bdx = ax - castleBoss.x;
                    var bdy = ay - castleBoss.y;
                    if (Math.sqrt(bdx*bdx + bdy*bdy) < a.size + 40) {
                        // Zbroja redukuje obrażenia do 10%
                        var bossDmg = bossHasArmor ? Math.max(1, Math.floor(a.damage * 0.1)) : a.damage;
                        castleBoss.hp -= bossDmg;
                        player.superCharge = Math.min(100, player.superCharge + (bossHasArmor ? 5 : 20));
                        var dmgText = bossHasArmor ? ('🛡 ' + bossDmg) : ('-' + bossDmg);
                        var dmgColor = bossHasArmor ? '#4fc3f7' : '#ffd700';
                        damageTexts.push({ x: castleBoss.x, y: castleBoss.y - 50, text: dmgText, life: 30, color: dmgColor });
                        attacks.splice(i, 1);
                    }
                }
            }
        }

        if (a.life <= 0 || a.dist > a.maxDist) {
            attacks.splice(i, 1);
        }
    }
}

function updateParticles() {
    for (var i = particles.length - 1; i >= 0; i--) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        if (p.life <= 0) particles.splice(i, 1);
    }
    for (var i = damageTexts.length - 1; i >= 0; i--) {
        damageTexts[i].y -= 1;
        damageTexts[i].life--;
        if (damageTexts[i].life <= 0) damageTexts.splice(i, 1);
    }
}
