// ========== LOBBY FUNCTIONS AND STATE ==========

// Global game state variables
var coins = 500;
var trophies = 0;
var claimedRewards = [];
var ownedSkins = ['default'];
var currentSkin = 'default';
var robuxProgress = 0;
var claimedRobuxRewards = [];
var unlockedCharacters = ['Zombie', 'Toksyk', 'Duszek', 'Złotek', 'UltraZombi'];
var selectedCharacter = 'Zombie';
var previewCharacter = 'Zombie';
var selectedGameMode = 'arena';

// ========== ROBUX TARGET FUNCTIONS ==========

function getCurrentRobuxTarget() {
    for (var i = 0; i < robuxRewards.length; i++) {
        if (claimedRobuxRewards.indexOf(i) === -1) {
            return i;
        }
    }
    return -1;
}

function getCurrentTargetName() {
    var target = getCurrentRobuxTarget();
    if (target === -1) return null;
    return robuxRewards[target].charName;
}

function getCurrentTargetCost() {
    var target = getCurrentRobuxTarget();
    if (target === -1) return 0;
    return robuxRewards[target].req;
}

// ========== COIN/TROPHY DISPLAY FUNCTIONS ==========

function updateCoins() {
    document.getElementById('coinsDisplay').textContent = '💰 ' + coins;
}

function updateTrophies() {
    document.getElementById('trophiesDisplay').textContent = '🏆 ' + trophies;
}

function updateRobux() {
    var targetIdx = getCurrentRobuxTarget();
    if (targetIdx === -1) {
        // Wszystkie postacie odblokowane
        document.getElementById('robuxDisplay').textContent = '💎 ' + robuxProgress + ' (MAX)';
        document.getElementById('robuxDisplay').title = 'Masz wszystkie postacie!';
    } else {
        var target = robuxRewards[targetIdx];
        var needed = target.req - robuxProgress;
        document.getElementById('robuxDisplay').textContent = '💎 ' + robuxProgress + ' / ' + target.req;
        document.getElementById('robuxDisplay').title = 'Zbierasz na: ' + target.charName + ' (' + target.rarityName + ') - brakuje ' + needed + ' robux';
    }
}

// ========== TROPHY ROAD FUNCTIONS ==========

function renderTrophyRoad() {
    var list = document.getElementById('trophyRoadList');
    list.innerHTML = '';
    for (var i = 0; i < trophyRewards.length; i++) {
        var r = trophyRewards[i];
        var claimed = claimedRewards.indexOf(i) !== -1;
        var unlocked = trophies >= r.req;

        var div = document.createElement('div');
        div.className = 'trophy-reward' + (claimed ? ' claimed' : (unlocked ? ' unlocked' : ''));

        var reqSpan = '<span class="trophy-req">🏆 ' + r.req + '</span>';
        var prizeSpan = '<span class="trophy-prize">' + r.prize + '</span>';
        var btnHtml = '';

        if (claimed) {
            btnHtml = '<span style="color:#888;">Odebrano ✔</span>';
        } else if (unlocked) {
            btnHtml = '<button class="trophy-claim-btn" onclick="claimReward(' + i + ')">Odbierz!</button>';
        } else {
            btnHtml = '<button class="trophy-claim-btn" disabled>Zablokowane</button>';
        }

        div.innerHTML = reqSpan + prizeSpan + btnHtml;
        list.appendChild(div);
    }
}

function claimReward(index) {
    if (claimedRewards.indexOf(index) !== -1) return;
    var r = trophyRewards[index];
    if (trophies < r.req) return;

    claimedRewards.push(index);
    if (r.type === 'coins') {
        coins += r.amount;
        updateCoins();
        alert('🎉 Otrzymałeś ' + r.amount + ' monet!');
    }
    if (r.type === 'robux') {
        robuxProgress += r.amount;
        updateRobux();
        alert('🎉 Otrzymałeś ' + r.amount + ' robuxów! Zbierasz na: ' + (getCurrentTargetName() || 'wszystkie odblokowane!'));
    }
    if (r.type === 'skin') {
        if (ownedSkins.indexOf(r.skinId) === -1) {
            ownedSkins.push(r.skinId);
            alert('🎉 Odblokowano skórkę: ' + r.prize.split(': ')[1] + '!');
        } else {
            alert('Masz już tę skórkę! Otrzymujesz 500 monet jako bonus.');
            coins += 500;
            updateCoins();
        }
    }
    if (r.type === 'mixed') {
        coins += r.coins;
        robuxProgress += r.robux;
        updateCoins();
        updateRobux();
        alert('🎉 MEGA NAGRODA! ' + r.coins + ' monet i ' + r.robux + ' robuxów!');
    }
    renderTrophyRoad();
    saveGame();
}

// ========== ROBUX ROAD FUNCTIONS ==========

function renderRobuxRoad() {
    var list = document.getElementById('robuxRoadList');
    list.innerHTML = '';
    var currentTarget = getCurrentRobuxTarget();

    for (var i = 0; i < robuxRewards.length; i++) {
        var r = robuxRewards[i];
        var claimed = claimedRobuxRewards.indexOf(i) !== -1;
        var isCurrent = (i === currentTarget);
        var unlocked = isCurrent && robuxProgress >= r.req;

        // Karta postaci z rzadkością
        var card = document.createElement('div');
        card.className = 'character-card' + (claimed ? ' claimed' : (unlocked ? ' unlocked' : '')) + (isCurrent ? ' current' : '');
        card.style.borderColor = r.rarityColor;
        if (isCurrent) card.style.borderWidth = '4px';

        // Nagłówek z rzadkością
        var rarityHeader = '<div class="char-rarity-header" style="background:' + r.rarityColor + '">' + r.rarityName + '</div>';

        // Ikona postaci
        var charIcon = r.prize.split(' ')[0]; // emoji z prize
        var charName = r.charName;

        // Treść karty - pokaż ile brakuje jeśli to aktualna postać
        var progressHtml = '';
        if (isCurrent && unlocked) {
            progressHtml = '<div style="color:#00c853; font-size:13px; font-weight:bold; margin-top:5px;">✅ Uzbierałeś ' + robuxProgress + ' 🧠!</div>';
        } else if (isCurrent) {
            var needed = r.req - robuxProgress;
            var pct = Math.min(100, Math.round(robuxProgress / r.req * 100));
            progressHtml = '<div style="color:#76ff03; font-size:12px; margin-top:5px;">🧠 Masz: ' + robuxProgress + ' / ' + r.req + '</div>' +
                          '<div style="background:#333;border-radius:4px;height:6px;margin:4px 0;"><div style="background:#76ff03;width:' + pct + '%;height:6px;border-radius:4px;"></div></div>' +
                          '<div style="color:#ff9800; font-size:12px;">Brakuje: ' + needed + ' 🧠</div>';
        } else if (!claimed && i > currentTarget) {
            // Następne postacie - pokaż wymagania
            progressHtml = '<div style="color:#666; font-size:11px; margin-top:5px;">🔒 Odblokuj poprzednie</div>';
        }

        // Treść karty
        var content = '<div class="char-card-content">' +
            '<div class="char-card-icon">' + charIcon + '</div>' +
            '<div class="char-card-name">' + charName + '</div>' +
            '<div class="char-card-price">💎 ' + r.req + ' robux</div>' +
            progressHtml +
            '</div>';

        // Przycisk — Odbierz gdy uzbierano, inaczej Wypróbuj
        var btnHtml = '';
        if (claimed) {
            btnHtml = '<button class="char-card-btn" style="background:#333;color:#888;cursor:default;" disabled>✔ Odebrano</button>';
        } else if (unlocked) {
            btnHtml = '<button class="char-card-btn" style="background:linear-gradient(180deg,#00c853,#1b5e20);font-size:16px;animation:pulse 1s infinite alternate;" onclick="claimRobuxReward(' + i + ')">🎁 ODBIERZ!</button>';
        } else {
            btnHtml = '<button class="char-card-btn" style="background:linear-gradient(180deg,#9c27b0,#7b1fa2)" onclick="showTryCharPanel(\'' + charName + '\')">🎮 WYPRÓBUJ</button>';
        }

        card.innerHTML = rarityHeader + content + btnHtml;
        list.appendChild(card);
    }
}

function claimRobuxReward(index) {
    if (claimedRobuxRewards.indexOf(index) !== -1) return;
    var r = robuxRewards[index];
    if (robuxProgress < r.req) return;
    claimedRobuxRewards.push(index);

    // Odejmij koszt - reszta zostaje na następną postać
    robuxProgress = robuxProgress - r.req;

    if (r.type === 'character') {
        if (unlockedCharacters.indexOf(r.charName) === -1) {
            unlockedCharacters.push(r.charName);
            refreshCharList();
        }
        alert('🎉 Odblokowano postać: ' + r.charName + '!\n💎 Zostało ci: ' + robuxProgress + ' robux na następną!');
    }
    updateRobux();
    renderRobuxRoad();
    saveGame();
}

// ========== CHARACTER LIST FUNCTIONS ==========

// charColors zdefiniowane w js/data/config.js

function refreshCharList() {
    var list = document.querySelector('.char-list');
    var h3 = list.querySelector('h3');
    list.innerHTML = '';
    list.appendChild(h3);
    for (var i = 0; i < unlockedCharacters.length; i++) {
        var name = unlockedCharacters[i];
        var c = charColors[name] || { icon: '⬜', bg: '#888' };
        var div = document.createElement('div');
        // Podświetl aktualnie wybraną postać (selectedCharacter), nie pierwszą!
        div.className = 'char-list-item' + (name === selectedCharacter ? ' selected' : '');
        div.setAttribute('onclick', "selectCharacter(this, '" + name + "')");
        div.innerHTML = '<span class="char-list-icon" style="background:' + c.bg + ';">' + c.icon + '</span><span>' + name + '</span>';
        list.appendChild(div);
    }
}

// Wybór postaci w panelu (tylko podgląd!)
function selectCharacter(card, name) {
    console.log('[WYBÓR POSTACI] Wybrano: ' + name + ', previewCharacter było: ' + previewCharacter);
    
    // Zapisz ulepszenia dla poprzednio podglądanej postaci
    saveCurrentUpgrades(previewCharacter);

    var cards = document.querySelectorAll('.char-list-item');
    for (var i = 0; i < cards.length; i++) {
        cards[i].classList.remove('selected');
    }
    card.classList.add('selected');
    previewCharacter = name;
    console.log('[WYBÓR POSTACI] Ustawiono previewCharacter na: ' + previewCharacter);
    document.getElementById('charPreviewName').textContent = name;

    // Aktualizuj 3D preview
    if (typeof updateCharPreview3D === 'function') updateCharPreview3D();

    // Wczytaj ulepszenia dla nowo wybranej postaci
    loadCharacterUpgrades(name);

    // Filtruj skiny - pokaż tylko te dla wybranej postaci
    var skinCards = document.querySelectorAll('.skin-card');
    for (var j = 0; j < skinCards.length; j++) {
        var chars = skinCards[j].getAttribute('data-chars') || '';
        if (chars.indexOf(name) !== -1) {
            skinCards[j].style.display = 'block';
        } else {
            skinCards[j].style.display = 'none';
        }
    }
}

// Załóż wybraną postać (kliknięcie WYPOSAŻ)
function equipCharacter() {
    try {
        console.log('WYPOSAŻ: preview=' + previewCharacter + ', selected=' + selectedCharacter);
        if (!previewCharacter) {
            alert('Błąd: previewCharacter jest puste!');
            return;
        }
        // Zapisz ulepszenia dla postaci przed zmianą
        saveCurrentUpgrades(previewCharacter);

        selectedCharacter = previewCharacter;
        console.log('Po zmianie: selected=' + selectedCharacter);
        document.getElementById('selectedInfo').textContent = '🎮 Wybrana postać: ' + selectedCharacter;
        updateLobbyAnimation();
        saveGame();
        // Zamiast alert - zamknij panel i wróć do lobby
        closePanel('characters');
    } catch(e) {
        alert('Błąd w equipCharacter: ' + e.message);
        console.log(e);
    }
}

// ========== LOBBY ANIMATION FUNCTIONS ==========

function updateLobbyAnimation() {
    // Aktualizuj postać 3D w lobby
    if (typeof updateLobbyCharacter3D === 'function') {
        updateLobbyCharacter3D();
    }

    // Nie używamy już CSS dla animacji lobby - teraz canvas
    var preview = document.getElementById('charPreviewModel');
    var char = characters[selectedCharacter] || characters[Object.keys(characters)[0]];
    if (!char) return;
    
    // Pobierz animację z definicji postaci
    var anim = char.lobbyAnim || 'bounce';
    
    // Ustaw klasy CSS
    var lobby = document.getElementById('lobbyCharacter');
    var lobbySkin = '';
    // Dodaj klasę skina
    if (currentSkin !== 'default') {
        lobbySkin = ' skin-' + currentSkin;
    }
    lobby.className = 'lobby-character' + lobbySkin + ' anim-' + anim;
    preview.className = 'char-preview-model anim-' + anim;
}

// ========== PREVIEW CHARACTER FUNCTIONS ==========

var previewBounceTimer = 0;

function bouncePreviewChar() {
    previewBounceTimer = 20;
}

function drawPreviewCharacter() {
    var canvas = document.getElementById('charPreviewCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var char = characters[previewCharacter] || characters[Object.keys(characters)[0]];
    if (!char) return;
    
    // Log diagnostyczny - pokaż co aktualnie rysujemy
    if (window.DEBUG_PREVIEW) {
        console.log('[RYSUJ] previewCharacter=' + previewCharacter + ', selectedCharacter=' + selectedCharacter);
    }

    // Wyczyść canvas
    ctx.clearRect(0, 0, 200, 200);

    // Pozycja (środek canvas)
    var px = 100;
    var py = 120;

    // Animacja bounce (jeśli kliknięta)
    if (previewBounceTimer > 0) {
        var jumpH = Math.sin((20 - previewBounceTimer) / 20 * Math.PI) * 30;
        py -= jumpH;
        previewBounceTimer--;
    } else {
        // Pulsowanie dla scary skin (Noobek tylko)
        if (currentSkin === 'scary' && char.skinFamily === 'noobek') {
            var pulse = Math.sin(Date.now() / 500) * 5;
            py += pulse;
        }
    }

    // Rysuj cień
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(px, 170, 35, 10, 0, 0, Math.PI*2);
    ctx.fill();

    // Rysuj wybraną postać (skalowane 2.2x - większe!)
    ctx.save();
    ctx.translate(px, py);
    ctx.scale(2.2, 2.2);
    ctx.translate(-px, -py);

    // Rysuj previewCharacter - postać którą oglądasz w panelu!
    var previewChar = characters[previewCharacter] || characters[Object.keys(characters)[0]];
    // BUG FIX: drawLobbyDuszek was actually Toksyk rendering - use drawLobbyToksyk for toksyk skinFamily
    if (previewChar.skinFamily === 'blazer') drawLobbyBlazer(ctx, px, py, currentSkin);
    else if (previewChar.skinFamily === 'frostik') drawLobbyFrostik(ctx, px, py, currentSkin);
    else if (previewChar.skinFamily === 'cieniak') drawLobbyCieniak(ctx, px, py, currentSkin);
    else if (previewChar.skinFamily === 'magmak') drawLobbyMagmak(ctx, px, py, currentSkin);
    else if (previewChar.skinFamily === 'ultrazombi') drawLobbyUltraZombi(ctx, px, py, currentSkin);
    else if (previewChar.skinFamily === 'zlotek') drawLobbyZlotek(ctx, px, py, currentSkin);
    else if (previewChar.skinFamily === 'toksyk') drawLobbyToksyk(ctx, px, py, currentSkin);
    else if (previewChar.skinFamily === 'duszek') drawLobbyDuszek(ctx, px, py, currentSkin);
    else if (previewChar.skinFamily === 'czarodziej') drawLobbyCzarodziej(ctx, px, py, currentSkin);
    else drawLobbyNoobek(ctx, px, py, currentSkin);

    ctx.restore();

    requestAnimationFrame(drawPreviewCharacter);
}

// ========== LOBBY CHARACTER FUNCTIONS ==========

var lobbyBounceTimer = 0;

function bounceLobbyChar() {
    lobbyBounceTimer = 20; // 20 klatek animacji

    // Animacja skoku w 3D
    if (typeof bounceLobbyChar3D === 'function') {
        bounceLobbyChar3D();
    }
}

function drawLobbyCharacter() {
    var canvas = document.getElementById('lobbyCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    
    // Debug - sprawdź czy postać istnieje
    if (!characters[selectedCharacter]) {
        console.log('BŁĄD: Nieznana postać: ' + selectedCharacter);
    }
    
    var char = characters[selectedCharacter] || characters[Object.keys(characters)[0]];
    if (!char) return;

    // Wyczyść canvas - tło jest teraz na pełnoekranowym canvasie
    ctx.clearRect(0, 0, 200, 200);

    // Pozycja (środek canvas)
    var px = 100;
    var py = 120;

    // Animacja bounce (jeśli kliknięta)
    if (lobbyBounceTimer > 0) {
        var jumpH = Math.sin((20 - lobbyBounceTimer) / 20 * Math.PI) * 30;
        py -= jumpH;
        lobbyBounceTimer--;
    } else {
        // Pulsowanie dla scary skin (Noobek tylko)
        if (currentSkin === 'scary' && char.skinFamily === 'noobek') {
            var pulse = Math.sin(Date.now() / 500) * 5;
            py += pulse;
        }
    }

    // Rysuj cień
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(px, 170, 35, 10, 0, 0, Math.PI*2);
    ctx.fill();

    // Rysuj wybraną postać (skalowane 2.2x - większe!)
    ctx.save();
    ctx.translate(px, py);
    ctx.scale(2.2, 2.2);
    ctx.translate(-px, -py);

    // Rysuj wybraną postać wg skinFamily
    var lobbyChar = characters[selectedCharacter] || characters[Object.keys(characters)[0]];
    // BUG FIX: drawLobbyDuszek was actually Toksyk rendering - use drawLobbyToksyk for toksyk skinFamily
    if (lobbyChar.skinFamily === 'blazer') drawLobbyBlazer(ctx, px, py, currentSkin);
    else if (lobbyChar.skinFamily === 'frostik') drawLobbyFrostik(ctx, px, py, currentSkin);
    else if (lobbyChar.skinFamily === 'cieniak') drawLobbyCieniak(ctx, px, py, currentSkin);
    else if (lobbyChar.skinFamily === 'magmak') drawLobbyMagmak(ctx, px, py, currentSkin);
    else if (lobbyChar.skinFamily === 'ultrazombi') drawLobbyUltraZombi(ctx, px, py, currentSkin);
    else if (lobbyChar.skinFamily === 'zlotek') drawLobbyZlotek(ctx, px, py, currentSkin);
    else if (lobbyChar.skinFamily === 'toksyk') drawLobbyToksyk(ctx, px, py, currentSkin);
    else if (lobbyChar.skinFamily === 'duszek') drawLobbyDuszek(ctx, px, py, currentSkin);
    else if (lobbyChar.skinFamily === 'czarodziej') drawLobbyCzarodziej(ctx, px, py, currentSkin);
    else drawLobbyNoobek(ctx, px, py, currentSkin);

    ctx.restore();

    requestAnimationFrame(drawLobbyCharacter);
}

// ========== LOBBY BACKGROUND ==========

// drawLobbyBackground zdefiniowane w js/rendering/lobby-background.js
