// ============ FUNKCJE GRACZA ============

// === AKTUALIZACJA PRZYCISKU SUPER ===
function updateSuperBtn() {
    var btn = document.getElementById('superBtn');
    var char = characters[player.character] || characters[Object.keys(characters)[0]];
    if (!char) return;

    // Cieniak - pokaz "RZUĆ" gdy gotowy do rzucenia czarnej dziury
    if (char.superType === 'throwblackhole') {
        if (player.superReady) {
            btn.style.background = 'radial-gradient(circle, #ff4444, #cc0000)';
            btn.style.borderColor = '#ff0000';
            btn.style.color = '#fff';
            btn.style.boxShadow = '0 0 25px rgba(255, 0, 0, 0.8)';
            btn.textContent = '🌑 RZUĆ!';
        } else if (player.superCharge >= 100) {
            btn.style.background = 'radial-gradient(circle, #9c27b0, #4a148c)';
            btn.style.borderColor = '#9c27b0';
            btn.style.color = '#fff';
            btn.style.boxShadow = '0 0 20px rgba(156, 39, 176, 0.8)';
            btn.textContent = '🌑 CELUJ';
        }
        return;
    }

    // Magmak - pokaz "LAWA" dla strefy lawy
    if (char.superType === 'lava') {
        if (player.superReady) {
            btn.style.background = 'radial-gradient(circle, #ff5722, #bf360c)';
            btn.style.borderColor = '#ff5722';
            btn.style.color = '#fff';
            btn.style.boxShadow = '0 0 25px rgba(255, 87, 34, 0.8)';
            btn.textContent = '🔥 LAVA!';
        } else if (player.superCharge >= 100) {
            btn.style.background = 'radial-gradient(circle, #ff9800, #e65100)';
            btn.style.borderColor = '#ff9800';
            btn.style.color = '#fff';
            btn.style.boxShadow = '0 0 20px rgba(255, 152, 0, 0.8)';
            btn.textContent = '🔥 CELUJ';
        }
        return;
    }

    if (player.superReady) {
        btn.style.background = 'radial-gradient(circle, #ff4444, #cc0000)';
        btn.style.borderColor = '#ff0000';
        btn.style.color = '#fff';
        btn.style.boxShadow = '0 0 25px rgba(255, 0, 0, 0.8)';
        btn.textContent = 'CELUJ!';
    } else if (player.superCharge >= 100) {
        btn.style.background = 'radial-gradient(circle, #ffff00, #ff9800)';
        btn.style.borderColor = '#ffff00';
        btn.style.color = '#000';
        btn.style.boxShadow = '0 0 20px rgba(255, 255, 0, 0.6)';
        btn.textContent = 'SUPER';
    } else {
        btn.style.background = 'rgba(100, 100, 100, 0.6)';
        btn.style.borderColor = '#555';
        btn.style.color = '#fff';
        btn.style.boxShadow = 'none';
        btn.textContent = 'SUPER';
    }
}

function useSuperBtn() {
    if (gameRunning) useSuper();
}

// === ATAK (Data-Driven) ===
function playerAttack() {
    if (player.attackCooldown > 0) return;

    var char = characters[player.character] || characters[Object.keys(characters)[0]];
    if (!char) return;
    var worldMX, worldMY;
    if (typeof use3D !== 'undefined' && use3D && typeof mouseWorld3D !== 'undefined') {
        worldMX = mouseWorld3D.x;
        worldMY = mouseWorld3D.z;
    } else {
        worldMX = mouse.x + camera.x;
        worldMY = mouse.y + camera.y;
    }
    var angle = Math.atan2(worldMY - player.y, worldMX - player.x);

    player.attackCooldown = char.attackCooldown;

    attacks.push({
        x: player.x, y: player.y, angle: angle,
        dist: 0, maxDist: char.attackRange,
        size: char.attackType === 'ranged' ? 18 : 30,
        damage: player.attackDamage,
        owner: 'player',
        life: char.attackType === 'ranged' ? 25 : 8,
        type: char.projectileType || 'melee'
    });

    // Cząsteczki ataku
    var pc = char.attackType === 'ranged' ? 3 : 5;
    var plife = char.attackType === 'ranged' ? 12 : 15;
    var pdist = char.attackType === 'ranged' ? 20 : 30;
    for (var i = 0; i < pc; i++) {
        particles.push({
            x: player.x + Math.cos(angle) * pdist,
            y: player.y + Math.sin(angle) * pdist,
            vx: Math.cos(angle + (Math.random()-0.5)) * (char.attackType === 'ranged' ? 2 : 3),
            vy: Math.sin(angle + (Math.random()-0.5)) * (char.attackType === 'ranged' ? 2 : 3),
            life: plife, color: char.attackColor
        });
    }
}

function useSuper() {
    if (player.superCharge < 100 || player.isSupering || player.superReady) return;

    var char = characters[player.character] || characters[Object.keys(characters)[0]];
    if (!char) return;

    // Cieniak - czarna dziura od razu, bez celowania!
    if (char.superType === 'blackhole') {
        player.superCharge = 0;
        player.isSupering = true;
        player.superProgress = 0;
        // Od razu aktywuj (nie ma fazy celowania)
        return;
    }

    // Cieniak - nowy super: RZUCA czarną dziurą w cel
    if (char.superType === 'throwblackhole') {
        if (player.superReady) {
            // RZUT - wystrzel czarną dziurę w kierunku celu
            player.superReady = false;
            player.superCharge = 0;

            var worldMX, worldMY;
            if (typeof use3D !== 'undefined' && use3D && typeof mouseWorld3D !== 'undefined') {
                worldMX = mouseWorld3D.x;
                worldMY = mouseWorld3D.z;
            } else {
                worldMX = mouse.x + camera.x;
                worldMY = mouse.y + camera.y;
            }
            var angle = Math.atan2(worldMY - player.y, worldMX - player.x);
            var dist = Math.min(Math.sqrt((worldMX-player.x)**2 + (worldMY-player.y)**2), char.superRange);

            // Stwórz lecącą czarną dziurę
            attacks.push({
                type: 'flyingblackhole',
                x: player.x,
                y: player.y,
                vx: Math.cos(angle) * 8,
                vy: Math.sin(angle) * 8,
                targetX: player.x + Math.cos(angle) * dist,
                targetY: player.y + Math.sin(angle) * dist,
                damage: char.superDamage,
                life: 60, // leci przez 1 sekundę
                pullRadius: char.superPullRadius,
                duration: char.superDuration,
                color: '#311b92'
            });

            // Efekt rzutu
            for (var p = 0; p < 10; p++) {
                particles.push({
                    x: player.x, y: player.y,
                    vx: Math.cos(angle + (Math.random()-0.5)) * 5,
                    vy: Math.sin(angle + (Math.random()-0.5)) * 5,
                    life: 20, color: '#4a148c'
                });
            }
        } else {
            player.superReady = true;
        }
        return;
    }

    // Magmak - tworzy strefę lawy na ziemi
    if (char.superType === 'lava') {
        if (player.superReady) {
            player.superReady = false;
            player.superCharge = 0;

            var worldMX, worldMY;
            if (typeof use3D !== 'undefined' && use3D && typeof mouseWorld3D !== 'undefined') {
                worldMX = mouseWorld3D.x;
                worldMY = mouseWorld3D.z;
            } else {
                worldMX = mouse.x + camera.x;
                worldMY = mouse.y + camera.y;
            }

            // Stwórz strefę lawy
            player.lavaZone = {
                x: worldMX,
                y: worldMY,
                timer: char.superDuration,
                maxTimer: char.superDuration,
                radius: char.superRadius,
                damage: char.superDamage
            };

            // Efekt stworzenia - cząsteczki ognia
            for (var p = 0; p < 30; p++) {
                var ang = (p/30) * Math.PI * 2;
                particles.push({
                    x: worldMX + Math.cos(ang) * 30,
                    y: worldMY + Math.sin(ang) * 30,
                    vx: Math.cos(ang) * 3,
                    vy: Math.sin(ang) * 3,
                    life: 30, color: '#ff5722'
                });
            }
        } else {
            player.superReady = true;
        }
        return;
    }

    player.superReady = true;
}

// === SUPER ATAK - START (Data-Driven) ===
function launchSuper() {
    if (!player.superReady) return;

    // W PIŁCE NOŻNEJ - superatak to mocniejszy strzał piłką!
    player.superReady = false;
    player.superCharge = 0;
    player.isSupering = true;
    player.superProgress = 0;

    var char = characters[player.character] || characters[Object.keys(characters)[0]];
    if (!char) return;

    var worldMX, worldMY;
    if (typeof use3D !== 'undefined' && use3D && typeof mouseWorld3D !== 'undefined') {
        worldMX = mouseWorld3D.x;
        worldMY = mouseWorld3D.z;
    } else {
        worldMX = mouse.x + camera.x;
        worldMY = mouse.y + camera.y;
    }
    var dx = worldMX - player.x;
    var dy = worldMY - player.y;
    var dist = Math.sqrt(dx*dx + dy*dy);
    var maxRange = char.superRange;
    if (dist > maxRange) {
        dx = dx/dist * maxRange;
        dy = dy/dist * maxRange;
    }
    player.superX = player.x;
    player.superY = player.y;
    player.superTargetX = player.x + dx;
    player.superTargetY = player.y + dy;

    player.superTargetX = Math.max(20, Math.min(ARENA_W - 20, player.superTargetX));
    player.superTargetY = Math.max(25, Math.min(ARENA_H - 25, player.superTargetY));
}

function clampPlayerToArena() {
    if (inCastle) return;
    player.x = Math.max(20, Math.min(ARENA_W - 20, player.x));
    player.y = Math.max(25, Math.min(ARENA_H - 25, player.y));
}

// drawProjectile zdefiniowane w js/rendering/arena-renderer.js

// === AKTUALIZACJA GRACZA (Data-Driven) ===
function updatePlayer() {
    var char = characters[player.character] || characters[Object.keys(characters)[0]];
    if (!char) return;

    if (player.isSupering) {
        // CZARNA DZIURA (Cieniak) - od razu aktywuj bez czekania na progress!
        if (char.superType === 'blackhole') {
            // OD RAZU otwórz czarną dziurę na miejscu gracza (bez skakania)
            player.blackHole = {
                x: player.x,
                y: player.y,
                timer: char.superDuration,
                maxTimer: char.superDuration,
                radius: char.superPullRadius
            };

            // Obrażenia dla wrogów blisko
            for (var i = 0; i < enemies.length; i++) {
                var e = enemies[i];
                var dx = e.x - player.x, dy = e.y - player.y;
                if (Math.sqrt(dx*dx+dy*dy) < 80) {
                    e.hp -= char.superDamage * 3; // 3x obrażenia bo bez skoku
                    damageTexts.push({ x: e.x, y: e.y - 30, text: '-' + (char.superDamage * 3) + ' 🌑', life: 30, color: '#9c27b0' });
                }
            }

            // Efekt otwarcia - fioletowe cząsteczki
            for (var p = 0; p < 20; p++) {
                var a = (p/20) * Math.PI * 2;
                particles.push({ x: player.x, y: player.y, vx: Math.cos(a)*6, vy: Math.sin(a)*6, life: 30, color: '#311b92' });
            }

            // Zakończ super od razu
            player.isSupering = false; player._hchar = null;
            player.superProgress = 0;
        } else {
            player.superProgress += char.superSpeed;
        }

        if (char.superType === 'charge') {
            // SZARŻA (Blazer) - biegnie po ziemi
            var t = Math.min(player.superProgress, 1);
            player.x = player.superX + (player.superTargetX - player.superX) * t;
            player.y = player.superY + (player.superTargetY - player.superY) * t;

            // Cząsteczki po drodze
            particles.push({
                x: player.x + (Math.random()-0.5)*20, y: player.y + (Math.random()-0.5)*20,
                vx: (Math.random()-0.5)*2, vy: (Math.random()-0.5)*2,
                life: 15, color: ['#ff6d00','#ff9800','#ffcc00'][Math.floor(Math.random()*3)]
            });

            // Uderzanie wrogów po drodze
            for (var i = 0; i < enemies.length; i++) {
                var e = enemies[i];
                var dx = e.x - player.x, dy = e.y - player.y;
                if (Math.sqrt(dx*dx+dy*dy) < 50 && !e.hitByCharge) {
                    e.hp -= char.superDamage;
                    if (char.superEffects.indexOf('slow') !== -1) e.slowTimer = char.superSlowDuration;
                    e.hitByCharge = true;
                    damageTexts.push({ x: e.x, y: e.y - 30, text: '-' + char.superDamage + ' 🐌', life: 35, color: '#ff6d00' });
                    var ang = Math.atan2(dy, dx);
                    e.x += Math.cos(ang) * char.superKnockback;
                    e.y += Math.sin(ang) * char.superKnockback;
                }
            }

            // Niszczenie ścian po drodze (dla Blazera)
            if (char.superEffects.indexOf('destroyWalls') !== -1) {
                for (var wi = walls.length - 1; wi >= 0; wi--) {
                    var w = walls[wi], wcx = w.x+w.w/2, wcy = w.y+w.h/2;
                    var wdx = wcx - player.x, wdy = wcy - player.y;
                    if (Math.sqrt(wdx*wdx + wdy*wdy) < 45) {
                        for (var wp = 0; wp < 8; wp++) particles.push({ x:wcx, y:wcy, vx:(Math.random()-0.5)*5, vy:(Math.random()-0.5)*5, life:25, color:'#8d6e4a' });
                        walls.splice(wi, 1);
                    }
                }
            }

            if (player.superProgress >= 1) {
                player.isSupering = false; player._hchar = null;
                player.x = player.superTargetX;
                player.y = player.superTargetY;
                for (var i = 0; i < enemies.length; i++) enemies[i].hitByCharge = false;
                for (var p = 0; p < 10; p++) {
                    var a = (p/10) * Math.PI * 2;
                    particles.push({ x: player.x, y: player.y, vx: Math.cos(a)*3, vy: Math.sin(a)*3, life: 18, color: '#ff6d00' });
                }
            }
        } else if (char.superType !== 'blackhole') {
            // SKOK (Noobek, Frostik) - w górę i w dół
            if (player.superProgress >= 1) {
                player.superProgress = 1;
                player.isSupering = false; player._hchar = null;
                player.x = player.superTargetX;
                player.y = player.superTargetY;

                // Obrażenia przy lądowaniu
                for (var i = 0; i < enemies.length; i++) {
                    var e = enemies[i];
                    var dx = e.x - player.x, dy = e.y - player.y;
                    if (Math.sqrt(dx*dx+dy*dy) < 60) {
                        e.hp -= char.superDamage;
                        var dmgText = '-' + char.superDamage;
                        var dmgColor = '#ffff00';
                        if (char.superEffects.indexOf('stun') !== -1) {
                            e.stunTimer = char.superStunDuration;
                            dmgText += ' ❄️';
                            dmgColor = '#29b6f6';
                        }
                        damageTexts.push({ x: e.x, y: e.y - 30, text: dmgText, life: 30, color: dmgColor });
                        var ang = Math.atan2(dy, dx);
                        e.x += Math.cos(ang) * char.superKnockback;
                        e.y += Math.sin(ang) * char.superKnockback;
                    }
                }
                // Niszczenie ścian
                if (char.superEffects.indexOf('destroyWalls') !== -1) {
                    for (var wi = walls.length - 1; wi >= 0; wi--) {
                        var w = walls[wi], wcx = w.x+w.w/2, wcy = w.y+w.h/2;
                        if (Math.sqrt((wcx-player.x)*(wcx-player.x)+(wcy-player.y)*(wcy-player.y)) < 70) {
                            for (var wp = 0; wp < 8; wp++) particles.push({ x:wcx, y:wcy, vx:(Math.random()-0.5)*5, vy:(Math.random()-0.5)*5, life:25, color:'#8d6e4a' });
                            walls.splice(wi, 1);
                        }
                    }
                }
                // Efekt lądowania
                for (var p = 0; p < 12; p++) {
                    var a = (p/12) * Math.PI * 2;
                    particles.push({ x: player.x, y: player.y, vx: Math.cos(a)*4, vy: Math.sin(a)*4, life: 20, color: '#ffff00' });
                }
            } else {
                var t = player.superProgress;
                var jumpH = Math.sin(t * Math.PI) * 80;
                player.x = player.superX + (player.superTargetX - player.superX) * t;
                player.y = player.superY + (player.superTargetY - player.superY) * t - jumpH;
            }
        }
        clampPlayerToArena();
        return;
    }

    // Ruch gracza
    var mx = 0, my = 0;
    if (keys['w'] || keys['arrowup']) my = -1;
    if (keys['s'] || keys['arrowdown']) my = 1;
    if (keys['a'] || keys['arrowleft']) mx = -1;
    if (keys['d'] || keys['arrowright']) mx = 1;
    if (mx !== 0 && my !== 0) { mx *= 0.707; my *= 0.707; }

    var newX = player.x + mx * player.speed;
    var newY = player.y + my * player.speed;

    var blocked = false;
    for (var i = 0; i < walls.length; i++) {
        if (rectsOverlap(newX-20, newY-25, 40, 50, walls[i].x, walls[i].y, walls[i].w, walls[i].h)) blocked = true;
    }
    // Kolizja z krzewami (bushes)
    for (var i = 0; i < bushes.length; i++) {
        if (rectsOverlap(newX-20, newY-25, 40, 50, bushes[i].x, bushes[i].y, bushes[i].w, bushes[i].h)) blocked = true;
    }

    // === WEJŚCIE DO ZAMKU ===
    if (!inCastle && castle && castle.doorOpen) {
        // Sprawdź czy gracz jest przy drzwiach zamku
        var doorX = castle.x + castle.w/2;
        var doorY = castle.y + castle.h;
        var distToDoor = Math.sqrt((newX - doorX) * (newX - doorX) + (newY - doorY) * (newY - doorY));
        if (distToDoor < 50 && (keys['w'] || keys['arrowup'])) {
            // Wejdź do zamku
            inCastle = true;
            castleFloor = 0;
            player.x = canvas.width/2;
            player.y = canvas.height - 150;
            return;
        }
    } else if (inCastle) {
        // === LOGIKA WEWNĄTRZ ZAMKU ===

        // Wyjście z zamku (na dole)
        if (player.y > canvas.height - 130 && (keys['s'] || keys['arrowdown'])) {
            inCastle = false;
            player.x = castle.x + castle.w/2;
            player.y = castle.y + castle.h + 30;
            return;
        }

        // Przejście na piętro 1 - tylko jak pokonasz wszystkich na parterze
        if (castleFloor === 0 && player.y < 100 && (keys['w'] || keys['arrowup'])) {
            if (castleEnemies && castleEnemies.length > 0) {
                damageTexts.push({ x: player.x, y: player.y - 60, text: 'Pokonaj wszystkich na parterze!', life: 60, color: '#ff4444' });
                player.y = 110;
                return;
            }
            castleFloor = 1;
            player.y = canvas.height - 150;
            return;
        }

        // Przejście na piętro 2 (komnata bossa) - tylko jak pokonasz wszystkich na piętrze 1
        if (castleFloor === 1 && player.y < 100 && (keys['w'] || keys['arrowup'])) {
            if (towerEnemies && towerEnemies.length > 0) {
                damageTexts.push({ x: player.x, y: player.y - 60, text: 'Pokonaj wszystkich na piętrze 1!', life: 60, color: '#ff4444' });
                player.y = 110;
                return;
            }
            castleFloor = 2;
            player.y = canvas.height - 150;
            return;
        }

        // Powrót z piętra 2 na piętro 1
        if (castleFloor === 2 && player.y > canvas.height - 80 && (keys['s'] || keys['arrowdown'])) {
            castleFloor = 1;
            player.y = 100;
            return;
        }

        // Powrót z piętra 1 na parter
        if (castleFloor === 1 && player.y > canvas.height - 80 && (keys['s'] || keys['arrowdown'])) {
            castleFloor = 0;
            player.y = 100;
            return;
        }

        // Ograniczenia wewnątrz zamku
        newX = Math.max(50, Math.min(canvas.width - 50, newX));
        newY = Math.max(50, Math.min(canvas.height - 60, newY));

        player.x = newX;
        player.y = newY;
        return;
    }

    if (!blocked) {
        player.x = newX;
        player.y = newY;
        clampPlayerToArena();
    }

    if (player.attackCooldown > 0) player.attackCooldown--;

    // === AKTUALIZACJA CZARNEJ DZIURY ===
    if (player.blackHole && player.blackHole.timer > 0) {
        player.blackHole.timer--;
        var bh = player.blackHole;
        var char = characters[player.character] || characters[Object.keys(characters)[0]];
        if (!char) return;
        
        // Wciąganie wrogów w stronę dziury
        for (var i = 0; i < enemies.length; i++) {
            var e = enemies[i];
            var dx = bh.x - e.x;
            var dy = bh.y - e.y;
            var dist = Math.sqrt(dx*dx + dy*dy);
            
            if (dist < bh.radius && dist > 10) {
                // Wciągaj wroga
                var pullStrength = 3 * (1 - dist / bh.radius);
                e.x += (dx / dist) * pullStrength;
                e.y += (dy / dist) * pullStrength;
                
                // Zadaj obrażenia co 30 klatek (0.5 sekundy)
                if (player.blackHole.timer % 30 === 0 && dist < bh.radius * 0.5) {
                    e.hp -= char.superDamage;
                    damageTexts.push({
                        x: e.x, y: e.y - 30,
                        text: '-' + char.superDamage + ' 🌑',
                        life: 30, color: '#9c27b0'
                    });
                }
            }
        }
        
        // Usuń czarną dziurę gdy timer się skończy
        if (player.blackHole.timer <= 0) {
            player.blackHole = null;
        }
    }
}
