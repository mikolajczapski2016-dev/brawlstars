// ========== UPGRADE FUNCTIONS AND STATE ==========

// State variables
var characterUpgrades = {};
var hyperchargedCharacters = {}; // { 'Zombie': true, 'Blazer': true, ... }

// ========== UPGRADE FUNCTIONS ==========

// Inicjalizacja ulepszeń dla nowej postaci
function initCharacterUpgrades(charName) {
    if (!characterUpgrades[charName]) {
        characterUpgrades[charName] = [1, 1, 1]; // HP, Atak, Szybkość - zaczynamy od poziomu 1
    }
}

// Wczytaj ulepszenia dla konkretnej postaci do UI
function loadCharacterUpgrades(charName) {
    initCharacterUpgrades(charName);
    var upgrades = characterUpgrades[charName];
    var bars = document.querySelectorAll('.upgrade-bar');
    for (var i = 0; i < bars.length; i++) {
        var level = upgrades[i] || 1;
        var dots = bars[i].querySelectorAll('.dot');
        for (var j = 0; j < dots.length; j++) {
            if (j < level) {
                dots[j].classList.add('filled');
            } else {
                dots[j].classList.remove('filled');
            }
        }
    }
    updateUpgradeBtns();
    checkHyperchargeBtn();
}

// Zapisz aktualne ulepszenia z UI do postaci
function saveCurrentUpgrades(charName) {
    var bars = document.querySelectorAll('.upgrade-bar');
    var upgrades = [];
    for (var i = 0; i < bars.length; i++) {
        upgrades.push(bars[i].querySelectorAll('.dot.filled').length);
    }
    characterUpgrades[charName] = upgrades;
}

// Filtruj skiny dla wybranej postaci
function filterSkinsForCharacter(charName) {
    var skinCards = document.querySelectorAll('.skin-card');
    for (var i = 0; i < skinCards.length; i++) {
        var chars = skinCards[i].getAttribute('data-chars') || '';
        if (chars.indexOf(charName) !== -1) {
            skinCards[i].style.display = 'block';
        } else {
            skinCards[i].style.display = 'none';
        }
    }
}

// Pobierz cenę ulepszenia
function getUpgradePrice(bar) {
    var level = bar.querySelectorAll('.dot.filled').length;
    if (level >= 10) return -1;
    return upgradePrices[level - 1] || 100;
}

// Zaktualizuj przyciski ulepszeń
function updateUpgradeBtns() {
    var bars = document.querySelectorAll('.upgrade-bar');
    for (var i = 0; i < bars.length; i++) {
        var price = getUpgradePrice(bars[i]);
        var btn = bars[i].querySelector('.upgrade-btn');
        if (price === -1) {
            btn.textContent = 'MAX';
            btn.disabled = true;
        } else {
            btn.textContent = '💰 ' + price;
            btn.disabled = false;
        }
    }
    checkHyperchargeBtn();
}

// Sprawdź czy postać jest na maksa i pokaż przycisk hypercharge
function checkHyperchargeBtn() {
    var charName = previewCharacter || selectedCharacter;
    var section = document.getElementById('hyperchargeSection');
    var btn = document.getElementById('hyperchargeBtn');
    var status = document.getElementById('hyperchargeStatus');
    if (!section) return;

    // Sprawdź czy wszystkie 3 statystyki są na poziomie 10
    var bars = document.querySelectorAll('.upgrade-bar');
    var allMax = bars.length >= 3;
    for (var i = 0; i < bars.length; i++) {
        if (bars[i].querySelectorAll('.dot.filled').length < 10) { allMax = false; break; }
    }

    if (allMax) {
        section.style.display = 'block';
        if (hyperchargedCharacters[charName]) {
            btn.style.display = 'none';
            status.style.display = 'block';
        } else {
            btn.style.display = 'block';
            status.style.display = 'none';
        }
    } else {
        section.style.display = 'none';
    }
}

// Kup hypercharge dla aktualnej postaci
function buyHypercharge() {
    var charName = previewCharacter || selectedCharacter;
    if (hyperchargedCharacters[charName]) return;
    if (coins < 5000) {
        alert('Za mało monet! Potrzebujesz 5000 💰');
        return;
    }
    coins -= 5000;
    updateCoins();
    hyperchargedCharacters[charName] = true;
    saveGame();
    checkHyperchargeBtn();
}

// Kup ulepszenie
function upgrade(btn) {
    var bar = btn.parentElement;
    var price = getUpgradePrice(bar);
    if (price === -1) {
        alert('Już max poziom!');
        return;
    }
    if (coins >= price) {
        var emptyDot = bar.querySelector('.dot:not(.filled)');
        if (emptyDot) {
            coins -= price;
            updateCoins();
            emptyDot.classList.add('filled');
            updateUpgradeBtns();
            saveGame();
        }
    } else {
        alert('Za mało monet! Potrzebujesz ' + price);
    }
}
