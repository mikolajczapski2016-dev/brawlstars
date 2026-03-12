// ========== SAVE/LOAD FUNCTIONS ==========

function saveGame() {
    // Zapisz aktualne ulepszenia dla podglądanej postaci (jeśli jesteśmy w panelu postaci)
    saveCurrentUpgrades(previewCharacter);
    // Zapisz też dla wybranej postaci (na wszelki wypadek)
    saveCurrentUpgrades(selectedCharacter);

    var data = {
        coins: coins,
        trophies: trophies,
        claimedRewards: claimedRewards,
        ownedSkins: ownedSkins,
        currentSkin: currentSkin,
        characterUpgrades: characterUpgrades, // nowa struktura per postać
        robuxProgress: robuxProgress,
        claimedRobuxRewards: claimedRobuxRewards,
        creatorCodeUsed: creatorCodeUsed,
        unlockedCharacters: unlockedCharacters,
        selectedCharacter: selectedCharacter
    };
    localStorage.setItem('brawlblox_save', JSON.stringify(data));
    localStorage.setItem('arenaLevel', arenaLevel);
}

function loadGame() {
    var raw = localStorage.getItem('brawlblox_save');
    if (!raw) return;
    var data = JSON.parse(raw);

    coins = data.coins;
    updateCoins();

    if (data.trophies !== undefined) {
        trophies = data.trophies;
        updateTrophies();
    }
    if (data.claimedRewards) claimedRewards = data.claimedRewards;

    if (data.ownedSkins) ownedSkins = data.ownedSkins;
    if (data.currentSkin) {
        currentSkin = data.currentSkin;
        applySkin(currentSkin);
    }

    // Wczytaj ulepszenia per postać (nowa struktura) lub stara struktura
    if (data.characterUpgrades) {
        // Kompatybilność ze starymi zapisami - konwersja starej nazwy na nową
        var oldUpgrades = data.characterUpgrades;
        characterUpgrades = {};
        for (var key in oldUpgrades) {
            var newKey = key === 'Noobek' ? 'Zombie' : key;
            characterUpgrades[newKey] = oldUpgrades[key];
        }
    } else if (data.upgrades) {
        // Konwersja ze starej struktury - przenieś ulepszenia do Zombiego
        characterUpgrades = { Zombie: data.upgrades };
    }
    // Upewnij się że każda odblokowana postać ma ulepszenia
    for (var i = 0; i < unlockedCharacters.length; i++) {
        initCharacterUpgrades(unlockedCharacters[i]);
    }
    // Wczytaj ulepszenia dla aktualnie wybranej postaci
    loadCharacterUpgrades(selectedCharacter);

    if (data.robuxProgress !== undefined) { robuxProgress = data.robuxProgress; updateRobux(); }
    // Konwersja starego formatu (robux) na nowy (robuxProgress)
    else if (data.robux !== undefined) { robuxProgress = data.robux; updateRobux(); }
    if (data.claimedRobuxRewards) claimedRobuxRewards = data.claimedRobuxRewards;
    if (data.unlockedCharacters) {
        // Kompatybilność ze starymi zapisami - konwersja starej nazwy na nową
        unlockedCharacters = data.unlockedCharacters.map(function(c) {
            return c === 'Noobek' ? 'Zombie' : c;
        });
    }

    saveGame();
    if (data.selectedCharacter) {
        // Kompatybilność ze starymi zapisami - konwersja starej nazwy na nową
        var oldChar = data.selectedCharacter;
        if (oldChar === 'Noobek') oldChar = 'Zombie';
        selectedCharacter = oldChar;
        previewCharacter = selectedCharacter;
        document.getElementById('selectedInfo').textContent = '🎮 Wybrana postać: ' + selectedCharacter;
    }
    
    // Wczytaj poziom areny
    var savedArenaLevel = localStorage.getItem('arenaLevel');
    if (savedArenaLevel) {
        arenaLevel = parseInt(savedArenaLevel);
        updateArenaLevelDisplay();
    }
    
    if (data.creatorCodeUsed) {
        creatorCodeUsed = data.creatorCodeUsed;
    }

    // Przywróć animację po załadowaniu wszystkiego
    if (data.currentSkin) {
        applySkin(currentSkin);
    }

    // Aktualizuj status wszystkich kupionych skinow
    var skinCards = document.querySelectorAll('.skin-card');
    for (var i = 0; i < skinCards.length; i++) {
        var onclickAttr = skinCards[i].getAttribute('onclick') || '';
        var skinMatch = onclickAttr.match(/selectSkin\(this,\s*'([^']+)'\)/);
        if (skinMatch) {
            var skinId = skinMatch[1];
            var priceEl = skinCards[i].querySelector('.skin-price');
            if (priceEl && ownedSkins.indexOf(skinId) !== -1) {
                priceEl.textContent = '✔';
                priceEl.className = 'skin-status owned';
            }
        }
    }
}

function resetGame() {
    localStorage.removeItem('brawlblox_save');
    coins = 500;
    trophies = 0;
    claimedRewards = [];
    ownedSkins = ['default'];
    currentSkin = 'default';
    robuxProgress = 0;
    claimedRobuxRewards = [];
    unlockedCharacters = ['Zombie', 'Toksyk', 'Duszek', 'Złotek', 'UltraZombi'];
    characterUpgrades = {};
    updateCoins();
    updateTrophies();
    updateRobux();
    applySkin('default');
    // Zresetuj wszystkie paski ulepszeń do poziomu 1
    var bars = document.querySelectorAll('.upgrade-bar');
    for (var i = 0; i < bars.length; i++) {
        var dots = bars[i].querySelectorAll('.dot');
        for (var j = 0; j < dots.length; j++) {
            if (j === 0) dots[j].classList.add('filled');
            else dots[j].classList.remove('filled');
        }
    }
    saveGame();
}
