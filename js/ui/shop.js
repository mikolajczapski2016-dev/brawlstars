// ========== SHOP FUNCTIONS ==========

// Kupowanie skinów ze sklepu
function buySkinFromShop(skinId, price) {
    if (ownedSkins.indexOf(skinId) !== -1) {
        alert('Masz już ten skin!');
        return;
    }
    
    if (coins >= price) {
        coins -= price;
        updateCoins();
        ownedSkins.push(skinId);
        
        // Zaktualizuj przycisk w sklepie
        var shopItem = document.getElementById('shop' + skinId.charAt(0).toUpperCase() + skinId.slice(1));
        if (shopItem) {
            var btn = shopItem.querySelector('.upgrade-btn');
            if (btn) {
                btn.textContent = '✔ KUPIONE';
                btn.disabled = true;
            }
        }
        
        // Zaktualizuj przycisk w panelu postaci
        var skinCards = document.querySelectorAll('.skin-card');
        for (var i = 0; i < skinCards.length; i++) {
            var onclickAttr = skinCards[i].getAttribute('onclick') || '';
            if (onclickAttr.indexOf("'" + skinId + "'") !== -1) {
                var priceEl = skinCards[i].querySelector('.skin-price');
                if (priceEl) {
                    priceEl.textContent = '✔';
                    priceEl.className = 'skin-status owned';
                }
                break;
            }
        }
        
        saveGame();
        alert('🎉 Kupiono skórkę!');
    } else {
        alert('Za mało monet! Potrzebujesz ' + price + ' 💰');
    }
}

// Aktualizuj przyciski w sklepie (pokaż czy skin jest już kupiony)
function updateShopButtons() {
    var skinList = ['scary', 'cosmic', 'burnt', 'darkfrost', 'ninja', 'aurora', 'diamond', 'golden', 'goldbacon', 'grill'];
    
    for (var i = 0; i < skinList.length; i++) {
        var skinId = skinList[i];
        var shopItem = document.getElementById('shop' + skinId.charAt(0).toUpperCase() + skinId.slice(1));
        if (shopItem) {
            var btn = shopItem.querySelector('.upgrade-btn');
            if (btn && ownedSkins.indexOf(skinId) !== -1) {
                btn.textContent = '✔ KUPIONE';
                btn.disabled = true;
            }
        }
    }
}

function selectSkin(card, skinId) {
    if (ownedSkins.indexOf(skinId) === -1) {
        var price = skinPrices[skinId] || 500;
        if (coins >= price) {
            coins -= price;
            updateCoins();
            ownedSkins.push(skinId);
            var priceEl = card.querySelector('.skin-price');
            if (priceEl) {
                priceEl.textContent = '✔';
                priceEl.className = 'skin-status owned';
            }
        } else {
            alert('Za mało monet! Potrzebujesz ' + price);
            return;
        }
    }

    currentSkin = skinId;
    applySkin(skinId);
    saveGame();
}

function applySkin(skinId) {
    // Konwersja starej nazwy postaci na nową
    var charKey = selectedCharacter;
    if (charKey === 'Noobek') charKey = 'Zombie';
    if (!characters[charKey]) charKey = Object.keys(characters)[0];
    var char = characters[charKey];
    if (!char) return;
    var lobby = document.getElementById('lobbyCharacter');
    var preview = document.getElementById('charPreviewModel');

    // Animacje specjalne dla niektórych skinów
    var specialAnims = ['scary', 'ninja', 'darkfrost'];
    var anim = (specialAnims.indexOf(skinId) !== -1) ? 'emerge' : char.lobbyAnim;

    lobby.className = 'lobby-character anim-' + anim;
    preview.className = 'char-preview-model anim-' + anim;
}

// Realizacja kodu twórców
function redeemCreatorCode() {
    var codeInput = document.getElementById('creatorCode');
    var messageEl = document.getElementById('codeMessage');
    var code = codeInput.value.trim().toLowerCase();
    
    if (code === '') {
        messageEl.textContent = 'Wpisz kod!';
        messageEl.style.color = '#ff5555';
        return;
    }
    
    if (creatorCodeUsed) {
        messageEl.textContent = 'Ten kod został już wykorzystany!';
        messageEl.style.color = '#ff5555';
        return;
    }
    
    // Szukaj kodu w bazie (z localStorage)
    var validCode = null;
    for (var i = 0; i < creatorCodes.length; i++) {
        if (creatorCodes[i].code === code) {
            validCode = creatorCodes[i];
            creatorCodes[i].uses++;
            saveCreatorCodes();
            break;
        }
    }
    
    if (validCode) {
        coins += validCode.reward;
        updateCoins();
        creatorCodeUsed = true;
        saveGame();
        
        messageEl.textContent = '🎉 SUKCES! Otrzymano ' + validCode.reward + ' monet!';
        messageEl.style.color = '#4cff50';
        codeInput.value = '';
        codeInput.disabled = true;
    } else {
        messageEl.textContent = '❌ Nieprawidłowy kod!';
        messageEl.style.color = '#ff5555';
    }
}

function saveCreatorCodes() {
    localStorage.setItem('creatorCodes', JSON.stringify(creatorCodes));
}

function saveAdminSettings() {
    localStorage.setItem('adminSettings', JSON.stringify(adminSettings));
}
