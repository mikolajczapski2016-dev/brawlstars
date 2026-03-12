// Arena and game rendering functions

function drawProjectile(type, x, y, angle, size) {
    switch (type) {
        case 'bacon':
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);
            ctx.fillStyle = '#e85d4a';
            ctx.fillRect(-12, -6, 24, 12);
            ctx.fillStyle = '#f5c6b8';
            ctx.fillRect(-12, -3, 24, 3);
            ctx.fillRect(-12, 3, 24, 3);
            ctx.strokeStyle = '#8b3a2a';
            ctx.lineWidth = 1;
            ctx.strokeRect(-12, -6, 24, 12);
            ctx.restore();
            break;
        case 'ice':
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);
            ctx.fillStyle = '#b3e5fc';
            ctx.beginPath();
            ctx.moveTo(10, 0);
            ctx.lineTo(-5, -8);
            ctx.lineTo(-5, 8);
            ctx.fill();
            ctx.strokeStyle = '#29b6f6';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
            break;
        case 'darkball':
            // Cieniak - pocisk z czarnej materii
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);
            // Ciemny rdzeń
            var grad = ctx.createRadialGradient(0, 0, 2, 0, 0, 12);
            grad.addColorStop(0, '#000000');
            grad.addColorStop(0.5, '#311b92');
            grad.addColorStop(1, 'rgba(74, 20, 140, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, 12, 0, Math.PI*2);
            ctx.fill();
            // Fioletowa poświata
            ctx.strokeStyle = '#7c4dff';
            ctx.lineWidth = 2;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.arc(0, 0, 15, 0, Math.PI*2);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();
            break;
        case 'flyingblackhole':
            // Lecąca czarna dziura (super Cieniaka)
            var grad = ctx.createRadialGradient(x, y, 5, x, y, 25);
            grad.addColorStop(0, '#000000');
            grad.addColorStop(0.3, '#311b92');
            grad.addColorStop(0.7, '#7c4dff');
            grad.addColorStop(1, 'rgba(124, 77, 255, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, 25, 0, Math.PI*2);
            ctx.fill();
            // Wirująca obwódka
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.arc(x, y, 20, Date.now() / 100, Date.now() / 100 + Math.PI*1.5);
            ctx.stroke();
            ctx.setLineDash([]);
            break;
        case 'fireball':
            // Ognista kula z ogonem
            var grad = ctx.createRadialGradient(x, y, 0, x, y, 20);
            grad.addColorStop(0, '#fff');
            grad.addColorStop(0.3, '#ff5722');
            grad.addColorStop(0.7, '#e64a19');
            grad.addColorStop(1, 'rgba(230, 74, 25, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, 20, 0, Math.PI*2);
            ctx.fill();
            // Jądro
            ctx.fillStyle = '#ffeb3b';
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, Math.PI*2);
            ctx.fill();
            break;
        case 'zombiearrow':
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);
            // Strzała
            ctx.fillStyle = '#5d4037';
            ctx.fillRect(-15, -2, 30, 4);
            // Grocik
            ctx.fillStyle = '#ff0000';
            ctx.beginPath();
            ctx.moveTo(15, 0);
            ctx.lineTo(10, -4);
            ctx.lineTo(10, 4);
            ctx.fill();
            // Pióra
            ctx.fillStyle = '#fff';
            ctx.fillRect(-18, -4, 5, 8);
            ctx.restore();
            break;
        case 'magmabomb':
            // Magmak - ładująca się bomba z lawy
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);
            // Rdzeń lawy
            var grad = ctx.createRadialGradient(0, 0, 2, 0, 0, 14);
            grad.addColorStop(0, '#ffff00');
            grad.addColorStop(0.5, '#ff5722');
            grad.addColorStop(1, '#bf360c');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, 14, 0, Math.PI*2);
            ctx.fill();
            // Poświata
            ctx.strokeStyle = '#ffab00';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, 16, 0, Math.PI*2);
            ctx.stroke();
            // Bąbelki
            ctx.fillStyle = '#ffcc80';
            ctx.beginPath();
            ctx.arc(-4, -3, 3, 0, Math.PI*2);
            ctx.arc(3, 4, 2, 0, Math.PI*2);
            ctx.fill();
            ctx.restore();
            break;
        case 'fart':
            // Bączek - bąk (zielony gaz)
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);
            // Chmura bąka
            var fartGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 16);
            fartGrad.addColorStop(0, 'rgba(100, 221, 23, 0.9)');
            fartGrad.addColorStop(0.5, 'rgba(139, 195, 74, 0.7)');
            fartGrad.addColorStop(1, 'rgba(139, 195, 74, 0)');
            ctx.fillStyle = fartGrad;
            ctx.beginPath();
            ctx.arc(0, 0, 16, 0, Math.PI*2);
            ctx.fill();
            // Żółtawe centrum
            ctx.fillStyle = 'rgba(255, 235, 59, 0.6)';
            ctx.beginPath();
            ctx.arc(0, 0, 8, 0, Math.PI*2);
            ctx.fill();
            ctx.restore();
            break;
        case 'poisonball':
            // Toksyk - kula trucizny
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);
            // Trująca kula
            var poisonGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 14);
            poisonGrad.addColorStop(0, '#b9f6ca');
            poisonGrad.addColorStop(0.3, '#00e676');
            poisonGrad.addColorStop(0.7, '#00c853');
            poisonGrad.addColorStop(1, 'rgba(0, 200, 83, 0)');
            ctx.fillStyle = poisonGrad;
            ctx.beginPath();
            ctx.arc(0, 0, 14, 0, Math.PI*2);
            ctx.fill();
            // Bąbelki trucizny
            ctx.fillStyle = '#69f0ae';
            ctx.beginPath();
            ctx.arc(-4, -3, 3, 0, Math.PI*2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(3, 4, 2, 0, Math.PI*2);
            ctx.fill();
            // Ogon trucizny
            ctx.strokeStyle = 'rgba(0, 230, 118, 0.5)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(-10, 0);
            ctx.lineTo(-25 - Math.sin(Date.now()/50)*5, 0);
            ctx.stroke();
            ctx.restore();
            break;
        default: // melee / fire / etc
            ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
            ctx.beginPath();
            ctx.arc(x, y, size/2, 0, Math.PI*2);
            ctx.fill();
            ctx.fillStyle = 'rgba(255, 100, 100, 0.5)';
            ctx.beginPath();
            ctx.arc(x, y, size/2 + 5, 0, Math.PI*2);
            ctx.fill();
    }
}

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

    // Tarcza zbroi (gdy aktywna)
    if (bossHasArmor) {
        var shieldPulse = Math.sin(time * 5) * 0.15 + 0.85;
        ctx.strokeStyle = 'rgba(79, 195, 247, ' + shieldPulse + ')';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(x, y - 10, 75, 0, Math.PI*2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(79, 195, 247, 0.15)';
        ctx.beginPath();
        ctx.arc(x, y - 10, 75, 0, Math.PI*2);
        ctx.fill();
        // Ikona tarczy
        ctx.fillStyle = '#4fc3f7';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🛡 ZBROJA AKTYWNA', x, y - 120);
    }

    // Napis
    ctx.fillStyle = castleBoss && castleBoss.phase2 ? '#ff1744' : '#ffd700';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(castleBoss && castleBoss.phase2 ? '💀 KRÓL ZOMBIE - FAZA 2' : '👑 KRÓL ZOMBIE', x, y - (bossHasArmor ? 140 : 110));
}

function drawArena() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Kamera
    camera.x = player.x - canvas.width / 2;
    camera.y = player.y - canvas.height / 2;
    camera.x = Math.max(0, Math.min(ARENA_W - canvas.width, camera.x));
    camera.y = Math.max(0, Math.min(ARENA_H - canvas.height, camera.y));

    ctx.save();
    ctx.translate(-camera.x, -camera.y);

    // Tlo areny - zielona trawa
    ctx.fillStyle = '#4a8c2a';
    ctx.fillRect(0, 0, ARENA_W, ARENA_H);

    // Siatka
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 1;
    for (var x = 0; x < ARENA_W; x += 50) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, ARENA_H); ctx.stroke();
    }
    for (var y = 0; y < ARENA_H; y += 50) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(ARENA_W, y); ctx.stroke();
    }

    // Granica areny
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, ARENA_W, ARENA_H);

    // Krzewy
    for (var i = 0; i < bushes.length; i++) {
        var b = bushes[i];
        ctx.fillStyle = '#2d6b1a';
        ctx.beginPath();
        ctx.ellipse(b.x + b.w/2, b.y + b.h/2, b.w/2, b.h/2, 0, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = '#3a8a25';
        ctx.beginPath();
        ctx.ellipse(b.x + b.w/2 - 5, b.y + b.h/2 - 5, b.w/2 - 8, b.h/2 - 8, 0, 0, Math.PI*2);
        ctx.fill();
    }

    // Sciany
    for (var i = 0; i < walls.length; i++) {
        var w = walls[i];
        ctx.fillStyle = '#8d6e4a';
        ctx.fillRect(w.x, w.y, w.w, w.h);
        ctx.fillStyle = '#a0825c';
        ctx.fillRect(w.x + 3, w.y + 3, w.w - 6, w.h - 6);
        ctx.strokeStyle = '#6b5335';
        ctx.lineWidth = 2;
        ctx.strokeRect(w.x, w.y, w.w, w.h);
    }

    // === AKUMULATORY ZBROI ===
    if (accumulators && accumulators.length > 0) {
        var now = Date.now() / 1000;
        for (var ai = 0; ai < accumulators.length; ai++) {
            var acc = accumulators[ai];
            if (!acc.active) {
                // Zniszczony - popioły
                ctx.fillStyle = '#333';
                ctx.beginPath();
                ctx.ellipse(acc.x, acc.y + 5, 20, 8, 0, 0, Math.PI*2);
                ctx.fill();
                continue;
            }
            var pulse = Math.sin(now * 3 + ai) * 6;
            // Poświata
            var grd = ctx.createRadialGradient(acc.x, acc.y, 5, acc.x, acc.y, 50 + pulse);
            grd.addColorStop(0, 'rgba(79, 195, 247, 0.7)');
            grd.addColorStop(1, 'rgba(79, 195, 247, 0)');
            ctx.fillStyle = grd;
            ctx.beginPath();
            ctx.arc(acc.x, acc.y, 50 + pulse, 0, Math.PI*2);
            ctx.fill();
            // Podstawa
            ctx.fillStyle = '#37474f';
            ctx.fillRect(acc.x - 18, acc.y + 10, 36, 20);
            // Filar
            ctx.fillStyle = '#546e7a';
            ctx.fillRect(acc.x - 10, acc.y - 25, 20, 40);
            // Kryształ
            ctx.fillStyle = bossHasArmor ? '#4fc3f7' : '#607d8b';
            ctx.beginPath();
            ctx.moveTo(acc.x, acc.y - 40 - pulse/2);
            ctx.lineTo(acc.x - 14, acc.y - 20);
            ctx.lineTo(acc.x, acc.y - 10);
            ctx.lineTo(acc.x + 14, acc.y - 20);
            ctx.closePath();
            ctx.fill();
            // Błyskawice między kryształem a bossem (efekt energii)
            if (bossHasArmor && castleBoss && Math.random() < 0.3) {
                ctx.strokeStyle = 'rgba(79,195,247,0.5)';
                ctx.lineWidth = 1;
                ctx.setLineDash([4, 8]);
                ctx.beginPath();
                ctx.moveTo(acc.x, acc.y - 30);
                ctx.lineTo(castleBoss.x, castleBoss.y - 30);
                ctx.stroke();
                ctx.setLineDash([]);
            }
            // HP akumulatora
            var hpRatio = acc.hp / acc.maxHp;
            ctx.fillStyle = '#333';
            ctx.fillRect(acc.x - 20, acc.y - 55, 40, 6);
            ctx.fillStyle = hpRatio > 0.5 ? '#4fc3f7' : (hpRatio > 0.25 ? '#ffeb3b' : '#f44336');
            ctx.fillRect(acc.x - 20, acc.y - 55, 40 * hpRatio, 6);
        }
    }

    // === ZAMEK ===
    if (castle && !inCastle) {
        // Zamek widoczny na arenie

        // Cień zamku
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(castle.x + castle.w/2, castle.y + castle.h + 10, castle.w/2 + 20, 30, 0, 0, Math.PI*2);
        ctx.fill();

        // Główna budowla
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(castle.x, castle.y, castle.w, castle.h);

        // Wieża
        ctx.fillStyle = '#4e342e';
        ctx.fillRect(castle.towerX, castle.towerY, castle.towerW, castle.towerH);

        // Okna wieży
        ctx.fillStyle = '#ffeb3b';
        for (var tw = 0; tw < 3; tw++) {
            ctx.fillRect(castle.towerX + 20, castle.towerY + 20 + tw * 30, 15, 20);
        }

        // Dzwonnica na górze wieży
        ctx.fillStyle = '#3e2723';
        ctx.fillRect(castle.towerX + 10, castle.towerY - 30, 60, 30);

        // Drzwi
        if (castle.doorOpen) {
            ctx.fillStyle = '#2e1a0f';
            ctx.fillRect(castle.x + castle.w/2 - 25, castle.y + castle.h - 60, 50, 60);
        } else {
            ctx.fillStyle = '#8d6e63';
            ctx.fillRect(castle.x + castle.w/2 - 25, castle.y + castle.h - 60, 50, 60);
            // Kłódka
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.arc(castle.x + castle.w/2, castle.y + castle.h - 35, 12, 0, Math.PI*2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🔒', castle.x + castle.w/2, castle.y + castle.h - 30);
        }

        // Okna zamku
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(castle.x + 20, castle.y + 40, 30, 40);
        ctx.fillRect(castle.x + castle.w - 50, castle.y + 40, 30, 40);

        // Wejście do zamku - napis zachęcający
        if (castle.doorOpen) {
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🏰 WEJDŹ DO ZAMKU', castle.x + castle.w/2, castle.y + castle.h + 40);
        }
    }

    // === WNĘTRZE ZAMKU ===
    if (inCastle) {
        // Ciemne wnętrze zamku
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Podłoga
        ctx.fillStyle = '#3e2723';
        ctx.fillRect(0, canvas.height - 100, canvas.width, 100);

        // Schody na wieżę (jeśli pokonano wrogów)
        if (castleFloor === 0) {
            // Parter - info
            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🏰 ZAMEK - POKOJE CZARODZIEJÓW', canvas.width/2, 50);
            ctx.fillStyle = '#fff';
            ctx.font = '14px Arial';
            ctx.fillText('Zniszcz wszystkich wrogów aby przejść na wieżę!', canvas.width/2, 80);
            ctx.fillText('⬆ SCHODY NA GÓRĘ', canvas.width/2, canvas.height - 40);

            // Rysuj wrogów w zamku
            for (var i = 0; i < castleEnemies.length; i++) {
                drawEnemy(castleEnemies[i]);
            }
        } else {
            // Wieża - komnata bossa
            ctx.fillStyle = '#7b1fa2';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('👑 KOMNATA KRÓLA ZOMBIE', canvas.width/2, 50);

            // Rysuj wrogów na wieży
            for (var i = 0; i < towerEnemies.length; i++) {
                drawEnemy(towerEnemies[i]);
            }

            // Jeśli nie ma wrogów na wieży - pokaż bossa
            if (towerEnemies.length === 0 && castleEnemies.length === 0 && castleBoss) {
                // Dialog z bossem przed walką
                if (!bossDialogShown) {
                    var d = bossDialogs[bossDialogStep];
                    // Tło dialogu
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
                    ctx.fillRect(50, canvas.height - 180, canvas.width - 100, 150);
                    ctx.strokeStyle = '#ffd700';
                    ctx.lineWidth = 3;
                    ctx.strokeRect(50, canvas.height - 180, canvas.width - 100, 150);
                    // Głos
                    ctx.fillStyle = '#ffd700';
                    ctx.font = 'bold 18px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(d.speaker, canvas.width/2, canvas.height - 150);
                    // Tekst
                    ctx.fillStyle = '#fff';
                    ctx.font = '16px Arial';
                    ctx.fillText(d.text, canvas.width/2, canvas.height - 120);
                    // Instrukcja
                    ctx.fillStyle = '#888';
                    ctx.font = '14px Arial';
                    ctx.fillText('Naciśnij ENTER aby kontynuować...', canvas.width/2, canvas.height - 55);
                    // Zatrzymaj grę podczas dialogu
                    return;
                }

                // Po dialogu - walka z bossem
                drawBoss(castleBoss.x, castleBoss.y);

                // HP bossa
                var bossHpW = 150;
                ctx.fillStyle = '#333';
                ctx.fillRect(canvas.width/2 - bossHpW/2, 100, bossHpW, 15);
                ctx.fillStyle = '#ff0000';
                ctx.fillRect(canvas.width/2 - bossHpW/2, 100, bossHpW * (castleBoss.hp / castleBoss.maxHp), 15);
            }
        }

        // Wyjście z zamku
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('⬇ WYJDŹ', canvas.width/2, canvas.height - 150);
    }

    // Ataki (Data-Driven)
    for (var i = 0; i < attacks.length; i++) {
        var a = attacks[i];
        var ax = a.x + Math.cos(a.angle) * a.dist;
        var ay = a.y + Math.sin(a.angle) * a.dist;
        drawProjectile(a.type, ax, ay, a.angle, a.size);
    }

    // Czasteczki
    for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        ctx.globalAlpha = p.life / 25;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI*2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;

    // === CZARNA DZIURA (super Cieniaka) ===
    if (player.blackHole && player.blackHole.timer > 0) {
        var bh = player.blackHole;
        var progress = bh.timer / bh.maxTimer;
        var currentRadius = bh.radius * (0.5 + 0.5 * progress);
        var pulse = Math.sin(Date.now() / 100) * 5;
        
        // Zewnętrzna poświata
        var gradient = ctx.createRadialGradient(bh.x, bh.y, 10, bh.x, bh.y, currentRadius + pulse);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
        gradient.addColorStop(0.3, 'rgba(49, 27, 146, 0.6)');
        gradient.addColorStop(0.7, 'rgba(74, 20, 140, 0.3)');
        gradient.addColorStop(1, 'rgba(74, 20, 140, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(bh.x, bh.y, currentRadius + pulse, 0, Math.PI * 2);
        ctx.fill();
        
        // Spirala w środku
        ctx.strokeStyle = '#7c4dff';
        ctx.lineWidth = 3;
        var time = Date.now() / 200;
        for (var spi = 0; spi < 4; spi++) {
            ctx.beginPath();
            var spiralR = 15 + (spi * 10 + time * 2) % (currentRadius * 0.6);
            ctx.arc(bh.x, bh.y, spiralR, time + spi * 1.5, time + spi * 1.5 + Math.PI * 1.5);
            ctx.stroke();
        }
        
        // Cząsteczki wokół dziury
        for (var bhp = 0; bhp < 3; bhp++) {
            var angle = (Date.now() / 300 + bhp * 2);
            var dist = currentRadius * 0.8 + Math.sin(Date.now() / 150 + bhp) * 10;
            particles.push({
                x: bh.x + Math.cos(angle) * dist,
                y: bh.y + Math.sin(angle) * dist,
                vx: -Math.cos(angle) * 2,
                vy: -Math.sin(angle) * 2,
                life: 15,
                color: '#9c27b0'
            });
        }
    }

    // === STREFA LAWY (super Magmaka) ===
    if (player.lavaZone && player.lavaZone.timer > 0) {
        var lz = player.lavaZone;
        var pulse = Math.sin(Date.now() / 100) * 8;

        // Lawa - płynąca textura
        var lavaGrad = ctx.createRadialGradient(lz.x, lz.y, 0, lz.x, lz.y, lz.radius + pulse);
        lavaGrad.addColorStop(0, 'rgba(255, 171, 0, 0.9)');
        lavaGrad.addColorStop(0.4, 'rgba(255, 87, 34, 0.7)');
        lavaGrad.addColorStop(0.7, 'rgba(191, 54, 12, 0.5)');
        lavaGrad.addColorStop(1, 'rgba(191, 54, 12, 0)');
        ctx.fillStyle = lavaGrad;
        ctx.beginPath();
        ctx.arc(lz.x, lz.y, lz.radius + pulse, 0, Math.PI * 2);
        ctx.fill();

        // Bąbelki lawy
        for (var lb = 0; lb < 5; lb++) {
            var bAngle = (Date.now() / 500 + lb * 1.3);
            var bDist = lz.radius * 0.3 * Math.sin(Date.now() / 300 + lb);
            ctx.fillStyle = '#ffcc80';
            ctx.beginPath();
            ctx.arc(lz.x + Math.cos(bAngle) * bDist, lz.y + Math.sin(bAngle) * bDist, 4 + Math.sin(Date.now() / 200 + lb) * 2, 0, Math.PI*2);
            ctx.fill();
        }

        // Tekst
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🔥 LAVA', lz.x, lz.y - lz.radius - 10);
    }

    // === RYSOWANIE TRYBÓW SPECJALNYCH ===

    // Piłka nożna
    if (gameMode === 'football' && footballBall) {
        // === BRAMKI Z SIATKAMI ===
        var goalTop = ARENA_H/2 - 80;
        var goalHeight = 160;
        var goalDepth = 60;

        // Lewa bramka (czerwona dla przeciwników)
        // Słupki
        ctx.fillStyle = '#e53935';
        ctx.fillRect(0, goalTop - 5, 8, 10);
        ctx.fillRect(0, goalTop + goalHeight - 5, 8, 10);
        // Poprzeczka
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, goalTop, 6, 4);
        ctx.fillRect(0, goalTop + goalHeight - 4, 6, 4);
        // Siatka (linie)
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 1;
        for (var gy = goalTop + 10; gy < goalTop + goalHeight; gy += 15) {
            ctx.beginPath();
            ctx.moveTo(0, gy);
            ctx.lineTo(goalDepth, gy);
            ctx.stroke();
        }
        for (var gx = 10; gx < goalDepth; gx += 15) {
            ctx.beginPath();
            ctx.moveTo(gx, goalTop);
            ctx.lineTo(gx, goalTop + goalHeight);
            ctx.stroke();
        }

        // Prawa bramka (niebieska dla gracza)
        // Słupki
        ctx.fillStyle = '#2196f3';
        ctx.fillRect(ARENA_W - 8, goalTop - 5, 8, 10);
        ctx.fillRect(ARENA_W - 8, goalTop + goalHeight - 5, 8, 10);
        // Poprzeczka
        ctx.fillStyle = '#fff';
        ctx.fillRect(ARENA_W - 6, goalTop, 6, 4);
        ctx.fillRect(ARENA_W - 6, goalTop + goalHeight - 4, 6, 4);
        // Siatka (linie)
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        for (var gy = goalTop + 10; gy < goalTop + goalHeight; gy += 15) {
            ctx.beginPath();
            ctx.moveTo(ARENA_W, gy);
            ctx.lineTo(ARENA_W - goalDepth, gy);
            ctx.stroke();
        }
        for (var gx = ARENA_W - 10; gx > ARENA_W - goalDepth; gx -= 15) {
            ctx.beginPath();
            ctx.moveTo(gx, goalTop);
            ctx.lineTo(gx, goalTop + goalHeight);
            ctx.stroke();
        }

        // Linie bramkowe
        ctx.strokeStyle = 'rgba(255,255,255,0.6)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(0, goalTop);
        ctx.lineTo(0, goalTop + goalHeight);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(ARENA_W, goalTop);
        ctx.lineTo(ARENA_W, goalTop + goalHeight);
        ctx.stroke();
        ctx.setLineDash([]);

        // Piłka
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(footballBall.x, footballBall.y, footballBall.radius, 0, Math.PI*2);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
        // Wzór na piłce
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(footballBall.x - 3, footballBall.y - 3, 4, 0, Math.PI*2);
        ctx.arc(footballBall.x + 5, footballBall.y + 2, 3, 0, Math.PI*2);
        ctx.fill();

        // Zasięg podnoszenia piłki (półprzezroczyste kółko gdy nikt nie trzyma)
        if (ballHolder === null) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.arc(footballBall.x, footballBall.y, 60, 0, Math.PI*2);
            ctx.stroke();
            ctx.setLineDash([]);

            // Wskaźnik " podejdź aby podnieść"
            var pdx = player.x - footballBall.x;
            var pdy = player.y - footballBall.y;
            var pdist = Math.sqrt(pdx*pdx + pdy*pdy);
            if (pdist < 100 && pdist >= 60) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.font = 'bold 12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('⚽ podejdź bliżej', footballBall.x, footballBall.y - 25);
            }
        }

        // Wskaźnik trzymania piłki nad graczem
        if (ballHolder === 'player') {
            ctx.fillStyle = '#2196f3';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('⚽ TRZYMAM! Kliknij aby strzelić', player.x, player.y - 60);
        } else if (ballHolder && ballHolder.startsWith('ally')) {
            var idx = parseInt(ballHolder.replace('ally', ''));
            if (footballAllies[idx]) {
                ctx.fillStyle = '#4caf50';
                ctx.font = 'bold 12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('⚽ SOJUSZNIK', footballAllies[idx].x, footballAllies[idx].y - 50);
            }
        } else if (ballHolder && ballHolder.startsWith('enemy')) {
            var idx = parseInt(ballHolder.replace('enemy', ''));
            if (enemies[idx]) {
                ctx.fillStyle = '#f44336';
                ctx.font = 'bold 12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('⚽ WRÓG!', enemies[idx].x, enemies[idx].y - 50);
            }
        }
    }

    // Gniazdo zombie
    if (gameMode === 'nest' && nestObject) {
        // Mrok wokół gniazda
        var nestGradient = ctx.createRadialGradient(nestObject.x, nestObject.y, 20, nestObject.x, nestObject.y, 100);
        nestGradient.addColorStop(0, 'rgba(74, 20, 140, 0.5)');
        nestGradient.addColorStop(1, 'rgba(74, 20, 140, 0)');
        ctx.fillStyle = nestGradient;
        ctx.beginPath();
        ctx.arc(nestObject.x, nestObject.y, 100, 0, Math.PI*2);
        ctx.fill();

        // Gniazdo (wielki fioletowy blok)
        ctx.fillStyle = '#4a148c';
        ctx.fillRect(nestObject.x - 40, nestObject.y - 40, 80, 80);
        ctx.fillStyle = '#7b1fa2';
        ctx.fillRect(nestObject.x - 30, nestObject.y - 30, 60, 60);
        // Oczy gniazda
        ctx.fillStyle = '#e040fb';
        ctx.beginPath();
        ctx.arc(nestObject.x - 15, nestObject.y - 10, 8, 0, Math.PI*2);
        ctx.arc(nestObject.x + 15, nestObject.y - 10, 8, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(nestObject.x - 15, nestObject.y - 10, 4, 0, Math.PI*2);
        ctx.arc(nestObject.x + 15, nestObject.y - 10, 4, 0, Math.PI*2);
        ctx.fill();
        // Szczęka
        ctx.fillStyle = '#e040fb';
        ctx.fillRect(nestObject.x - 20, nestObject.y + 15, 40, 10);

        // HP gniazda
        ctx.fillStyle = '#333';
        ctx.fillRect(nestObject.x - 40, nestObject.y - 60, 80, 8);
        ctx.fillStyle = nestObject.hp > 100 ? '#e040fb' : '#ff4444';
        ctx.fillRect(nestObject.x - 40, nestObject.y - 60, 80 * (nestObject.hp / nestObject.maxHp), 8);
    }

    // Przeciwnicy
    for (var i = 0; i < enemies.length; i++) {
        drawEnemy(enemies[i]);
    }

    // Sojusznicy w pilce noznej
    if (gameMode === 'football') {
        for (var i = 0; i < footballAllies.length; i++) {
            drawAlly(footballAllies[i]);
        }
    }

    // Celownik super ataku (Data-Driven)
    if (player.superReady) {
        var char = characters[player.character] || characters[Object.keys(characters)[0]];
        if (!char) return;
        var worldMX = mouse.x + camera.x;
        var worldMY = mouse.y + camera.y;
        var sdx = worldMX - player.x;
        var sdy = worldMY - player.y;
        var sdist = Math.sqrt(sdx*sdx + sdy*sdy);
        var maxR = char.superRange;
        if (sdist > maxR) { sdx = sdx/sdist*maxR; sdy = sdy/sdist*maxR; }
        var targetX = player.x + sdx;
        var targetY = player.y + sdy;

        if (char.superVisual === 'charge') {
            // Szarża - szeroka linia
            ctx.setLineDash([]);
            ctx.strokeStyle = 'rgba(255, 109, 0, 0.5)';
            ctx.lineWidth = 30;
            ctx.beginPath();
            ctx.moveTo(player.x, player.y);
            ctx.lineTo(targetX, targetY);
            ctx.stroke();
            ctx.strokeStyle = 'rgba(255, 150, 50, 0.8)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(player.x, player.y);
            ctx.lineTo(targetX, targetY);
            ctx.stroke();
        } else if (char.superVisual === 'blackhole') {
            // Czarna dziura - obszar wokół gracza (nie skacze!)
            var pullRadius = char.superPullRadius || 150;
            // Gradient czarnej dziury wokół gracza
            var gradient = ctx.createRadialGradient(player.x, player.y, 20, player.x, player.y, pullRadius);
            gradient.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
            gradient.addColorStop(0.5, 'rgba(49, 27, 146, 0.4)');
            gradient.addColorStop(1, 'rgba(74, 20, 140, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(player.x, player.y, pullRadius, 0, Math.PI * 2);
            ctx.fill();
            // Obwódka
            ctx.strokeStyle = 'rgba(156, 39, 176, 0.8)';
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.arc(player.x, player.y, pullRadius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
            // Tekst
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🌑 CZARNA DZIURA', player.x, player.y - pullRadius - 10);
        } else if (char.superVisual === 'throwblackhole') {
            // Cieniak - rzut czarną dziurą - pokazuje gdzie dziura wyląduje
            var pullRadius = char.superPullRadius || 180;
            // Linia rzutu
            ctx.strokeStyle = 'rgba(124, 77, 255, 0.6)';
            ctx.lineWidth = 3;
            ctx.setLineDash([8, 8]);
            ctx.beginPath();
            ctx.moveTo(player.x, player.y);
            ctx.lineTo(targetX, targetY);
            ctx.stroke();
            ctx.setLineDash([]);
            // Miejsce lądowania - podgląd czarnej dziury
            var gradient = ctx.createRadialGradient(targetX, targetY, 10, targetX, targetY, pullRadius);
            gradient.addColorStop(0, 'rgba(0, 0, 0, 0.6)');
            gradient.addColorStop(0.5, 'rgba(49, 27, 146, 0.3)');
            gradient.addColorStop(1, 'rgba(74, 20, 140, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(targetX, targetY, pullRadius, 0, Math.PI * 2);
            ctx.fill();
            // Obwódka miejsca lądowania
            ctx.strokeStyle = 'rgba(124, 77, 255, 0.8)';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.arc(targetX, targetY, pullRadius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
            // Mała dziura w miejscu docelowym
            ctx.fillStyle = '#311b92';
            ctx.beginPath();
            ctx.arc(targetX, targetY, 15, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
            // Tekst
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🌑 RZUT', targetX, targetY - pullRadius - 8);
        } else if (char.superVisual === 'lava') {
            // Magmak - strefa lawy - pokaż gdzie będzie lawa
            var lavaRadius = char.superRadius || 120;
            // Podgląd strefy
            var lavaGrad = ctx.createRadialGradient(targetX, targetY, 0, targetX, targetY, lavaRadius);
            lavaGrad.addColorStop(0, 'rgba(255, 171, 0, 0.4)');
            lavaGrad.addColorStop(0.5, 'rgba(255, 87, 34, 0.3)');
            lavaGrad.addColorStop(1, 'rgba(191, 54, 12, 0)');
            ctx.fillStyle = lavaGrad;
            ctx.beginPath();
            ctx.arc(targetX, targetY, lavaRadius, 0, Math.PI * 2);
            ctx.fill();
            // Obwódka
            ctx.strokeStyle = 'rgba(255, 87, 34, 0.8)';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.arc(targetX, targetY, lavaRadius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
            // Tekst
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🔥 STREFA LAWY', targetX, targetY - lavaRadius - 8);
        } else {
            // Skok - linia + kółko
            ctx.setLineDash([8, 8]);
            ctx.strokeStyle = 'rgba(255, 255, 0, 0.6)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(player.x, player.y);
            ctx.lineTo(targetX, targetY);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(targetX, targetY, 60, 0, Math.PI*2);
            ctx.stroke();
        }
    }

    // Gracz
    drawPlayer();

    // Teksty obrazen
    for (var i = 0; i < damageTexts.length; i++) {
        var dt = damageTexts[i];
        ctx.globalAlpha = dt.life / 30;
        ctx.fillStyle = dt.color;
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(dt.text, dt.x, dt.y);
    }
    ctx.globalAlpha = 1;

    ctx.restore();

    // UI
    drawUI();
}

function drawPlayer() {
    // W pilce noznej - nie rysuj gdy martwy (respawn)
    if (gameMode === 'football' && player.hp <= 0) {
        // Efekt respawnu - licznik
        if (player.respawnTimer > 0) {
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 30px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('RESPAWN: ' + Math.ceil(player.respawnTimer / 60), player.x, player.y - 50);
        }
        return;
    }

    var px = player.x;
    var py = player.y;
    var char = characters[player.character] || characters[Object.keys(characters)[0]];
    if (!char) return;

    // Cien
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(px, py + 28, 22, 8, 0, 0, Math.PI*2);
    ctx.fill();

    // Wybierz renderer na podstawie postaci
    var gameChar = characters[player.character] || characters[Object.keys(characters)[0]];
    if (gameChar.skinFamily === 'blazer') drawBlazerInGame(px, py, player.skin);
    else if (gameChar.skinFamily === 'frostik') drawFrostikInGame(px, py, player.skin);
    else if (gameChar.skinFamily === 'cieniak') drawCieniakInGame(px, py, player.skin);
    else if (gameChar.skinFamily === 'magmak') drawMagmakInGame(px, py, player.skin);
    else if (gameChar.skinFamily === 'ultrazombi') drawUltraZombiInGame(px, py, player.skin);
    else if (gameChar.skinFamily === 'zlotek') drawZlotekInGame(px, py, player.skin);
    else if (gameChar.skinFamily === 'toksyk') drawToksykInGame(px, py, player.skin);
    else if (gameChar.skinFamily === 'duszek') drawDuszekInGame(px, py, player.skin);
    else drawNoobekInGame(px, py, player.skin, player.character);

    // HP bar nad glowa
    var hpW = 40;
    ctx.fillStyle = '#333';
    ctx.fillRect(px - hpW/2, py - 48, hpW, 5);
    ctx.fillStyle = player.hp > 30 ? '#4cff50' : '#ff4444';
    ctx.fillRect(px - hpW/2, py - 48, hpW * (player.hp / player.maxHp), 5);
}

function drawEnemy(e) {
    // Nie rysuj martwych wrogow (respawn w pilce noznej)
    if (e.isDead) return;

    // Rysuj roboty inaczej
    if (e.isRobot) {
        // Mały robot
        ctx.fillStyle = '#607d8b';
        ctx.fillRect(e.x - 20, e.y - 25, 40, 50);
        // Głowa
        ctx.fillStyle = '#455a64';
        ctx.fillRect(e.x - 15, e.y - 35, 30, 20);
        // Oczy
        ctx.fillStyle = '#00e676';
        ctx.fillRect(e.x - 10, e.y - 30, 6, 6);
        ctx.fillRect(e.x + 4, e.y - 30, 6, 6);
        // HP
        if (e.hp < e.maxHp) {
            ctx.fillStyle = '#333';
            ctx.fillRect(e.x - 20, e.y - 50, 40, 5);
            ctx.fillStyle = '#00e676';
            ctx.fillRect(e.x - 20, e.y - 50, 40 * (e.hp / e.maxHp), 5);
        }
        return;
    }
    if (e.isRobotBoss) {
        // Duży boss robot
        // Gdy ładuje atak - czerwona poświata
        if (e.isCharging) {
            var chargeProgress = 1 - (e.chargeTimer / 120);
            var glowSize = 60 + Math.sin(Date.now() / 50) * 10;
            var grad = ctx.createRadialGradient(e.x, e.y, 20, e.x, e.y, glowSize);
            grad.addColorStop(0, 'rgba(255, 87, 34, ' + (0.6 * chargeProgress) + ')');
            grad.addColorStop(0.5, 'rgba(255, 152, 0, ' + (0.4 * chargeProgress) + ')');
            grad.addColorStop(1, 'rgba(255, 87, 34, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(e.x, e.y, glowSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Płomień nad głową
            ctx.fillStyle = '#ff5722';
            var flameHeight = 30 * chargeProgress;
            ctx.beginPath();
            ctx.moveTo(e.x - 15, e.y - 55 - flameHeight);
            ctx.lineTo(e.x, e.y - 55 - flameHeight - 15);
            ctx.lineTo(e.x + 15, e.y - 55 - flameHeight);
            ctx.fill();
        }
        
        ctx.fillStyle = '#37474f';
        ctx.fillRect(e.x - 30, e.y - 40, 60, 80);
        // Głowa
        ctx.fillStyle = '#263238';
        ctx.fillRect(e.x - 25, e.y - 55, 50, 30);
        
        // Gdy ładuje - oczy się rozświetlają
        ctx.fillStyle = e.isCharging ? '#ffeb3b' : '#ff1744';
        ctx.fillRect(e.x - 18, e.y - 45, 12, 12);
        ctx.fillRect(e.x + 6, e.y - 45, 12, 12);
        
        // HP
        ctx.fillStyle = '#333';
        ctx.fillRect(e.x - 30, e.y - 70, 60, 6);
        ctx.fillStyle = '#ff1744';
        ctx.fillRect(e.x - 30, e.y - 70, 60 * (e.hp / e.maxHp), 6);
        
        // Napis "ŁADUJE" gdy ładuje
        if (e.isCharging) {
            ctx.fillStyle = '#ff5722';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🔥 ŁADUJE...', e.x, e.y - 80);
        }
        return;
    }

    // Cien
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(e.x, e.y + 28, 22, 8, 0, 0, Math.PI*2);
    ctx.fill();

    // Nogi
    ctx.fillStyle = '#555';
    ctx.fillRect(e.x - 14, e.y + 8, 10, 18);
    ctx.fillRect(e.x + 4, e.y + 8, 10, 18);

    // Cialo
    ctx.fillStyle = e.color;
    ctx.fillRect(e.x - 18, e.y - 15, 36, 25);

    // Rece
    ctx.fillStyle = '#aaa';
    ctx.fillRect(e.x - 26, e.y - 13, 8, 22);
    ctx.fillRect(e.x + 18, e.y - 13, 8, 22);

    // Łuk dla łuczniczych zombie
    if (e.hasBow) {
        ctx.strokeStyle = '#8d6e63';
        ctx.lineWidth = 3;
        // Łuk
        ctx.beginPath();
        ctx.arc(e.x + 22, e.y - 5, 20, -Math.PI * 0.6, Math.PI * 0.6);
        ctx.stroke();
        // Cięciwa
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(e.x + 22, e.y - 25);
        ctx.lineTo(e.x + 22, e.y + 15);
        ctx.stroke();
        // Strzała
        ctx.strokeStyle = '#5d4037';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(e.x + 22, e.y - 15);
        ctx.lineTo(e.x + 40, e.y - 15);
        ctx.stroke();
        // Grocik strzały
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.moveTo(e.x + 40, e.y - 15);
        ctx.lineTo(e.x + 36, e.y - 17);
        ctx.lineTo(e.x + 36, e.y - 13);
        ctx.fill();
    }

    // Glowa
    ctx.fillStyle = '#aaa';
    ctx.fillRect(e.x - 20, e.y - 40, 40, 28);

    // Oczy
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(e.x - 8, e.y - 28, 4, 0, Math.PI*2);
    ctx.arc(e.x + 8, e.y - 28, 4, 0, Math.PI*2);
    ctx.fill();

    // HP bar
    var hpW = 40;
    ctx.fillStyle = '#333';
    ctx.fillRect(e.x - hpW/2, e.y - 48, hpW, 5);
    ctx.fillStyle = '#ff4444';
    ctx.fillRect(e.x - hpW/2, e.y - 48, hpW * (e.hp / e.maxHp), 5);
    // Ikona spowolnienia
    if (e.slowTimer && e.slowTimer > 0) {
        ctx.fillStyle = '#00bcd4';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🐌', e.x, e.y - 55);
    }
    // Ikona zamrożenia
    if (e.stunTimer && e.stunTimer > 0) {
        ctx.fillStyle = '#29b6f6';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('❄️', e.x, e.y - 55);
    }
    // Ikona podpalenia
    if (e.burnTimer && e.burnTimer > 0) {
        ctx.fillStyle = '#ff5722';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🔥', e.x, e.y - 55);
    }
    // Etykieta typu zombie
    if (e.label) {
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(e.label, e.x, e.y - 58);
    }
    // Zbroja rycerza
    if (e.hasArmor) {
        ctx.strokeStyle = 'rgba(189,189,189,0.6)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(e.x, e.y - 10, 28, 0, Math.PI * 2);
        ctx.stroke();
    }
    // Szaman leczący — zielony efekt
    if (e.isShaman && e.healCooldown < 30) {
        ctx.strokeStyle = 'rgba(0,230,118,0.6)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(e.x, e.y - 10, 35, 0, Math.PI * 2);
        ctx.stroke();
    }
    // Berserk — czerwony blask przy niskim HP
    if (e.type === 'zombieBerserker' && e.hp < e.maxHp * 0.4) {
        ctx.strokeStyle = 'rgba(183,28,28,0.7)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(e.x, e.y - 10, 30, 0, Math.PI * 2);
        ctx.stroke();
    }
}

function drawAlly(a) {
    // Nie rysuj martwych sojusznikow (respawn)
    if (a.isDead) return;

    // Cien
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(a.x, a.y + 28, 22, 8, 0, 0, Math.PI*2);
    ctx.fill();

    // Nogi - niebieskie
    ctx.fillStyle = '#1565c0';
    ctx.fillRect(a.x - 14, a.y + 8, 10, 18);
    ctx.fillRect(a.x + 4, a.y + 8, 10, 18);

    // Cialo - niebieskie
    ctx.fillStyle = '#2196f3';
    ctx.fillRect(a.x - 18, a.y - 15, 36, 25);

    // Rece
    ctx.fillStyle = '#64b5f6';
    ctx.fillRect(a.x - 26, a.y - 13, 8, 22);
    ctx.fillRect(a.x + 18, a.y - 13, 8, 22);

    // Glowa
    ctx.fillStyle = '#64b5f6';
    ctx.fillRect(a.x - 20, a.y - 40, 40, 28);

    // Oczy - przyjazne
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(a.x - 8, a.y - 28, 4, 0, Math.PI*2);
    ctx.arc(a.x + 8, a.y - 28, 4, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#0d47a1';
    ctx.beginPath();
    ctx.arc(a.x - 8, a.y - 28, 2, 0, Math.PI*2);
    ctx.arc(a.x + 8, a.y - 28, 2, 0, Math.PI*2);
    ctx.fill();

    // HP bar
    var hpW = 40;
    ctx.fillStyle = '#333';
    ctx.fillRect(a.x - hpW/2, a.y - 48, hpW, 5);
    ctx.fillStyle = '#4caf50';
    ctx.fillRect(a.x - hpW/2, a.y - 48, hpW * (a.hp / a.maxHp), 5);

    // Etykieta SOJUSZNIK
    ctx.fillStyle = '#2196f3';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SOJUSZNIK', a.x, a.y - 55);
}

function drawUI() {
    // HP bar
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(20, canvas.height - 50, 204, 24);
    ctx.fillStyle = player.hp > 30 ? '#4cff50' : '#ff4444';
    ctx.fillRect(22, canvas.height - 48, 200 * (player.hp / player.maxHp), 20);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('HP ' + player.hp + '/' + player.maxHp, 122, canvas.height - 34);

    // Super bar
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(20, canvas.height - 80, 204, 20);
    ctx.fillStyle = player.superCharge >= 100 ? '#ffff00' : '#ff9800';
    ctx.fillRect(22, canvas.height - 78, 200 * (player.superCharge / 100), 16);
    if (player.hasHypercharge && player.superCharge >= 100) {
        var t = Date.now() / 1000;
        ctx.shadowColor = '#bf00ff';
        ctx.shadowBlur = 10 + Math.sin(t * 6) * 5;
    }
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Arial';
    var superLabel = player.superCharge >= 100 ? 'SUPER GOTOWY! [SPACJA]' : 'SUPER ' + Math.floor(player.superCharge) + '%';
    ctx.fillText(superLabel, 122, canvas.height - 67);
    ctx.shadowBlur = 0;


        ctx.fillStyle = hcColor;
        ctx.fillRect(22, canvas.height - 54, 200 * hc, 10);
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px Arial';
        var hcLabel = player.hyperchargeCharge >= 100 ? '⚡ HYPERCHARGE GOTOWY!' : '⚡ HYPERCHARGE ' + Math.floor(player.hyperchargeCharge) + '%';
        ctx.fillText(hcLabel, 122, canvas.height - 44);
    }

    // Monety
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(canvas.width - 150, 15, 135, 30);
    ctx.fillStyle = '#ffd740';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('💰 ' + coins, canvas.width - 25, 36);

    // Przeciwnicy pozostali (policz tylko żywych)
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(canvas.width/2 - 70, 15, 140, 30);
    ctx.fillStyle = '#ff4444';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    var aliveEnemies = 0;
    for(var ec=0; ec<enemies.length; ec++) { 
        if(enemies[ec].hp > 0) aliveEnemies++; 
    }
    ctx.fillText('Wrogów: ' + aliveEnemies + '/9', canvas.width/2, 36);

    // Sterowanie info
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('WASD = ruch | Klik = atak | SUPER = przycisk | ESC = lobby', 20, 25);

    // === HUD AKUMULATORÓW (poziom 100) ===
    if (arenaLevel >= 100 && accumulators && accumulators.length > 0) {
        var hudX = 20;
        var hudY = canvas.height - 130;
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(hudX, hudY, 220, 40);
        ctx.fillStyle = '#4fc3f7';
        ctx.font = 'bold 13px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('⚡ AKUMULATORY ZBROI:', hudX + 8, hudY + 14);
        for (var hi = 0; hi < accumulators.length; hi++) {
            ctx.fillStyle = accumulators[hi].active ? '#4fc3f7' : '#555';
            ctx.font = '16px Arial';
            ctx.fillText(accumulators[hi].active ? '⚡' : '💥', hudX + 8 + hi * 50, hudY + 34);
        }
        if (!bossHasArmor) {
            ctx.fillStyle = '#ff1744';
            ctx.font = 'bold 13px Arial';
            ctx.fillText('🔥 ZBROJA ZNISZCZONA!', hudX + 8, hudY + 34);
        }
    }

    // === KOMUNIKAT FAZY 2 ===
    if (phase2Message && phase2Message.timer > 0) {
        var alpha = Math.min(1, phase2Message.timer / 30);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(canvas.width/2 - 220, canvas.height/2 - 60, 440, 120);
        ctx.fillStyle = '#ff1744';
        ctx.font = 'bold 52px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('⚠ FAZA 2!', canvas.width/2, canvas.height/2 - 5);
        ctx.fillStyle = '#fff';
        ctx.font = '22px Arial';
        ctx.fillText('Zbroja zniszczona - Boss wściekły!', canvas.width/2, canvas.height/2 + 40);
        ctx.globalAlpha = 1;
    }
}
