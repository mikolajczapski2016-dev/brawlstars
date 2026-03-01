// ========== PANEL FUNCTIONS AND STATE ==========

// State variables
var isAdminLogged = false;
var adminCode = 'admin';
var creatorCodes = JSON.parse(localStorage.getItem('creatorCodes')) || [
    { code: '1234abcd', reward: 10000, description: 'Kod startowy', uses: 0 }
];
var adminSettings = JSON.parse(localStorage.getItem('adminSettings')) || {
    gameName: 'Brawl Stars Clone',
    version: '1.0',
    maxCoins: 999999999,
    allowCodeChange: false
};
var creatorCodeUsed = false;
var usedCreatorCodes = JSON.parse(localStorage.getItem('usedCreatorCodes')) || [];

// Star Drop state variables
var starDropClicks = 0;
var starDropRarity = 'common';
var starDropOpened = false;

// Other state
var tryCharacterName = null;
var previousCharacter = null;
var rewardPending = null;

// ========== PANEL FUNCTIONS ==========

// Otwieranie paneli
function openPanel(id) {
    if (id === 'trophyRoad') renderTrophyRoad();
    if (id === 'robuxRoad') renderRobuxRoad();
    if (id === 'adminPanel') {
        if (!isAdminLogged) {
            alert('Najpierw zaloguj się jako admin w panelu sklepu!');
            return;
        }
        renderAdminPanel();
    }
    if (id === 'shop') {
        updateShopButtons();
        // Wyczyść komunikat kodu przy otwarciu sklepu
        var messageEl = document.getElementById('codeMessage');
        if (messageEl) messageEl.textContent = '';
    }
    if (id === 'characters') {
        previewCharacter = selectedCharacter; // ustaw podgląd na aktualną postać
        refreshCharList();
        document.getElementById('charPreviewName').textContent = selectedCharacter;
        // Wczytaj ulepszenia dla aktualnie wybranej postaci
        loadCharacterUpgrades(selectedCharacter);
        // Uruchom animację podglądu postaci
        drawPreviewCharacter();
        // Filtruj skiny dla wybranej postaci
        filterSkinsForCharacter(selectedCharacter);
    }
    if (id === 'modeSelect') updateModeDisplay();
    document.getElementById(id).classList.add('active');
}

// Zamykanie paneli
function closePanel(id) {
    document.getElementById(id).classList.remove('active');
}

// ========== TRY CHARACTER PANEL ==========

function showTryCharPanel(charName) {
    tryCharacterName = charName;
    var char = characters[charName];
    document.getElementById('tryCharName').textContent = charName + ' ' + (char ? char.icon : '😐');
    openPanel('tryCharPanel');
}

function startTrainingArena() {
    if (!tryCharacterName) return;
    previousCharacter = selectedCharacter; // Zapamiętaj poprzednią postać
    closePanel('tryCharPanel');
    selectedCharacter = tryCharacterName;
    gameMode = 'training';
    document.getElementById('lobby').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';
    canvas = document.getElementById('arenaCanvas');
    ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    player.x = 400; player.y = 400;
    player.hp = 200; player.maxHp = 200;
    player.attackDamage = 25; // stała siła ataku dla treningu
    player.superCharge = 100;
    player.superReady = true;
    player.character = tryCharacterName;
    document.getElementById('superBtn').style.display = 'block';
    attacks = []; particles = []; damageTexts = [];
    walls = [{ x: 300, y: 200, w: 100, h: 100 }];
    bushes = [];
    enemies = [];
    for (var i = 0; i < 5; i++) {
        enemies.push({ x: 200 + i * 180, y: 200 + (i % 2) * 200, w: 40, h: 50, hp: 80, maxHp: 80, speed: 0, attackCooldown: 0, color: '#607d8b', hasBow: false, isRobot: true });
    }
    enemies.push({ x: 900, y: 400, w: 60, h: 80, hp: 300, maxHp: 300, speed: 0, attackCooldown: 0, color: '#37474f', hasBow: false, isRobotBoss: true, chargeTimer: 0, isCharging: false });
    gameRunning = true;
    updateSuperBtn();
    gameLoop();
}

function startTrainingMatch() {
    if (!tryCharacterName) return;
    previousCharacter = selectedCharacter; // Zapamiętaj poprzednią postać
    closePanel('tryCharPanel');
    selectedCharacter = tryCharacterName;
    gameMode = 'training-match';
    document.getElementById('lobby').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';
    canvas = document.getElementById('arenaCanvas');
    ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    player.x = 400; player.y = 400;
    player.hp = 100; player.maxHp = 100;
    player.superCharge = 100;
    player.superReady = true;
    player.character = tryCharacterName;
    document.getElementById('superBtn').style.display = 'block';
    attacks = []; particles = []; damageTexts = [];
    initArena();
    gameRunning = true;
    updateSuperBtn();
    gameLoop();
}

// ========== NEW CHARACTER / STAR DROP ==========

var newCharacterEarned = null; // przechowuje nazwę nowej postaci do odebrania

function showNewCharacter(charName) {
    newCharacterEarned = charName;
    
    // Dodaj postać do odblokowanych
    if (unlockedCharacters.indexOf(charName) === -1) {
        unlockedCharacters.push(charName);
        refreshCharList();
    }
    
    // Pokaż ekran nowej postaci
    var screen = document.getElementById('newCharacterScreen');
    if (screen) {
        screen.style.display = 'flex';
        document.getElementById('newCharacterName').textContent = charName;
        
        // Narysuj postać na canvasie (prosta implementacja)
        var newCharCanvas = document.getElementById('newCharCanvas');
        if (newCharCanvas) {
            var nctx = newCharCanvas.getContext('2d');
            nctx.clearRect(0, 0, 150, 150);
            nctx.fillStyle = '#5d8a66';
            nctx.font = '60px Arial';
            nctx.textAlign = 'center';
            var char = characters[charName];
            nctx.fillText(char ? char.icon : '🎮', 75, 90);
        }
    }
}

function equipNewCharacter() {
    // Schowaj ekran nowej postaci
    document.getElementById('newCharacterScreen').style.display = 'none';
    
    // Wróć do lobby
    document.getElementById('lobby').style.display = 'flex';
    
    // Jeśli mamy nową postać, ustaw ją jako wybraną
    if (newCharacterEarned) {
        selectedCharacter = newCharacterEarned;
        document.getElementById('selectedInfo').textContent = '🎮 Wybrana postać: ' + selectedCharacter;
        newCharacterEarned = null;
    }
}

// ========== ADMIN PANEL ==========

function loginAsAdmin() {
    var adminInput = document.getElementById('adminLoginCode');
    var enteredCode = adminInput.value.trim().toLowerCase();
    if (enteredCode === adminCode) {
        isAdminLogged = true;
        document.getElementById('adminBtn').style.display = 'block';
        document.getElementById('adminLoginSection').style.display = 'none';
        alert('Zalogowano jako admin!');
    } else {
        alert('Nieprawidłowy kod! Wpisz: admin');
    }
}

function renderAdminPanel() {
    var panel = document.getElementById('adminPanelContent');
    var codeList = creatorCodes.map(function(c, i) {
        return '<div style="background: rgba(255,255,255,0.1); padding: 10px; margin: 5px 0; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">' +
            '<div><strong>' + c.code + '</strong> - ' + c.description + ' (' + c.uses + ' użyć) - ' + c.reward + ' monet</div>' +
            '<button onclick="deleteCreatorCode(' + i + ')" style="background:#ff5555;color:#fff;border:none;padding:5px 10px;border-radius:5px;cursor:pointer;">✕</button></div>';
    }).join('');
    
    panel.innerHTML = '<h2 style="color:#bb86fc;margin-bottom:20px;">⚙️ PANEL ADMINISTRATORA</h2>' +
        '<div style="text-align:left;margin-bottom:20px;">' +
        '<h3 style="color:#fff;margin-bottom:10px;">📝 Kody twórców:</h3>' +
        codeList +
        '<div style="margin-top:15px;padding:10px;background:rgba(0,0,0,0.3);border-radius:8px;">' +
        '<input type="text" id="newCode" placeholder="Kod" style="padding:8px;border-radius:5px;border:1px solid #555;background:#222;color:#fff;width:120px;"> ' +
        '<input type="number" id="newReward" placeholder="Nagroda" value="1000" style="padding:8px;border-radius:5px;border:1px solid #555;background:#222;color:#fff;width:80px;"> ' +
        '<input type="text" id="newDesc" placeholder="Opis" style="padding:8px;border-radius:5px;border:1px solid #555;background:#222;color:#fff;width:120px;"> ' +
        '<button onclick="addCreatorCode()" style="background:#4cff50;color:#000;border:none;padding:8px 15px;border-radius:5px;cursor:pointer;font-weight:bold;">DODAJ</button>' +
        '</div></div>' +
        '<div style="text-align:left;margin-bottom:20px;">' +
        '<h3 style="color:#fff;margin-bottom:10px;">⚙️ Ustawienia gry:</h3>' +
        '<div style="margin-top:10px;"><label style="color:#aaa;">Nazwa gry:</label> <input type="text" id="gameNameInput" value="' + adminSettings.gameName + '" onchange="updateAdminSetting(\'gameName\', this.value)" style="padding:5px;border-radius:5px;border:1px solid #555;background:#222;color:#fff;width:150px;"></div>' +
        '<div style="margin-top:10px;"><label style="color:#aaa;">Wersja:</label> <input type="text" id="versionInput" value="' + adminSettings.version + '" onchange="updateAdminSetting(\'version\', this.value)" style="padding:5px;border-radius:5px;border:1px solid #555;background:#222;color:#fff;width:80px;"></div>' +
        '<div style="margin-top:10px;"><label style="color:#aaa;">Max monet:</label> <input type="number" id="maxCoinsInput" value="' + adminSettings.maxCoins + '" onchange="updateAdminSetting(\'maxCoins\', parseInt(this.value))" style="padding:5px;border-radius:5px;border:1px solid #555;background:#222;color:#fff;width:120px;"></div>' +
        '<div style="margin-top:10px;"><button onclick="resetGame()" style="background:#ff5555;color:#fff;border:none;padding:10px 20px;border-radius:5px;cursor:pointer;">🔄 RESETUJ GRĘ</button></div>' +
        '</div>' +
        '<div style="text-align:left;margin-bottom:20px;">' +
        '<h3 style="color:#76ff03;margin-bottom:10px;">🧠 Aleja Mózgów:</h3>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px;">' +
        '<button onclick="adminAddRobux(1)"  style="background:#1b5e20;color:#76ff03;border:2px solid #76ff03;padding:8px 14px;border-radius:8px;cursor:pointer;font-weight:bold;">+1 🧠</button>' +
        '<button onclick="adminAddRobux(5)"  style="background:#1b5e20;color:#76ff03;border:2px solid #76ff03;padding:8px 14px;border-radius:8px;cursor:pointer;font-weight:bold;">+5 🧠</button>' +
        '<button onclick="adminAddRobux(10)" style="background:#1b5e20;color:#76ff03;border:2px solid #76ff03;padding:8px 14px;border-radius:8px;cursor:pointer;font-weight:bold;">+10 🧠</button>' +
        '<button onclick="adminAddRobux(50)" style="background:#2e7d32;color:#76ff03;border:2px solid #76ff03;padding:8px 14px;border-radius:8px;cursor:pointer;font-weight:bold;">+50 🧠</button>' +
        '</div>' +
        '<div style="display:flex;gap:8px;align-items:center;">' +
        '<input type="number" id="customRobuxAmount" placeholder="Ilość" min="1" value="10" style="padding:8px;border-radius:5px;border:1px solid #555;background:#222;color:#fff;width:90px;">' +
        '<button onclick="adminAddRobux(parseInt(document.getElementById(\'customRobuxAmount\').value)||0)" style="background:#33691e;color:#76ff03;border:2px solid #76ff03;padding:8px 16px;border-radius:8px;cursor:pointer;font-weight:bold;">DODAJ</button>' +
        '</div>' +
        '<div style="color:#aaa;font-size:13px;margin-top:8px;">Aktualnie: <span style="color:#76ff03;font-weight:bold;" id="adminRobuxDisplay">' + robuxProgress + '</span> 🧠</div>' +
        '</div>';
}

function addCreatorCode() {
    var code = document.getElementById('newCode').value.trim().toLowerCase();
    var reward = parseInt(document.getElementById('newReward').value) || 1000;
    var desc = document.getElementById('newDesc').value || 'Nowy kod';
    
    if (!code) {
        alert('Wpisz kod!');
        return;
    }
    
    // Sprawdź czy kod już istnieje
    for (var i = 0; i < creatorCodes.length; i++) {
        if (creatorCodes[i].code === code) {
            alert('Ten kod już istnieje!');
            return;
        }
    }
    
    creatorCodes.push({ code: code, reward: reward, description: desc, uses: 0 });
    saveCreatorCodes();
    renderAdminPanel();
    
    document.getElementById('newCode').value = '';
}

function deleteCreatorCode(index) {
    if (confirm('Na pewno usunąć ten kod?')) {
        creatorCodes.splice(index, 1);
        saveCreatorCodes();
        renderAdminPanel();
    }
}

function adminAddRobux(amount) {
    if (!amount || amount <= 0) return;
    robuxProgress += amount;
    updateRobux();
    saveGame();
    var disp = document.getElementById('adminRobuxDisplay');
    if (disp) disp.textContent = robuxProgress;
}

function updateAdminSetting(key, value) {
    adminSettings[key] = value;
    saveAdminSettings();
}

// ========== STAR DROP FUNCTIONS ==========

function clickStarDrop() {
    if (starDropOpened || starDropClicks >= 4) return;
    
    starDropClicks++;
    
    var box = document.getElementById('starDropBox');
    box.style.transform = 'scale(0.9)';
    setTimeout(function() { box.style.transform = 'scale(1)'; }, 100);
    
    document.getElementById('starDropClicks').textContent = starDropClicks + ' / 4 KLIKNIĘĆ';
    
    // Po 4 kliknięciach pokaż przycisk otwarcia
    if (starDropClicks >= 4) {
        document.getElementById('starDropOpenBtn').style.display = 'block';
    }
}

function openStarDrop() {
    if (starDropOpened) return;
    starDropOpened = true;
    
    // Losuj nagrodę z puli tej rzadkości
    var rewards = starRewards[starDropRarity];
    var reward = rewards[Math.floor(Math.random() * rewards.length)];
    
    // Animacja otwierania
    var box = document.getElementById('starDropBox');
    box.innerHTML = '🎉';
    box.style.transform = 'scale(1.5)';
    
    // Pokaż przycisk powrotu do lobby
    document.getElementById('starDropOpenBtn').style.display = 'none';
    document.getElementById('starDropLobbyBtn').style.display = 'block';
    
    // Pokaż nagrodę od razu (bez opóźnienia)
    if (reward.type === 'coins') {
        coins += reward.amount;
        updateCoins();
        document.getElementById('starDropClicks').innerHTML = '<span style="color:#4cff50;font-size:28px;">🎉 OTRZYMANO!<br>💰 ' + reward.amount + ' MONET!</span>';
    } else if (reward.type === 'robux') {
        robuxProgress += reward.amount;
        updateRobux();
        document.getElementById('starDropClicks').innerHTML = '<span style="color:#4cff50;font-size:28px;">🎉 OTRZYMANO!<br>💎 ' + reward.amount + ' ROBUXÓW!</span>';
    } else if (reward.type === 'character') {
        // Pokaż ekran nowej postaci
        document.getElementById('starDrop').style.display = 'none';
        showNewCharacter(reward.charName);
        saveGame();
        return;
    } else if (reward.type === 'skin') {
        if (ownedSkins.indexOf(reward.skinId) === -1) {
            ownedSkins.push(reward.skinId);
            document.getElementById('starDropClicks').innerHTML = '<span style="color:#ffd700;font-size:28px;">🎉 OTRZYMANO SKIN!<br>Nowa skórka dodana!</span>';
        } else {
            coins += 500;
            updateCoins();
            document.getElementById('starDropClicks').innerHTML = '<span style="color:#ffd700;font-size:28px;">🎉 Masz już ten skin!<br>+500 monet bonus!</span>';
        }
    }
    saveGame();
}

function getRandomRarity() {
    var rand = Math.random() * 100;
    var cumulative = 0;
    for (var i = 0; i < starRarities.length; i++) {
        cumulative += starRarities[i].chance;
        if (rand < cumulative) {
            return starRarities[i];
        }
    }
    return starRarities[0];
}

function shadeColor(color, percent) {
    var colors = {
        '#42a5f5': '#1565c0',
        '#66bb6a': '#2e7d32',
        '#ab47bc': '#6a1b9a',
        '#ff9800': '#e65100',
        '#ffd700': '#ff6f00'
    };
    return colors[color] || color;
}

function showStarDrop() {
    starDropClicks = 0;
    starDropOpened = false;
    gameRunning = false;

    var gameScreen = document.getElementById('gameScreen');
    if (gameScreen) gameScreen.style.display = 'none';

    var starDropEl = document.getElementById('starDrop');
    if (starDropEl) starDropEl.style.display = 'flex';

    var lobbyEl = document.getElementById('lobby');
    if (lobbyEl) lobbyEl.style.display = 'none';

    var box = document.getElementById('starDropBox');
    if (!box) {
        setTimeout(showStarDrop, 100);
        return;
    }

    var rarity = getRandomRarity();
    starDropRarity = rarity.name;

    box.style.background = 'linear-gradient(180deg, ' + rarity.color + ', ' + shadeColor(rarity.color, -30) + ')';
    box.style.border = '8px solid ' + rarity.color;
    box.style.boxShadow = '0 0 50px ' + rarity.color + ', 0 0 100px ' + rarity.color;
    box.innerHTML = '⭐';

    document.getElementById('starDropClicks').textContent = '0 / 4 KLIKNIĘĆ';
    document.getElementById('starDropRarity').textContent = 'Rzadkość: ' + rarity.name.toUpperCase();
    document.getElementById('starDropRarity').style.color = rarity.color;
    document.getElementById('starDropOpenBtn').style.display = 'none';
    document.getElementById('starDropLobbyBtn').style.display = 'none';
    document.getElementById('starDrop').style.display = 'flex';
}

function closeStarDrop() {
    document.getElementById('starDrop').style.display = 'none';
    document.getElementById('lobby').style.display = 'flex';
}

function starDropToLobby() {
    document.getElementById('starDrop').style.display = 'none';
    document.getElementById('lobby').style.display = 'flex';
}

// ========== REWARD FUNCTIONS ==========

function giveReward() {
    // Zatrzymaj grę
    gameRunning = false;
    
    // Losuj nagrodę i zapisz do odebrania w lobby
    var rewards = [
        { type: 'coins', amount: 100, msg: '💰 100 monet!' },
        { type: 'coins', amount: 200, msg: '💰 200 monet!' },
        { type: 'coins', amount: 300, msg: '💰 300 monet!' },
        { type: 'coins', amount: 500, msg: '💰 500 monet!' },
        { type: 'robux', amount: 5, msg: '💎 5 robuxów!' },
        { type: 'robux', amount: 10, msg: '💎 10 robuxów!' },
        { type: 'skin', skinId: 'scary', msg: '👹 Skórka: Scary Zombie!' },
        { type: 'skin', skinId: 'cosmic', msg: '🚀 Skórka: Kosmiczny Zombie!' },
        { type: 'skin', skinId: 'ninja', msg: '🥷 Skórka: Ninja Zombie!' },
        { type: 'skin', skinId: 'aurora', msg: '🌌 Skórka: Aurora Frost!' },
        { type: 'character', charName: 'Frostik', msg: '❄️ Nowa postać: Frostik!' },
        { type: 'character', charName: 'Cieniak', msg: '🌑 Nowa postać: Cieniak!' }
    ];
    
    rewardPending = rewards[Math.floor(Math.random() * rewards.length)];
    
    // Wróć do lobby
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('lobby').style.display = 'flex';
    
    // Sprawdź czy jest nagroda do odebrania
    setTimeout(checkRewardInLobby, 500);
}

function checkRewardInLobby() {
    if (rewardPending) {
        var wantsReward = confirm('🏆 WYGRANA!\n\nCzy chcesz odebrać nagrodę?\n\n' + rewardPending.msg);
        
        if (wantsReward) {
            // Dodaj nagrodę
            if (rewardPending.type === 'coins') {
                coins += rewardPending.amount;
                updateCoins();
                alert('🎉 Otrzymałeś: ' + rewardPending.msg);
            } else if (rewardPending.type === 'robux') {
                robuxProgress += rewardPending.amount;
                updateRobux();
                alert('🎉 Otrzymałeś: ' + rewardPending.msg);
            } else if (rewardPending.type === 'skin') {
                if (ownedSkins.indexOf(rewardPending.skinId) === -1) {
                    ownedSkins.push(rewardPending.skinId);
                    alert('🎉 Otrzymałeś: ' + rewardPending.msg);
                } else {
                    coins += 500;
                    updateCoins();
                    alert('🎉 Masz już ten skin! Otrzymujesz 500 monet bonus!');
                }
            } else if (rewardPending.type === 'character') {
                if (unlockedCharacters.indexOf(rewardPending.charName) === -1) {
                    unlockedCharacters.push(rewardPending.charName);
                    alert('🎉 Otrzymałeś: ' + rewardPending.msg);
                    // Ustaw jako aktywną postać
                    selectedCharacter = rewardPending.charName;
                    document.getElementById('selectedInfo').textContent = '🎮 Wybrana postać: ' + selectedCharacter;
                    refreshCharList();
                } else {
                    coins += 1000;
                    updateCoins();
                    alert('🎉 Masz już tę postać! Otrzymujesz 1000 monet bonus!');
                }
            }
            
            saveGame();
        }
        
        rewardPending = null;
    }
}
