// Game character rendering functions (in-game)

function drawNoobekInGame(px, py, skinId, charName) {
    // Kolory dla różnych skinów
    var colors = {
        'default': { leg: '#4a5d4a', foot: '#2d3a2d', body: '#5d7a5d', arm: '#4a5d4a', head: '#6b8b6b', eye: '#ffeb3b', pupil: '#ff0000', mouth: 'zombie' },
        'scary': { leg: '#333', foot: '#1a1a1a', body: '#1a1a1a', arm: '#8b0000', head: '#8b0000', eye: '#ff0000', pupil: '#000', mouth: 'grim' },
        'golden': { leg: '#6a6a3a', foot: '#4a4a2a', body: '#7a7a4a', arm: '#6a6a3a', head: '#8a8a5a', eye: '#ffff00', pupil: '#ffaa00', mouth: 'smile' },
        'ninja': { leg: '#2a3a2a', foot: '#1a2a1a', body: '#3a4a3a', arm: '#2a3a2a', head: '#4a5a4a', eye: '#fff', pupil: '#00ff00', mouth: 'serious' },
        'cosmic': { leg: '#3a5a3a', foot: '#2a4a2a', body: '#4a6a4a', arm: '#3a5a3a', head: '#5a7a5a', eye: '#aaffaa', pupil: '#00aa00', mouth: 'alien' },
        'badzombi': { leg: '#1a0a0a', foot: '#0a0000', body: '#2a0000', arm: '#1a0a0a', head: '#1f0000', eye: '#ff2200', pupil: '#000', mouth: 'zombie' }
    };
    var c = colors[skinId] || colors['default'];
    
    // Zmień kolory w zależności od postaci
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
    // Ręce (wyciągnięte do przodu jak zombie)
    ctx.fillStyle = c.arm;
    ctx.fillRect(px - 26, py - 13, 8, 22);
    ctx.fillRect(px + 18, py - 13, 8, 22);
    // Głowa
    ctx.fillStyle = c.head;
    ctx.fillRect(px - 20, py - 40, 40, 28);
    // Rana na głowie
    ctx.fillStyle = '#3d2a2a';
    ctx.fillRect(px - 12, py - 38, 10, 4);
    // Oczy (jedno większe, jedno mniejsze - poranione)
    ctx.fillStyle = c.eye;
    ctx.beginPath();
    ctx.arc(px - 8, py - 28, 6, 0, Math.PI*2); // lewe oko większe
    ctx.fill();
    ctx.beginPath();
    ctx.arc(px + 8, py - 28, 4, 0, Math.PI*2); // prawe oko mniejsze
    ctx.fill();
    // Źrenice (czerwone)
    ctx.fillStyle = c.pupil;
    ctx.beginPath();
    ctx.arc(px - 7, py - 27, 2, 0, Math.PI*2);
    ctx.arc(px + 9, py - 27, 2, 0, Math.PI*2);
    ctx.fill();
    // Buzia (groźna - wygięte w dół)
    if (c.mouth === 'zombie') {
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.moveTo(px - 12, py - 15);
        ctx.quadraticCurveTo(px, py - 22, px + 12, py - 15);
        ctx.lineTo(px + 12, py - 12);
        ctx.quadraticCurveTo(px, py - 18, px - 12, py - 12);
        ctx.fill();
        // Kły
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(px - 8, py - 15);
        ctx.lineTo(px - 6, py - 20);
        ctx.lineTo(px - 4, py - 15);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(px + 4, py - 15);
        ctx.lineTo(px + 6, py - 20);
        ctx.lineTo(px + 8, py - 15);
        ctx.fill();
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
}

function drawBlazerInGame(px, py, skinId) {
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
    // Ciało - plaster boczku (paski)
    ctx.fillStyle = c.body;
    ctx.fillRect(px - 16, py - 15, 32, 25);
    ctx.fillStyle = c.bodyStripe;
    ctx.fillRect(px - 16, py - 10, 32, 5);
    ctx.fillRect(px - 16, py, 32, 5);
    // Rączki
    ctx.fillStyle = c.arm;
    ctx.fillRect(px - 24, py - 12, 8, 20);
    ctx.fillRect(px + 16, py - 12, 8, 20);
    // Głowa - okrągła, bekonowa
    ctx.fillStyle = c.head;
    ctx.beginPath();
    ctx.arc(px, py - 28, 18, 0, Math.PI*2);
    ctx.fill();
    // Jasna paska na głowie
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
    // Uśmiech
    ctx.strokeStyle = c.smile;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(px, py - 22, 7, 0.2, Math.PI - 0.2);
    ctx.stroke();
}

function drawFrostikInGame(px, py, skinId) {
    // Kolory dla skinów Frostika
    var colors = {
        'default': { leg: '#81d4fa', foot: '#29b6f6', body: '#4fc3f7', bodyCrystal: '#b3e5fc', arm: '#29b6f6', head: '#81d4fa', eye: '#fff', pupil: '#01579b', smile: '#01579b' },
        'aurora': { leg: '#009688', foot: '#004d40', body: '#26a69a', bodyCrystal: '#80cbc4', arm: '#00897b', head: '#00e676', eye: '#e0f2f1', pupil: '#004d40', smile: '#004d40' },
        'diamond': { leg: '#b2ebf2', foot: '#00acc1', body: '#e0f7fa', bodyCrystal: '#fff', arm: '#80deea', head: '#e0f7fa', eye: '#fff', pupil: '#00acc1', smile: '#00acc1' },
        'darkfrost': { leg: '#455a64', foot: '#263238', body: '#37474f', bodyCrystal: '#607d8b', arm: '#263238', head: '#455a64', eye: '#cfd8dc', pupil: '#000', smile: '#000' }
    };
    var c = colors[skinId] || colors['default'];

    // Nóżki - lodowe
    ctx.fillStyle = c.leg;
    ctx.fillRect(px - 12, py + 8, 8, 16);
    ctx.fillRect(px + 4, py + 8, 8, 16);
    // Buciki - lodowe
    ctx.fillStyle = c.foot;
    ctx.fillRect(px - 13, py + 22, 10, 5);
    ctx.fillRect(px + 3, py + 22, 10, 5);
    // Ciało - błękitne z lodowymi wzorami
    ctx.fillStyle = c.body;
    ctx.fillRect(px - 16, py - 15, 32, 25);
    ctx.fillStyle = c.bodyCrystal;
    ctx.fillRect(px - 14, py - 12, 6, 6);
    ctx.fillRect(px + 8, py - 5, 6, 6);
    ctx.fillRect(px - 5, py + 5, 6, 6);
    // Rączki - lodowe
    ctx.fillStyle = c.arm;
    ctx.fillRect(px - 24, py - 12, 8, 20);
    ctx.fillRect(px + 16, py - 12, 8, 20);
    // Głowa - lodowa kula
    ctx.fillStyle = c.head;
    ctx.beginPath();
    ctx.arc(px, py - 28, 18, 0, Math.PI*2);
    ctx.fill();
    // Oczka - niebieskie
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
    // Uśmiech - zmarznięty
    ctx.strokeStyle = c.smile;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(px, py - 22, 7, 0.2, Math.PI - 0.2);
    ctx.stroke();
}

function drawCieniakInGame(px, py, skinId) {
    var time = Date.now() / 1000;
    var pulse = Math.sin(time * 3) * 2;
    
    // Zewnętrzna poświata (fioletowa)
    var gradient = ctx.createRadialGradient(px, py - 20, 5, px, py - 20, 30 + pulse);
    gradient.addColorStop(0, '#000000');
    gradient.addColorStop(0.5, '#311b92');
    gradient.addColorStop(1, 'rgba(49, 27, 146, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(px, py - 20, 30 + pulse, 0, Math.PI * 2);
    ctx.fill();
    
    // Czarne ciało (dziura)
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(px, py - 5, 18, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Wewnętrzna spirala
    ctx.strokeStyle = '#4a148c';
    ctx.lineWidth = 2;
    for (var i = 0; i < 3; i++) {
        ctx.beginPath();
        var spiralOffset = (time * 2 + i * 2) % 5;
        ctx.arc(px, py - 5, 6 + spiralOffset * 2.5, 0, Math.PI * 1.5);
        ctx.stroke();
    }
    
    // Oczy - białe punkty
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#9c27b0';
    ctx.beginPath();
    ctx.arc(px - 6, py - 22, 3, 0, Math.PI * 2);
    ctx.arc(px + 6, py - 22, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Ręce - czarne macki
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(px - 16, py - 5);
    ctx.quadraticCurveTo(px - 28, py + 3, px - 24 + Math.sin(time * 4) * 4, py + 12);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(px + 16, py - 5);
    ctx.quadraticCurveTo(px + 28, py + 3, px + 24 + Math.cos(time * 4) * 4, py + 12);
    ctx.stroke();
    
    // Nóżki
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(px - 10, py + 16, 6, 3, -0.3, 0, Math.PI * 2);
    ctx.ellipse(px + 10, py + 16, 6, 3, 0.3, 0, Math.PI * 2);
    ctx.fill();
}

function drawMagmakInGame(px, py, skinId) {
    var time = Date.now() / 1000;
    
    // Kolory dla skinów Magmaka
    var colors = {
        'default': { mountain: '#5d4037', mountainDark: '#3e2723', lava: '#ff5722', lavaLight: '#ffab00', crater: '#bf360c' },
        'inferno': { mountain: '#212121', mountainDark: '#000', lava: '#ff6f00', lavaLight: '#ffeb3b', crater: '#e65100' },
        'obsidian': { mountain: '#263238', mountainDark: '#101619', lava: '#9c27b0', lavaLight: '#e040fb', crater: '#4a148c' }
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
    
    // Krater (otwór na górze)
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
    
    // Oczy (przez dziurkę od sera :D)
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
    
    // Uśmiech
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(px, py + 3, 6, 0.2, Math.PI - 0.2);
    ctx.stroke();
    
    // Ręce (kamienne)
    ctx.fillStyle = c.mountainDark;
    ctx.fillRect(px - 26, py - 8, 6, 14);
    ctx.fillRect(px + 20, py - 8, 6, 14);
}

function drawToksykInGame(px, py, skinId) {
    var time = Date.now() / 1000;
    
    // Kolory dla skinów Toksyka
    var colors = {
        'default': { body: '#00e676', bodyDark: '#00c853', bodyLight: '#69f0ae', glow: '#b9f6ca', eye: '#fff', pupil: '#1b5e20' },
        'toxic': { body: '#76ff03', bodyDark: '#64dd17', bodyLight: '#b2ff59', glow: '#f0ff4d', eye: '#ffff00', pupil: '#33691e' },
        'radioactive': { body: '#00bcd4', bodyDark: '#00acc1', bodyLight: '#4dd0e1', glow: '#84ffff', eye: '#e0f7fa', pupil: '#006064' },
        'venom': { body: '#e91e63', bodyDark: '#c2185b', bodyLight: '#f48fb1', glow: '#f8bbd0', eye: '#ffcdd2', pupil: '#880e4f' }
    };
    var c = colors[skinId] || colors['default'];
    
    // Błyszcząca poświataToksyka
    var glowSize = 40 + Math.sin(time * 2) * 3;
    var glow = ctx.createRadialGradient(px, py, 5, px, py, glowSize);
    glow.addColorStop(0, 'rgba(0, 230, 118, 0.25)');
    glow.addColorStop(1, 'rgba(0, 230, 118, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(px, py, glowSize, 0, Math.PI * 2);
    ctx.fill();
    
    var bounce = Math.sin(time * 3) * 2;
    
    // Nogi
    ctx.fillStyle = c.bodyDark;
    ctx.beginPath();
    ctx.ellipse(px - 12, py + 20, 10, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(px + 12, py + 20, 10, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Ciało
    ctx.fillStyle = c.body;
    ctx.beginPath();
    ctx.ellipse(px, py + bounce, 20, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Błyski
    ctx.fillStyle = c.bodyLight;
    ctx.beginPath();
    ctx.ellipse(px - 8, py - 3 + bounce, 5, 4, -0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Głowa
    ctx.fillStyle = c.body;
    ctx.beginPath();
    ctx.ellipse(px, py - 12 + bounce, 15, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Czułki
    ctx.strokeStyle = c.body;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(px - 8, py - 20 + bounce);
    ctx.quadraticCurveTo(px - 12, py - 30 + bounce, px - 10, py - 35 + bounce);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(px + 8, py - 20 + bounce);
    ctx.quadraticCurveTo(px + 12, py - 30 + bounce, px + 10, py - 35 + bounce);
    ctx.stroke();
    
    // Kuleczki na czułkach
    ctx.fillStyle = c.glow;
    ctx.beginPath();
    ctx.arc(px - 10, py - 35 + bounce, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(px + 10, py - 35 + bounce, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Oczy
    ctx.fillStyle = c.eye;
    ctx.beginPath();
    ctx.ellipse(px - 5, py - 14 + bounce, 5, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(px + 5, py - 14 + bounce, 5, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Źrenice
    ctx.fillStyle = c.pupil;
    ctx.beginPath();
    ctx.arc(px - 5, py - 13 + bounce, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(px + 5, py - 13 + bounce, 2.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Uśmiech
    ctx.strokeStyle = c.pupil;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(px, py - 8 + bounce, 5, 0.2, Math.PI - 0.2);
    ctx.stroke();
}

function drawDuszekInGame(px, py, skinId) {
    var time = Date.now() / 1000;
    
    // Kolory dla skinów Duszka
    var colors = {
        'default': { body: '#e8e8e8', bodyDark: '#bdbdbd', glow: 'rgba(255,255,255,0.2)', eye: '#000', pupil: '#fff' },
        'spooky': { body: '#9e9e9e', bodyDark: '#616161', glow: 'rgba(158,158,158,0.2)', eye: '#ff0000', pupil: '#000' },
        'cursed': { body: '#7b1fa2', bodyDark: '#4a148c', glow: 'rgba(156,39,176,0.2)', eye: '#fff', pupil: '#e1bee7' },
        'phantom': { body: '#00bcd4', bodyDark: '#00838f', glow: 'rgba(0,188,212,0.2)', eye: '#ffff00', pupil: '#ff6f00' }
    };
    var c = colors[skinId] || colors['default'];
    
    // Lewitacja
    var floatY = Math.sin(time * 2) * 5;
    var wave = Math.sin(time * 3) * 2;
    
    // Poświata
    var glowSize = 45 + Math.sin(time * 2) * 3;
    var glow = ctx.createRadialGradient(px, py + floatY, 5, px, py + floatY, glowSize);
    glow.addColorStop(0, c.glow);
    glow.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(px, py + floatY, glowSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Ogon ducha
    ctx.fillStyle = c.body;
    ctx.beginPath();
    ctx.moveTo(px - 20, py + floatY + 8);
    ctx.quadraticCurveTo(px - 12 + wave, py + floatY + 18, px - 6, py + floatY + 8);
    ctx.quadraticCurveTo(px, py + floatY + 18, px + 6, py + floatY + 8);
    ctx.quadraticCurveTo(px + 12 + wave, py + floatY + 18, px + 20, py + floatY + 8);
    ctx.lineTo(px + 20, py + floatY - 12);
    ctx.lineTo(px - 20, py + floatY - 12);
    ctx.closePath();
    ctx.fill();
    
    // Ciało
    ctx.fillStyle = c.body;
    ctx.beginPath();
    ctx.ellipse(px, py + floatY - 8, 20, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Spód
    ctx.fillStyle = c.bodyDark;
    ctx.beginPath();
    ctx.ellipse(px, py + floatY + 3, 16, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Oczy
    ctx.fillStyle = c.eye;
    ctx.beginPath();
    ctx.ellipse(px - 7, py - 12 + floatY, 5, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(px + 7, py - 12 + floatY, 5, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Źrenice
    ctx.fillStyle = c.pupil;
    ctx.beginPath();
    ctx.arc(px - 7, py - 11 + floatY, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(px + 7, py - 11 + floatY, 2.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Uśmiech
    ctx.strokeStyle = c.eye;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(px, py - 2 + floatY, 8, 0.2, Math.PI - 0.2);
    ctx.stroke();
    
    // Ręce-widma
    ctx.strokeStyle = c.body;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(px - 17, py + floatY - 3);
    ctx.quadraticCurveTo(px - 30, py + floatY + 8 - wave*2, px - 35, py + floatY + 18);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(px + 17, py + floatY - 3);
    ctx.quadraticCurveTo(px + 30, py + floatY + 8 + wave*2, px + 35, py + floatY + 18);
    ctx.stroke();
}

function drawZlotekInGame(px, py, skinId) {
    var time = Date.now() / 1000;
    
    // Kolory dla skinów Złotka
    var colors = {
        'default': { body: '#ffd700', bodyLight: '#ffeb3b', bodyDark: '#ff8f00', crown: '#ffd700', eye: '#4caf50', coin: '#ffc107' },
        'rich': { body: '#ffeb3b', bodyLight: '#fff59d', bodyDark: '#ffc107', crown: '#ffca28', eye: '#00e676', coin: '#ffd700' },
        'diamond': { body: '#e0f7fa', bodyLight: '#b2ebf2', bodyDark: '#4dd0e1', crown: '#ffffff', eye: '#00bcd4', coin: '#e0f7fa' }
    };
    var c = colors[skinId] || colors['default'];
    
    // Poświata
    var gradient = ctx.createRadialGradient(px, py - 10, 5, px, py - 10, 40);
    gradient.addColorStop(0, 'rgba(255, 215, 0, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(px, py - 10, 40, 0, Math.PI * 2);
    ctx.fill();
    
    // Korona (mniejsza w grze)
    ctx.fillStyle = c.crown;
    ctx.beginPath();
    ctx.moveTo(px - 12, py - 32);
    ctx.lineTo(px - 8, py - 42);
    ctx.lineTo(px - 3, py - 35);
    ctx.lineTo(px, py - 48);
    ctx.lineTo(px + 3, py - 35);
    ctx.lineTo(px + 8, py - 42);
    ctx.lineTo(px + 12, py - 32);
    ctx.closePath();
    ctx.fill();
    
    // Głowa
    ctx.fillStyle = c.body;
    ctx.beginPath();
    ctx.arc(px, py - 18, 14, 0, Math.PI * 2);
    ctx.fill();
    
    // Oczy
    ctx.fillStyle = c.eye;
    ctx.beginPath();
    ctx.arc(px - 4, py - 18, 3, 0, Math.PI * 2);
    ctx.arc(px + 4, py - 18, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(px - 3, py - 18, 1.5, 0, Math.PI * 2);
    ctx.arc(px + 5, py - 18, 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Ciało
    ctx.fillStyle = c.bodyDark;
    ctx.fillRect(px - 8, py - 4, 16, 14);
    
    // Monety zamiast rąk
    ctx.fillStyle = c.coin;
    var bounce = Math.sin(time * 5) * 2;
    ctx.beginPath();
    ctx.ellipse(px - 12, py, 6, 6 + bounce, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(px + 12, py, 6, 6 - bounce, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Nogi - dyski
    ctx.fillStyle = c.body;
    ctx.beginPath();
    ctx.ellipse(px - 5, py + 12, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(px + 5, py + 12, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();
}
