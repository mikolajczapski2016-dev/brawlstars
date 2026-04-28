// Lobby character rendering functions

// === EFEKTY WYJŚCIA Z GROBU (wspólne dla wszystkich postaci) ===
function drawGraveDirt(ctx, px, py) {
    // Brązowe kępy ziemi — statyczne pozycje na ciele
    var dirtSpots = [
        { x: -10, y: -28, rx: 5, ry: 3, a: -0.3 },
        { x:   9, y: -18, rx: 4, ry: 2.5, a:  0.5 },
        { x:  -5, y:  -2, rx: 6, ry: 4,   a:  0.1 },
        { x:  13, y:   6, rx: 4, ry: 3,   a: -0.2 },
        { x: -15, y:  -8, rx: 3, ry: 2,   a:  0.4 },
        { x:   3, y:  -10, rx: 3, ry: 2,  a: -0.1 },
        { x:  -8, y:  14, rx: 5, ry: 3,   a:  0.2 },
        { x:  11, y: -30, rx: 3, ry: 2,   a: -0.4 },
        { x: -16, y:  10, rx: 4, ry: 2.5, a:  0.3 },
    ];
    ctx.fillStyle = 'rgba(90, 52, 18, 0.72)';
    for (var i = 0; i < dirtSpots.length; i++) {
        var d = dirtSpots[i];
        ctx.beginPath();
        ctx.ellipse(px + d.x, py + d.y, d.rx, d.ry, d.a, 0, Math.PI * 2);
        ctx.fill();
    }
    // Kępki trawy przy nogach — jakby właśnie wyszedł z ziemi
    ctx.fillStyle = 'rgba(80, 48, 15, 0.85)';
    ctx.fillRect(px - 20, py + 26, 40, 5);
    var grassTufts = [-16, -9, -2, 5, 13];
    for (var g = 0; g < grassTufts.length; g++) {
        ctx.fillStyle = g % 2 === 0 ? '#3a6b20' : '#2d5519';
        ctx.beginPath();
        ctx.moveTo(px + grassTufts[g],     py + 26);
        ctx.lineTo(px + grassTufts[g] - 2, py + 18);
        ctx.lineTo(px + grassTufts[g] + 2, py + 20);
        ctx.lineTo(px + grassTufts[g] + 4, py + 26);
        ctx.closePath();
        ctx.fill();
    }
    // Robak
    ctx.fillStyle = '#c8b46a';
    ctx.beginPath();
    ctx.arc(px - 5, py + 4, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(px - 8, py + 6, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(px - 10, py + 8, 1.5, 0, Math.PI * 2);
    ctx.fill();
    // Postrzępiony kawałek materiału (strzęp)
    ctx.fillStyle = 'rgba(25, 15, 5, 0.55)';
    ctx.fillRect(px - 17, py + 8, 5, 3);
    ctx.fillRect(px + 11, py + 12, 4, 2);
    ctx.fillRect(px - 14, py - 8, 4, 2);
}

function drawLobbyToksyk(ctx, px, py, skinId) {
    var time = Date.now() / 1000;
    
    // Kolory dla skinów Toksyka
    var colors = {
        'default': { body: '#00e676', bodyDark: '#00c853', bodyLight: '#69f0ae', glow: '#b9f6ca', eye: '#fff', pupil: '#1b5e20' },
        'toxic': { body: '#76ff03', bodyDark: '#64dd17', bodyLight: '#b2ff59', glow: '#f0ff4d', eye: '#ffff00', pupil: '#33691e' },
        'radioactive': { body: '#00bcd4', bodyDark: '#00acc1', bodyLight: '#4dd0e1', glow: '#84ffff', eye: '#e0f7fa', pupil: '#006064' },
        'venom': { body: '#e91e63', bodyDark: '#c2185b', bodyLight: '#f48fb1', glow: '#f8bbd0', eye: '#ffcdd2', pupil: '#880e4f' }
    };
    var c = colors[skinId] || colors['default'];
    
    // Tło postaci - świecąca poświata
    var glowSize = 60 + Math.sin(time * 2) * 5;
    var glow = ctx.createRadialGradient(px, py, 10, px, py, glowSize);
    glow.addColorStop(0, 'rgba(0, 230, 118, 0.3)');
    glow.addColorStop(1, 'rgba(0, 230, 118, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(px, py, glowSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Głowa - kształt ślimaka/smoka
    var bounce = Math.sin(time * 3) * 3;
    
    // Cień pod postacią
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(px, py + 35, 25, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Nogi/slizg
    ctx.fillStyle = c.bodyDark;
    ctx.beginPath();
    ctx.ellipse(px - 15, py + 25, 18, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(px + 15, py + 25, 18, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Ciało - owalny kształt ślimaka
    ctx.fillStyle = c.body;
    ctx.beginPath();
    ctx.ellipse(px, py + bounce, 30, 25, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Błyski na ciele
    ctx.fillStyle = c.bodyLight;
    ctx.beginPath();
    ctx.ellipse(px - 10, py - 5 + bounce, 8, 6, -0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Głowa
    ctx.fillStyle = c.body;
    ctx.beginPath();
    ctx.ellipse(px, py - 15 + bounce, 22, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Czułki
    var antennaAngle = Math.sin(time * 2) * 0.2;
    ctx.strokeStyle = c.body;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(px - 10, py - 25 + bounce);
    ctx.quadraticCurveTo(px - 15 + Math.sin(time)*5, py - 40 + bounce, px - 12 + Math.sin(time)*8, py - 45 + bounce);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(px + 10, py - 25 + bounce);
    ctx.quadraticCurveTo(px + 15 - Math.sin(time)*5, py - 40 + bounce, px + 12 - Math.sin(time)*8, py - 45 + bounce);
    ctx.stroke();
    
    // Kuleczki na czułkach
    ctx.fillStyle = c.glow;
    ctx.beginPath();
    ctx.arc(px - 12 + Math.sin(time)*8, py - 45 + bounce, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(px + 12 - Math.sin(time)*8, py - 45 + bounce, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Oczy
    ctx.fillStyle = c.eye;
    ctx.beginPath();
    ctx.ellipse(px - 8, py - 18 + bounce, 8, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(px + 8, py - 18 + bounce, 8, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Źrenice
    ctx.fillStyle = c.pupil;
    ctx.beginPath();
    ctx.arc(px - 8, py - 17 + bounce, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(px + 8, py - 17 + bounce, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Błyski w oczach
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(px - 10, py - 20 + bounce, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(px + 6, py - 20 + bounce, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Uśmiech
    ctx.strokeStyle = c.pupil;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(px, py - 8 + bounce, 8, 0.2, Math.PI - 0.2);
    ctx.stroke();
    
    // Kropelki trucizny spływające
    if (Math.sin(time * 3) > 0.5) {
        ctx.fillStyle = c.bodyLight;
        ctx.beginPath();
        ctx.ellipse(px + 25, py + bounce, 4, 6, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    drawGraveDirt(ctx, px, py);
}

function drawLobbyZlotek(ctx, px, py, skinId) {
    var time = Date.now() / 1000;
    var spin = time * 2;
    
    // Kolory dla skinów Złotka
    var colors = {
        'default': { body: '#ffd700', bodyLight: '#ffeb3b', bodyDark: '#ff8f00', crown: '#ffd700', eye: '#4caf50', coin: '#ffc107' },
        'rich': { body: '#ffeb3b', bodyLight: '#fff59d', bodyDark: '#ffc107', crown: '#ffca28', eye: '#00e676', coin: '#ffd700' },
        'diamond': { body: '#e0f7fa', bodyLight: '#b2ebf2', bodyDark: '#4dd0e1', crown: '#ffffff', eye: '#00bcd4', coin: '#e0f7fa' }
    };
    var c = colors[skinId] || colors['default'];
    
    // Poświata złota
    var gradient = ctx.createRadialGradient(px, py, 10, px, py, 60);
    gradient.addColorStop(0, 'rgba(255, 215, 0, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(px, py - 10, 60, 0, Math.PI * 2);
    ctx.fill();
    
    // Korona
    ctx.fillStyle = c.crown;
    ctx.beginPath();
    ctx.moveTo(px - 20, py - 45);
    ctx.lineTo(px - 15, py - 60);
    ctx.lineTo(px - 5, py - 50);
    ctx.lineTo(px, py - 70);
    ctx.lineTo(px + 5, py - 50);
    ctx.lineTo(px + 15, py - 60);
    ctx.lineTo(px + 20, py - 45);
    ctx.closePath();
    ctx.fill();
    
    // Glowa - kula złota
    ctx.fillStyle = c.body;
    ctx.beginPath();
    ctx.arc(px, py - 25, 20, 0, Math.PI * 2);
    ctx.fill();
    
    // Oczy
    ctx.fillStyle = c.eye;
    ctx.beginPath();
    ctx.arc(px - 7, py - 25, 4, 0, Math.PI * 2);
    ctx.arc(px + 7, py - 25, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(px - 6, py - 25, 2, 0, Math.PI * 2);
    ctx.arc(px + 8, py - 25, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Ciało
    ctx.fillStyle = c.bodyDark;
    ctx.fillRect(px - 12, py - 5, 24, 20);
    
    // Monety zamiast rąk
    ctx.fillStyle = c.coin;
    var coinSpin = spin * 3;
    ctx.beginPath();
    ctx.ellipse(px - 20, py, 10 + Math.sin(coinSpin) * 2, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(px + 20, py, 10 + Math.sin(coinSpin + Math.PI) * 2, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Nogi - złote dyski
    ctx.fillStyle = c.body;
    var bounce = Math.sin(time * 3) * 3;
    ctx.beginPath();
    ctx.ellipse(px - 8, py + 18 + bounce, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(px + 8, py + 18 + bounce, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Martwe oczy (szare X zamiast kolorowych źrenic)
    ctx.strokeStyle = 'rgba(80,60,0,0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px - 10, py - 28); ctx.lineTo(px - 4, py - 22);
    ctx.moveTo(px - 4,  py - 28); ctx.lineTo(px - 10, py - 22);
    ctx.moveTo(px + 4,  py - 28); ctx.lineTo(px + 10, py - 22);
    ctx.moveTo(px + 10, py - 28); ctx.lineTo(px + 4,  py - 22);
    ctx.stroke();
    // Rysa na koronie
    ctx.strokeStyle = 'rgba(120, 80, 0, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px - 2, py - 68); ctx.lineTo(px + 3, py - 55); ctx.lineTo(px - 1, py - 48);
    ctx.stroke();
    drawGraveDirt(ctx, px, py);
}

function drawLobbyDuszek(ctx, px, py, skinId) {
    var time = Date.now() / 1000;
    
    // Kolory dla skinów Duszka
    var colors = {
        'default': { body: '#e8e8e8', bodyDark: '#bdbdbd', glow: 'rgba(255,255,255,0.3)', eye: '#000', pupil: '#fff' },
        'spooky': { body: '#9e9e9e', bodyDark: '#616161', glow: 'rgba(158,158,158,0.3)', eye: '#ff0000', pupil: '#000' },
        'cursed': { body: '#7b1fa2', bodyDark: '#4a148c', glow: 'rgba(156,39,176,0.3)', eye: '#fff', pupil: '#e1bee7' },
        'phantom': { body: '#00bcd4', bodyDark: '#00838f', glow: 'rgba(0,188,212,0.3)', eye: '#ffff00', pupil: '#ff6f00' }
    };
    var c = colors[skinId] || colors['default'];
    
    // Lewitacja
    var floatY = Math.sin(time * 2) * 8;
    var wave = Math.sin(time * 3) * 2;
    
    // Poświata ducha
    var glowSize = 70 + Math.sin(time * 2) * 5;
    var glow = ctx.createRadialGradient(px, py + floatY, 10, px, py + floatY, glowSize);
    glow.addColorStop(0, c.glow);
    glow.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(px, py + floatY, glowSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Cień (elipsa na dole)
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(px, py + 35, 25 - Math.abs(floatY)/4, 6 - Math.abs(floatY)/8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Ogon ducha (falisty)
    ctx.fillStyle = c.body;
    ctx.beginPath();
    ctx.moveTo(px - 30, py + floatY + 10);
    ctx.quadraticCurveTo(px - 20 + wave, py + floatY + 25, px - 10, py + floatY + 10);
    ctx.quadraticCurveTo(px, py + floatY + 25, px + 10, py + floatY + 10);
    ctx.quadraticCurveTo(px + 20 + wave, py + floatY + 25, px + 30, py + floatY + 10);
    ctx.lineTo(px + 30, py + floatY - 15);
    ctx.lineTo(px - 30, py + floatY - 15);
    ctx.closePath();
    ctx.fill();
    
    // Ciało ducha
    ctx.fillStyle = c.body;
    ctx.beginPath();
    ctx.ellipse(px, py + floatY - 10, 30, 35, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Faliste brzegi ciała
    for (var i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(px + i * 12 - 6, py + floatY + 20);
        ctx.quadraticCurveTo(px + i * 12, py + floatY + 28 + wave, px + i * 12 + 6, py + floatY + 20);
        ctx.fill();
    }
    
    // Szary spód
    ctx.fillStyle = c.bodyDark;
    ctx.beginPath();
    ctx.ellipse(px, py + floatY + 5, 25, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Oczy
    ctx.fillStyle = c.eye;
    ctx.beginPath();
    ctx.ellipse(px - 10, py - 15 + floatY, 8, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(px + 10, py - 15 + floatY, 8, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Źrenice
    ctx.fillStyle = c.pupil;
    ctx.beginPath();
    ctx.arc(px - 10, py - 14 + floatY, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(px + 10, py - 14 + floatY, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Grymasa zombie-ducha (odwrócony uśmiech)
    ctx.strokeStyle = c.eye;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(px, py + floatY + 2, 12, 0.2, Math.PI - 0.2, true);
    ctx.stroke();
    
    // Nagrobek za duchem — wyłania się z grobu!
    ctx.fillStyle = '#555';
    ctx.fillRect(px - 16, py + 30, 32, 40);
    ctx.fillStyle = '#444';
    ctx.beginPath();
    ctx.arc(px, py + 30, 16, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = 'rgba(200,200,200,0.5)';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('R.I.P', px, py + 46);

    // Długie ręce-widma
    ctx.strokeStyle = c.body;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(px - 25, py + floatY - 5);
    ctx.quadraticCurveTo(px - 45, py + floatY + 10 - wave*2, px - 50, py + floatY + 25);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(px + 25, py + floatY - 5);
    ctx.quadraticCurveTo(px + 45, py + floatY + 10 + wave*2, px + 50, py + floatY + 25);
    ctx.stroke();
    
    // Opuszki palców
    ctx.fillStyle = c.bodyDark;
    ctx.beginPath();
    ctx.arc(px - 50, py + floatY + 25, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(px + 50, py + floatY + 25, 4, 0, Math.PI * 2);
    ctx.fill();
    drawGraveDirt(ctx, px, py);
}

// === ULTRA ZOMBI - super zombie ===
function drawLobbyUltraZombi(ctx, px, py, skinId) {
    var time = Date.now() / 1000;
    var pulse = Math.sin(time * 2) * 4;

    // Poświata różowo-magentowa
    var grd = ctx.createRadialGradient(px, py - 10, 10, px, py - 10, 70 + pulse);
    grd.addColorStop(0, 'rgba(233, 30, 99, 0.45)');
    grd.addColorStop(1, 'rgba(233, 30, 99, 0)');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(px, py - 10, 70 + pulse, 0, Math.PI * 2);
    ctx.fill();

    // Cień
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(px, py + 32, 28, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Masywne nogi
    ctx.fillStyle = '#ad1457';
    ctx.fillRect(px - 16, py + 8,  12, 22);
    ctx.fillRect(px + 4,  py + 8,  12, 22);
    ctx.fillStyle = '#880e4f';
    ctx.fillRect(px - 18, py + 27, 14, 6);
    ctx.fillRect(px + 4,  py + 27, 14, 6);

    // Masywne ciało
    ctx.fillStyle = '#e91e63';
    ctx.fillRect(px - 22, py - 18, 44, 28);
    // Blizna
    ctx.strokeStyle = '#880e4f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px - 8, py - 15); ctx.lineTo(px - 2, py - 5); ctx.lineTo(px - 8, py + 3);
    ctx.stroke();
    // Plama krwi
    ctx.fillStyle = '#880e4f';
    ctx.beginPath();
    ctx.ellipse(px + 7, py - 3, 8, 6, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Ogromne ramiona
    ctx.fillStyle = '#c2185b';
    ctx.fillRect(px - 34, py - 16, 12, 26);
    ctx.fillRect(px + 22, py - 16, 12, 26);
    // Pięści z kłykciami
    ctx.fillStyle = '#ad1457';
    ctx.fillRect(px - 36, py + 8, 14, 10);
    ctx.fillRect(px + 22, py + 8, 14, 10);
    ctx.fillStyle = '#e91e63';
    for (var k = 0; k < 3; k++) {
        ctx.fillRect(px - 34 + k * 4, py + 7, 3, 4);
        ctx.fillRect(px + 24 + k * 4, py + 7, 3, 4);
    }

    // Głowa — wielka, kwadratowa
    ctx.fillStyle = '#f06292';
    ctx.fillRect(px - 24, py - 44, 48, 30);
    ctx.fillStyle = '#880e4f';
    ctx.fillRect(px - 14, py - 42, 12, 5);

    // Kolce na głowie
    ctx.fillStyle = '#ad1457';
    for (var sp = -2; sp <= 2; sp++) {
        ctx.beginPath();
        ctx.moveTo(px + sp * 9 - 4, py - 44);
        ctx.lineTo(px + sp * 9,     py - 44 - 10 - Math.abs(sp) * 2 + pulse * 0.3);
        ctx.lineTo(px + sp * 9 + 4, py - 44);
        ctx.fill();
    }

    // Oczy — żółte świecące
    ctx.shadowColor = '#ffeb3b';
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#ffeb3b';
    ctx.beginPath();
    ctx.arc(px - 9, py - 30, 7, 0, Math.PI * 2);
    ctx.arc(px + 9, py - 30, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(px - 9, py - 30, 4, 0, Math.PI * 2);
    ctx.arc(px + 9, py - 30, 4, 0, Math.PI * 2);
    ctx.fill();

    // Groźne brwi
    ctx.fillStyle = '#1a0000';
    ctx.beginPath();
    ctx.moveTo(px - 16, py - 40); ctx.lineTo(px - 3, py - 38); ctx.lineTo(px - 3, py - 36); ctx.lineTo(px - 16, py - 37);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(px + 16, py - 40); ctx.lineTo(px + 3, py - 38); ctx.lineTo(px + 3, py - 36); ctx.lineTo(px + 16, py - 37);
    ctx.fill();

    // Pysk z kłami
    ctx.fillStyle = '#1a0000';
    ctx.beginPath();
    ctx.moveTo(px - 14, py - 17);
    ctx.quadraticCurveTo(px, py - 26, px + 14, py - 17);
    ctx.lineTo(px + 14, py - 14);
    ctx.quadraticCurveTo(px, py - 22, px - 14, py - 14);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#f5f5f5';
    ctx.beginPath();
    ctx.moveTo(px - 8, py - 17); ctx.lineTo(px - 5, py - 10); ctx.lineTo(px - 2, py - 17);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(px + 2, py - 17); ctx.lineTo(px + 5, py - 10); ctx.lineTo(px + 8, py - 17);
    ctx.fill();

    drawGraveDirt(ctx, px, py);
}

function drawLobbyNoobek(ctx, px, py, skinId, charName) {
    // Kolory dla różnych skinów - ZIELONE zombie
    var colors = {
        'default': { leg: '#4a5d4a', foot: '#2d3a2d', body: '#5d7a5d', arm: '#4a5d4a', head: '#6b8b6b', eye: '#ffeb3b', pupil: '#ff0000', mouth: 'zombie' },
        'scary': { leg: '#333', foot: '#1a1a1a', body: '#1a1a1a', arm: '#8b0000', head: '#8b0000', eye: '#ff0000', pupil: '#000', mouth: 'grim' },
        'golden': { leg: '#6a6a3a', foot: '#4a4a2a', body: '#7a7a4a', arm: '#6a6a3a', head: '#8a8a5a', eye: '#ffff00', pupil: '#ffaa00', mouth: 'smile' },
        'ninja': { leg: '#2a3a2a', foot: '#1a2a1a', body: '#3a4a3a', arm: '#2a3a2a', head: '#4a5a4a', eye: '#fff', pupil: '#00ff00', mouth: 'serious' },
        'cosmic': { leg: '#3a5a3a', foot: '#2a4a2a', body: '#4a6a4a', arm: '#3a5a3a', head: '#5a7a5a', eye: '#aaffaa', pupil: '#00aa00', mouth: 'alien' },
        'grill': { leg: '#3a3a3a', foot: '#2a2a2a', body: '#4a4a4a', arm: '#3a3a3a', head: '#5a5a5a', eye: '#ffff00', pupil: '#ff6600', mouth: 'grim' },
        'goldbacon': { leg: '#6a5a2a', foot: '#4a3a1a', body: '#7a6a3a', arm: '#6a5a2a', head: '#8a7a4a', eye: '#ffdd00', pupil: '#aa8800', mouth: 'smile' },
        'burnt': { leg: '#2a2a2a', foot: '#1a1a1a', body: '#3a3a3a', arm: '#2a2a2a', head: '#4a4a4a', eye: '#ffaa00', pupil: '#660000', mouth: 'grim' },
        'aurora': { leg: '#3a6a5a', foot: '#2a4a3a', body: '#4a7a6a', arm: '#3a6a5a', head: '#5a8a7a', eye: '#00ffaa', pupil: '#00aa77', mouth: 'smile' },
        'diamond': { leg: '#5a8a9a', foot: '#4a6a7a', body: '#6a9a9a', arm: '#5a8a9a', head: '#7aaaab', eye: '#aaffff', pupil: '#00aaaa', mouth: 'smile' },
        'darkfrost': { leg: '#3a4a5a', foot: '#2a3a4a', body: '#4a5a6a', arm: '#3a4a5a', head: '#5a6a7a', eye: '#aaaaff', pupil: '#4444aa', mouth: 'grim' },
        'stinky': { leg: '#4a4a3a', foot: '#3a3a2a', body: '#5a5a4a', arm: '#4a4a3a', head: '#6a6a5a', eye: '#ffff00', pupil: '#666600', mouth: 'grim' },
        'flower': { leg: '#4a6a4a', foot: '#3a5a3a', body: '#5a7a5a', arm: '#4a6a4a', head: '#6a8a6a', eye: '#ffaaff', pupil: '#aa00aa', mouth: 'smile' },
        'toxic': { leg: '#4a7a2a', foot: '#3a5a1a', body: '#5a8a3a', arm: '#4a7a2a', head: '#6a9a4a', eye: '#aaff00', pupil: '#66aa00', mouth: 'zombie' },
        'radioactive': { leg: '#3a6a6a', foot: '#2a5a5a', body: '#4a7a7a', arm: '#3a6a6a', head: '#5a8a8a', eye: '#00ffff', pupil: '#008888', mouth: 'zombie' },
        'venom': { leg: '#6a3a5a', foot: '#5a2a4a', body: '#7a4a6a', arm: '#6a3a5a', head: '#8a5a7a', eye: '#ff88aa', pupil: '#aa2255', mouth: 'zombie' },
        'spooky': { leg: '#3a3a3a', foot: '#2a2a2a', body: '#4a4a4a', arm: '#3a3a3a', head: '#5a5a5a', eye: '#ff0000', pupil: '#000000', mouth: 'grim' },
        'cursed': { leg: '#4a2a6a', foot: '#3a1a5a', body: '#5a3a7a', arm: '#4a2a6a', head: '#6a4a8a', eye: '#ff00ff', pupil: '#8800aa', mouth: 'zombie' },
        'phantom': { leg: '#2a5a6a', foot: '#1a4a5a', body: '#3a6a7a', arm: '#2a5a6a', head: '#4a7a8a', eye: '#ffff00', pupil: '#aa6600', mouth: 'zombie' },
        'badzombi': { leg: '#1a0a0a', foot: '#0a0000', body: '#2a0000', arm: '#1a0a0a', head: '#1f0000', eye: '#ff2200', pupil: '#000', mouth: 'zombie' }
    };
    var c = colors[skinId] || colors['default'];
    
    // Zmień kolory w zależności od postaci - każda postać ma inny odcień zieleni
    var charColors = {
        'Zombie': { leg: '#4a6a4a', foot: '#2a4a2a', body: '#5a7a5a', arm: '#4a6a4a', head: '#6a8a6a' },
        'Blazer': { leg: '#5a6a5a', foot: '#3a4a3a', body: '#6a7a6a', arm: '#5a6a5a', head: '#7a8a7a' },
        'Frostik': { leg: '#4a5a6a', foot: '#3a4a5a', body: '#5a6a7a', arm: '#4a5a6a', head: '#5a6a7a' },
        'Cieniak': { leg: '#3a3a4a', foot: '#2a2a3a', body: '#4a4a5a', arm: '#3a3a4a', head: '#4a4a5a' },
        'Magmak': { leg: '#5a4a4a', foot: '#4a3a3a', body: '#6a5a5a', arm: '#5a4a4a', head: '#6a5a5a' },
        'Złotek': { leg: '#ffd700', foot: '#ff8f00', body: '#ffeb3b', arm: '#ffd700', head: '#ffd700' },
        'UltraZombi': { leg: '#e91e63', foot: '#ad1457', body: '#f48fb1', arm: '#e91e63', head: '#f06292' },
        'Toksyk': { leg: '#4a7a4a', foot: '#3a5a3a', body: '#5a8a5a', arm: '#4a7a4a', head: '#5a8a5a' },
        'Duszek': { leg: '#6a6a6a', foot: '#5a5a5a', body: '#7a7a7a', arm: '#6a6a6a', head: '#7a7a7a' }
    };
    // Jeśli mamy kolory dla tej postaci, użyj ich zamiast kolorów skina
    var cc = charColors[charName];
    if (cc) {
        c = { leg: cc.leg, foot: cc.foot, body: cc.body, arm: cc.arm, head: cc.head, eye: c.eye, pupil: c.pupil, mouth: c.mouth };
    } else {
        cc = charColors['Zombie'];
        c = { ...c, leg: cc.leg, foot: cc.foot, body: cc.body, arm: cc.arm, head: cc.head };
    }

    // Nogi (postrzępione)
    ctx.fillStyle = c.leg;
    ctx.fillRect(px - 14, py + 8, 10, 18);
    ctx.fillRect(px + 4, py + 8, 10, 18);
    // Stopy (brudne)
    ctx.fillStyle = c.foot;
    ctx.fillRect(px - 15, py + 24, 12, 5);
    ctx.fillRect(px + 3, py + 24, 12, 5);
    // Ciało (zniszczona koszula z dziurami)
    ctx.fillStyle = c.body;
    ctx.fillRect(px - 18, py - 15, 36, 25);
    // Dziury w koszulce
    ctx.fillStyle = '#2d2d2d';
    ctx.fillRect(px - 10, py - 8, 6, 4);
    ctx.fillRect(px + 5, py - 2, 5, 5);
    ctx.fillRect(px - 5, py + 3, 4, 3);
    // Plama krwi na ciele
    ctx.fillStyle = '#8b0000';
    ctx.beginPath();
    ctx.ellipse(px + 5, py - 5, 8, 6, 0.5, 0, Math.PI * 2);
    ctx.fill();
    // Ręce
    ctx.fillStyle = c.arm;
    ctx.fillRect(px - 26, py - 13, 8, 22);
    ctx.fillRect(px + 18, py - 13, 8, 22);
    // Głowa
    ctx.fillStyle = c.head;
    ctx.fillRect(px - 20, py - 40, 40, 28);
    // Rana na głowie
    ctx.fillStyle = '#3d2a2a';
    ctx.fillRect(px - 12, py - 38, 10, 4);
    // Oczy (jedno większe, jedno mniejsze)
    // Groźne brwi
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.moveTo(px - 15, py - 33);
    ctx.lineTo(px - 3, py - 30);
    ctx.lineTo(px - 3, py - 33);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(px + 15, py - 33);
    ctx.lineTo(px + 3, py - 30);
    ctx.lineTo(px + 3, py - 33);
    ctx.fill();
    ctx.fillStyle = c.eye;
    ctx.beginPath();
    ctx.arc(px - 8, py - 28, 6, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(px + 8, py - 28, 4, 0, Math.PI*2);
    ctx.fill();
    // Źrenice (czerwone)
    ctx.fillStyle = c.pupil;
    ctx.beginPath();
    ctx.arc(px - 7, py - 27, 2, 0, Math.PI*2);
    ctx.arc(px + 9, py - 27, 2, 0, Math.PI*2);
    ctx.fill();
    // Buzia (groźna - wygięte w dół)
    if (c.mouth === 'zombie') {
        // GRYMASA - kąty mocno w dół, środek wysoko
        ctx.fillStyle = '#0a0000';
        ctx.beginPath();
        ctx.moveTo(px - 14, py - 9);   // lewy kąt - bardzo nisko
        ctx.quadraticCurveTo(px, py - 22, px + 14, py - 9); // środek wysoko
        ctx.lineTo(px + 14, py - 6);
        ctx.quadraticCurveTo(px, py - 17, px - 14, py - 6);
        ctx.closePath();
        ctx.fill();
        // Kły zwisające z góry (w środku łuku)
        ctx.fillStyle = '#f0f0f0';
        ctx.beginPath();
        ctx.moveTo(px - 7, py - 19);
        ctx.lineTo(px - 5, py - 11);
        ctx.lineTo(px - 3, py - 19);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(px + 3, py - 19);
        ctx.lineTo(px + 5, py - 11);
        ctx.lineTo(px + 7, py - 19);
        ctx.fill();
        // Kreski gniewu przy kątach ust
        ctx.strokeStyle = '#cc0000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px - 14, py - 9);
        ctx.lineTo(px - 19, py - 5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(px + 14, py - 9);
        ctx.lineTo(px + 19, py - 5);
        ctx.stroke();
    } else if (c.mouth === 'grim') {
        ctx.fillStyle = '#000';
        ctx.fillRect(px - 10, py - 18, 20, 4);
    } else if (c.mouth === 'serious') {
        ctx.fillStyle = '#000';
        ctx.fillRect(px - 6, py - 17, 12, 2);
    } else if (c.mouth === 'alien') {
        ctx.fillStyle = '#e1bee7';
        ctx.fillRect(px - 8, py - 19, 16, 3);
    } else {
        ctx.strokeStyle = c.pupil;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(px, py - 17, 8, 0.1, Math.PI - 0.1);
        ctx.stroke();
    }

    // Specjalne efekty dla skina Bad Zombie
    if (skinId === 'badzombi') {
        // Kolce na ramionach
        ctx.fillStyle = '#555';
        for (var s = 0; s < 3; s++) {
            ctx.beginPath();
            ctx.moveTo(px - 26, py - 10 + s * 7);
            ctx.lineTo(px - 34, py - 7 + s * 7);
            ctx.lineTo(px - 26, py - 4 + s * 7);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(px + 26, py - 10 + s * 7);
            ctx.lineTo(px + 34, py - 7 + s * 7);
            ctx.lineTo(px + 26, py - 4 + s * 7);
            ctx.fill();
        }
        // Łańcuch na ciele
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 2;
        for (var ch = 0; ch < 5; ch++) {
            ctx.beginPath();
            ctx.arc(px - 8 + ch * 4, py - 5, 2, 0, Math.PI * 2);
            ctx.stroke();
        }
        // Blizna na twarzy
        ctx.strokeStyle = '#8b0000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px - 5, py - 38);
        ctx.lineTo(px + 2, py - 28);
        ctx.stroke();
        // Czerwona poświata wokół oczu
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#ff2200';
        ctx.beginPath();
        ctx.arc(px - 8, py - 28, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(px + 8, py - 28, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
    drawGraveDirt(ctx, px, py);
}

function drawLobbyBlazer(ctx, px, py, skinId) {
    // Kolory dla skinów Blazera
    var colors = {
        'default': { leg: '#8b4513', foot: '#5d2f0e', body: '#e85d4a', bodyStripe: '#f5c6b8', arm: '#e85d4a', head: '#d4453a', headStripe: '#f5c6b8', eye: '#fff', pupil: '#222', smile: '#5d2f0e' },
        'grill': { leg: '#263238', foot: '#1a1a1a', body: '#fff', bodyStripe: '#e85d4a', arm: '#d84315', head: '#d84315', headStripe: '#fff', eye: '#fff', pupil: '#222', smile: '#1a1a1a' },
        'goldbacon': { leg: '#ff8f00', foot: '#e65100', body: '#ffd700', bodyStripe: '#ffaa00', arm: '#ffd700', head: '#ff8f00', headStripe: '#ffd700', eye: '#fff8e1', pupil: '#ff6f00', smile: '#e65100' },
        'burnt': { leg: '#212121', foot: '#000', body: '#3e2723', bodyStripe: '#212121', arm: '#3e2723', head: '#212121', headStripe: '#3e2723', eye: '#ffab91', pupil: '#000', smile: '#000' }
    };
    var c = colors[skinId] || colors['default'];

    // Nóżki
    ctx.fillStyle = c.leg;
    ctx.fillRect(px - 12, py + 8, 8, 16);
    ctx.fillRect(px + 4, py + 8, 8, 16);
    // Buciki
    ctx.fillStyle = c.foot;
    ctx.fillRect(px - 13, py + 22, 10, 5);
    ctx.fillRect(px + 3, py + 22, 10, 5);
    // Ciało - boczek
    ctx.fillStyle = c.body;
    ctx.fillRect(px - 16, py - 15, 32, 25);
    ctx.fillStyle = c.bodyStripe;
    ctx.fillRect(px - 16, py - 10, 32, 5);
    ctx.fillRect(px - 16, py, 32, 5);
    // Rączki
    ctx.fillStyle = c.arm;
    ctx.fillRect(px - 24, py - 12, 8, 20);
    ctx.fillRect(px + 16, py - 12, 8, 20);
    // Głowa - bekonowa
    ctx.fillStyle = c.head;
    ctx.beginPath();
    ctx.arc(px, py - 28, 18, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = c.headStripe;
    ctx.fillRect(px - 14, py - 32, 28, 5);
    // Oczka
    ctx.fillStyle = c.eye;
    ctx.beginPath();
    ctx.arc(px - 7, py - 30, 5, 0, Math.PI*2);
    ctx.arc(px + 7, py - 30, 5, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = c.pupil;
    ctx.beginPath();
    ctx.arc(px - 6, py - 29, 3, 0, Math.PI*2);
    ctx.arc(px + 8, py - 29, 3, 0, Math.PI*2);
    ctx.fill();
    // Grymasa zombie (odwrócony uśmiech)
    ctx.strokeStyle = c.smile;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(px, py - 22, 7, 0.2, Math.PI - 0.2, true);
    ctx.stroke();
    // Czarne obwódki oczu — wyglądają jak po wybudzeniu z grobu
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(px - 7, py - 30, 6, 0, Math.PI * 2);
    ctx.arc(px + 7, py - 30, 6, 0, Math.PI * 2);
    ctx.stroke();
    drawGraveDirt(ctx, px, py);
}

function drawLobbyFrostik(ctx, px, py, skinId) {
    // Kolory dla skinów Frostika
    var colors = {
        'default': { leg: '#81d4fa', foot: '#29b6f6', body: '#4fc3f7', bodyCrystal: '#b3e5fc', arm: '#29b6f6', head: '#81d4fa', eye: '#fff', pupil: '#01579b', smile: '#01579b' },
        'aurora': { leg: '#009688', foot: '#004d40', body: '#26a69a', bodyCrystal: '#80cbc4', arm: '#00897b', head: '#00e676', eye: '#e0f2f1', pupil: '#004d40', smile: '#004d40' },
        'diamond': { leg: '#b2ebf2', foot: '#00acc1', body: '#e0f7fa', bodyCrystal: '#fff', arm: '#80deea', head: '#e0f7fa', eye: '#fff', pupil: '#00acc1', smile: '#00acc1' },
        'darkfrost': { leg: '#455a64', foot: '#263238', body: '#37474f', bodyCrystal: '#607d8b', arm: '#263238', head: '#455a64', eye: '#cfd8dc', pupil: '#000', smile: '#000' }
    };
    var c = colors[skinId] || colors['default'];

    // Nóżki lodowe
    ctx.fillStyle = c.leg;
    ctx.fillRect(px - 12, py + 8, 8, 16);
    ctx.fillRect(px + 4, py + 8, 8, 16);
    // Buciki
    ctx.fillStyle = c.foot;
    ctx.fillRect(px - 13, py + 22, 10, 5);
    ctx.fillRect(px + 3, py + 22, 10, 5);
    // Ciało lodowe
    ctx.fillStyle = c.body;
    ctx.fillRect(px - 16, py - 15, 32, 25);
    ctx.fillStyle = c.bodyCrystal;
    ctx.fillRect(px - 14, py - 12, 6, 6);
    ctx.fillRect(px + 8, py - 5, 6, 6);
    // Rączki
    ctx.fillStyle = c.arm;
    ctx.fillRect(px - 24, py - 12, 8, 20);
    ctx.fillRect(px + 16, py - 12, 8, 20);
    // Głowa lodowa
    ctx.fillStyle = c.head;
    ctx.beginPath();
    ctx.arc(px, py - 28, 18, 0, Math.PI*2);
    ctx.fill();
    // Oczka
    ctx.fillStyle = c.eye;
    ctx.beginPath();
    ctx.arc(px - 7, py - 30, 5, 0, Math.PI*2);
    ctx.arc(px + 7, py - 30, 5, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = c.pupil;
    ctx.beginPath();
    ctx.arc(px - 6, py - 29, 3, 0, Math.PI*2);
    ctx.arc(px + 8, py - 29, 3, 0, Math.PI*2);
    ctx.fill();
    // Grymasa zombie
    ctx.strokeStyle = c.smile;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(px, py - 22, 7, 0.2, Math.PI - 0.2, true);
    ctx.stroke();
    // Pęknięcia lodu — zamrożony zombie
    ctx.strokeStyle = 'rgba(150, 220, 255, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(px - 5, py - 15); ctx.lineTo(px - 12, py - 5); ctx.lineTo(px - 8, py);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(px + 4, py - 10); ctx.lineTo(px + 9, py - 3);
    ctx.stroke();
    // Ciemne obwódki oczu
    ctx.strokeStyle = 'rgba(0,0,0,0.45)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(px - 7, py - 30, 6, 0, Math.PI * 2);
    ctx.arc(px + 7, py - 30, 6, 0, Math.PI * 2);
    ctx.stroke();
    drawGraveDirt(ctx, px, py);
}

function drawLobbyCieniak(ctx, px, py, skinId) {
    // Cieniak - wygląda jak czarna dziura z fioletową poświatą
    var time = Date.now() / 1000;
    var pulse = Math.sin(time * 3) * 3;
    
    // Zewnętrzna poświata (fioletowa)
    var gradient = ctx.createRadialGradient(px, py - 20, 5, px, py - 20, 35 + pulse);
    gradient.addColorStop(0, '#000000');
    gradient.addColorStop(0.5, '#311b92');
    gradient.addColorStop(1, 'rgba(49, 27, 146, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(px, py - 20, 35 + pulse, 0, Math.PI * 2);
    ctx.fill();
    
    // Czarne ciało (dziura)
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(px, py - 5, 22, 28, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Wewnętrzna czarna dziura (spirala)
    ctx.strokeStyle = '#4a148c';
    ctx.lineWidth = 2;
    for (var i = 0; i < 3; i++) {
        ctx.beginPath();
        var spiralOffset = (time * 2 + i * 2) % 6;
        ctx.arc(px, py - 5, 8 + spiralOffset * 3, 0, Math.PI * 1.5);
        ctx.stroke();
    }
    
    // Oczy - białe punkty światła
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#9c27b0';
    ctx.beginPath();
    ctx.arc(px - 8, py - 25, 4, 0, Math.PI * 2);
    ctx.arc(px + 8, py - 25, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Ręce - czarne "macki"
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(px - 20, py - 5);
    ctx.quadraticCurveTo(px - 35, py + 5, px - 30 + Math.sin(time * 4) * 5, py + 15);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(px + 20, py - 5);
    ctx.quadraticCurveTo(px + 35, py + 5, px + 30 + Math.cos(time * 4) * 5, py + 15);
    ctx.stroke();
    
    // Nóżki - czarne "płaty"
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(px - 12, py + 18, 8, 4, -0.3, 0, Math.PI * 2);
    ctx.ellipse(px + 12, py + 18, 8, 4, 0.3, 0, Math.PI * 2);
    ctx.fill();
    drawGraveDirt(ctx, px, py);
}

function drawLobbyMagmak(ctx, px, py, skinId) {
    var time = Date.now() / 1000;
    
    // Kolory dla skinów Magmaka
    var colors = {
        'default': { mountain: '#5d4037', mountainDark: '#3e2723', lava: '#ff5722', lavaLight: '#ffab00', crater: '#bf360c' },
        'inferno': { mountain: '#212121', mountainDark: '#000', lava: '#ff6f00', lavaLight: '#ffeb3b', crater: '#e65100' },
        'obsidian': { mountain: '#263238', mountainDark: '#101619', lava: '#9c27b0', lavaLight: '#e040fb', crater: '#4a148c' },
        'lavaking': { mountain: '#ff6f00', mountainDark: '#bf360c', lava: '#ffd700', lavaLight: '#fff59d', crater: '#e65100' }
    };
    var c = colors[skinId] || colors['default'];
    
    // Poświata ognia
    var gradient = ctx.createRadialGradient(px, py - 20, 5, px, py - 20, 35);
    gradient.addColorStop(0, 'rgba(255, 87, 34, 0.4)');
    gradient.addColorStop(1, 'rgba(255, 87, 34, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(px, py - 20, 35, 0, Math.PI * 2);
    ctx.fill();
    
    // Góra (kształt trójkąta wulkanu)
    ctx.fillStyle = c.mountainDark;
    ctx.beginPath();
    ctx.moveTo(px - 28, py + 25);
    ctx.lineTo(px, py - 35);
    ctx.lineTo(px + 28, py + 25);
    ctx.closePath();
    ctx.fill();
    
    // Główna część wulkanu
    ctx.fillStyle = c.mountain;
    ctx.beginPath();
    ctx.moveTo(px - 22, py + 25);
    ctx.lineTo(px, py - 25);
    ctx.lineTo(px + 22, py + 25);
    ctx.closePath();
    ctx.fill();
    
    // Krater
    ctx.fillStyle = c.crater;
    ctx.beginPath();
    ctx.ellipse(px, py - 20, 10, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Lawa w kraterze
    var lavaPulse = Math.sin(time * 4) * 2;
    ctx.fillStyle = c.lava;
    ctx.beginPath();
    ctx.ellipse(px, py - 18 + lavaPulse * 0.3, 7, 3 + lavaPulse * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Błysk lawy
    ctx.fillStyle = c.lavaLight;
    ctx.beginPath();
    ctx.arc(px - 2, py - 19 + lavaPulse * 0.3, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Oczy
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(px - 6, py - 5, 4, 0, Math.PI * 2);
    ctx.arc(px + 6, py - 5, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(px - 5, py - 4, 2, 0, Math.PI * 2);
    ctx.arc(px + 7, py - 4, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Grymasa wulkanicznego zombie
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(px, py + 3, 6, 0.2, Math.PI - 0.2, true);
    ctx.stroke();
    // Pęknięcia na skale
    ctx.strokeStyle = 'rgba(255,100,0,0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(px - 8, py - 20); ctx.lineTo(px - 4, py - 10); ctx.lineTo(px - 10, py - 3);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(px + 5, py - 15); ctx.lineTo(px + 9, py - 8);
    ctx.stroke();

    // Ręce
    ctx.fillStyle = c.mountainDark;
    ctx.fillRect(px - 26, py - 8, 6, 14);
    ctx.fillRect(px + 20, py - 8, 6, 14);
    drawGraveDirt(ctx, px, py);
}

function drawLobbyCzarodziej(ctx, px, py, skinId) {
    var time = Date.now() / 1000;
    var bounce = Math.sin(time * 3) * 4;

    // Cień
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(px, py + 32, 16, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Nogi
    ctx.fillStyle = '#4a148c';
    ctx.fillRect(px - 9, py + 12, 7, 20);
    ctx.fillRect(px + 2, py + 12, 7, 20);

    // Buty
    ctx.fillStyle = '#311b92';
    ctx.fillRect(px - 11, py + 30, 9, 4);
    ctx.fillRect(px + 2, py + 30, 9, 4);

    // Szata
    ctx.fillStyle = '#7b1fa2';
    ctx.beginPath();
    ctx.moveTo(px - 14, py + 14);
    ctx.lineTo(px + 14, py + 14);
    ctx.lineTo(px + 10, py - 10 + bounce);
    ctx.lineTo(px - 10, py - 10 + bounce);
    ctx.closePath();
    ctx.fill();

    // Rękawy
    ctx.fillStyle = '#6a1b9a';
    ctx.fillRect(px - 18, py - 5 + bounce, 8, 14);
    ctx.fillRect(px + 10, py - 5 + bounce, 8, 14);

    // Ręce
    ctx.fillStyle = '#e1bee7';
    ctx.beginPath();
    ctx.arc(px - 15, py + 9 + bounce, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(px + 15, py + 9 + bounce, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Kostka w prawej ręce
    ctx.fillStyle = '#e040fb';
    ctx.fillRect(px + 12, py + 5 + bounce, 6, 6);

    // Głowa
    ctx.fillStyle = '#e1bee7';
    ctx.beginPath();
    ctx.arc(px, py - 16 + bounce, 10, 0, Math.PI * 2);
    ctx.fill();

    // Oczy
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(px - 3, py - 18 + bounce, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(px + 3, py - 18 + bounce, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#4a148c';
    ctx.beginPath();
    ctx.arc(px - 3, py - 18 + bounce, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(px + 3, py - 18 + bounce, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Kapelusz
    ctx.fillStyle = '#4a148c';
    ctx.beginPath();
    ctx.moveTo(px - 16, py - 22 + bounce);
    ctx.lineTo(px + 16, py - 22 + bounce);
    ctx.lineTo(px, py - 40 + bounce);
    ctx.closePath();
    ctx.fill();

    // Pasek na kapeluszu
    ctx.fillStyle = '#e040fb';
    ctx.fillRect(px - 12, py - 25 + bounce, 24, 3);

    // Broda
    ctx.fillStyle = '#ce93d8';
    ctx.beginPath();
    ctx.moveTo(px - 5, py - 10 + bounce);
    ctx.lineTo(px + 5, py - 10 + bounce);
    ctx.lineTo(px, py - 3 + bounce);
    ctx.closePath();
    ctx.fill();
}
