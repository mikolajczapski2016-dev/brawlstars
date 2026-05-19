// ============ ZAPIS / ODCZYT STANU MINI PIŁKA ============

var FB_SAVE_KEY = 'mini_football_save';

// Domyślny stan gry
var fbDefaultSave = {
    coins: 200,
    ownedPlayers: ['basic', 'keeper'], // na start masz 2 piłkarzy
    selectedPlayers: ['basic', 'keeper', 'basic', 'basic', 'keeper'], // 5 w składzie
    matchesPlayed: 0,
    matchesWon: 0,
    version: 1
};

var fbSave = null;

function fbLoadData() {
    try {
        var raw = localStorage.getItem(FB_SAVE_KEY);
        if (raw) {
            fbSave = JSON.parse(raw);
            // Upewnij się że nowe pola istnieją
            if (!fbSave.ownedPlayers) fbSave.ownedPlayers = ['basic', 'keeper'];
            if (!fbSave.selectedPlayers) fbSave.selectedPlayers = ['basic', 'keeper', 'basic', 'basic', 'keeper'];
            if (typeof fbSave.coins !== 'number') fbSave.coins = 200;
            if (typeof fbSave.matchesPlayed !== 'number') fbSave.matchesPlayed = 0;
            if (typeof fbSave.matchesWon !== 'number') fbSave.matchesWon = 0;
        } else {
            fbSave = JSON.parse(JSON.stringify(fbDefaultSave));
            fbSaveData();
        }
    } catch (e) {
        fbSave = JSON.parse(JSON.stringify(fbDefaultSave));
    }
}

function fbSaveData() {
    try {
        localStorage.setItem(FB_SAVE_KEY, JSON.stringify(fbSave));
    } catch (e) {
        // Ignoruj błędy localStorage
    }
}
