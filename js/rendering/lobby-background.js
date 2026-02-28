// Lobby background rendering

function drawLobbyBackground() {
    var bgCanvas = document.getElementById('lobbyBg');
    if (!bgCanvas) return;
    
    // Ustaw rozmiar na pełny ekran
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
    var ctx = bgCanvas.getContext('2d');
    var w = bgCanvas.width;
    var h = bgCanvas.height;
    
    // Skalowanie dla różnych rozmiarów ekranu
    var scaleX = w / 200;
    var scaleY = h / 200;
    
    // Ciemne niebo
    var skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, '#0a0a15');
    skyGrad.addColorStop(0.5, '#1a1a2e');
    skyGrad.addColorStop(1, '#2d2d44');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);
    
    // Księżyc
    ctx.fillStyle = '#e8e8e8';
    ctx.beginPath();
    ctx.arc(w * 0.8, h * 0.15, 25 * scaleX, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#d0d0d0';
    ctx.beginPath();
    ctx.arc(w * 0.77, h * 0.12, 8 * scaleX, 0, Math.PI*2);
    ctx.fill();
    
    // Gwiazdy
    ctx.fillStyle = '#ffffff';
    for(var gs=0; gs<50; gs++) {
        var gx = (gs * 43) % w;
        var gy = (gs * 31) % (h * 0.4);
        ctx.globalAlpha = 0.3 + (gs % 5) * 0.15;
        ctx.fillRect(gx, gy, 2, 2);
    }
    ctx.globalAlpha = 1;
    
    // Wzgórza w tle
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.7);
    ctx.quadraticCurveTo(w * 0.25, h * 0.5, w * 0.5, h * 0.65);
    ctx.quadraticCurveTo(w * 0.75, h * 0.5, w, h * 0.6);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.fill();
    
    // Drzewa na środkowym planie
    ctx.fillStyle = '#0d0d0d';
    for(var t=0; t<5; t++) {
        var tx = w * (0.1 + t * 0.2);
        var ty = h * 0.55;
        ctx.fillRect(tx, ty, 8 * scaleX, 40 * scaleY);
        ctx.beginPath();
        ctx.arc(tx + 4*scaleX, ty - 5*scaleY, 25*scaleX, 0, Math.PI*2);
        ctx.fill();
    }
    
    // Trzeci plan - dziedziniec zamkowy
    var courtGrad = ctx.createLinearGradient(0, h * 0.65, 0, h);
    courtGrad.addColorStop(0, '#1f1f1f');
    courtGrad.addColorStop(1, '#2a2a2a');
    ctx.fillStyle = courtGrad;
    ctx.fillRect(w * 0.15, h * 0.65, w * 0.7, h * 0.35);
    
    // Kamienie na dziedzińcu
    ctx.fillStyle = '#333333';
    for(var k=0; k<8; k++) {
        ctx.beginPath();
        ctx.ellipse(w * (0.2 + k * 0.08), h * (0.75 + k%2 * 0.05), 12*scaleX, 8*scaleY, 0, 0, Math.PI*2);
        ctx.fill();
    }
    
    // Latarnia
    ctx.fillStyle = '#2d2d2d';
    ctx.fillRect(w * 0.45, h * 0.68, 5*scaleX, 25*scaleY);
    ctx.fillStyle = '#ff9800';
    ctx.beginPath();
    ctx.arc(w * 0.475, h * 0.66, 8*scaleX, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 152, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(w * 0.475, h * 0.66, 25*scaleX, 0, Math.PI*2);
    ctx.fill();
    
    // CZARNY ZAMEK
    var zx = w * 0.25;
    var zy = h * 0.35;
    
    // Główna bryła
    ctx.fillStyle = '#151515';
    ctx.fillRect(zx, zy, w * 0.5, h * 0.35);
    
    // Wieże
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(zx - w*0.05, zy - h*0.15, w*0.12, h*0.3);
    ctx.fillRect(zx + w*0.43, zy - h*0.15, w*0.12, h*0.3);
    
    // Okna wież
    ctx.fillStyle = '#ffc107';
    ctx.globalAlpha = 0.8;
    ctx.fillRect(zx - w*0.02, zy - h*0.08, 8*scaleX, 12*scaleY);
    ctx.fillRect(zx + w*0.44, zy - h*0.08, 8*scaleX, 12*scaleY);
    ctx.globalAlpha = 1;
    
    // Okna główne
    ctx.fillStyle = '#ffb300';
    ctx.fillRect(zx + w*0.08, zy + h*0.05, 12*scaleX, 15*scaleY);
    ctx.fillRect(zx + w*0.22, zy + h*0.05, 15*scaleX, 20*scaleY);
    ctx.fillRect(zx + w*0.36, zy + h*0.05, 12*scaleX, 15*scaleY);
    
    // Brama
    ctx.fillStyle = '#0f0f0f';
    ctx.fillRect(zx + w*0.18, zy + h*0.22, w*0.14, h*0.13);
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(zx + w*0.25, zy + h*0.22, w*0.07, Math.PI, 0);
    ctx.fill();
    
    // Szczyty wież
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.moveTo(zx - w*0.05, zy - h*0.15);
    ctx.lineTo(zx + w*0.01, zy - h*0.25);
    ctx.lineTo(zx + w*0.07, zy - h*0.15);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(zx + w*0.43, zy - h*0.15);
    ctx.lineTo(zx + w*0.49, zy - h*0.25);
    ctx.lineTo(zx + w*0.55, zy - h*0.15);
    ctx.fill();
    
    // Flagi
    ctx.fillStyle = '#8b0000';
    ctx.fillRect(zx + w*0.01, zy - h*0.32, 3*scaleX, 15*scaleY);
    ctx.beginPath();
    ctx.moveTo(zx + w*0.04, zy - h*0.32);
    ctx.lineTo(zx + w*0.1, zy - h*0.28);
    ctx.lineTo(zx + w*0.04, zy - h*0.24);
    ctx.fill();
    
    ctx.fillRect(zx + w*0.46, zy - h*0.32, 3*scaleX, 15*scaleY);
    ctx.beginPath();
    ctx.moveTo(zx + w*0.49, zy - h*0.32);
    ctx.lineTo(zx + w*0.55, zy - h*0.28);
    ctx.lineTo(zx + w*0.49, zy - h*0.24);
    ctx.fill();
    
    requestAnimationFrame(drawLobbyBackground);
}
