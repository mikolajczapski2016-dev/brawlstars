// ============ LOBBY MINI PIŁKA ============

function fbShowLobby() {
    fbLoadData();

    var container = document.getElementById('footballContainer');
    if (!container) return;

    // Buduj roster graczy
    var rosterHTML = '';
    for (var i = 0; i < FOOTBALL_PLAYERS.length; i++) {
        var p = FOOTBALL_PLAYERS[i];
        var owned = fbSave.ownedPlayers.indexOf(p.id) >= 0;
        var equipped = fbSave.selectedPlayers.indexOf(p.id) >= 0;
        var badge = owned ? (equipped ? '✅ W SKŁADZIE' : 'WŁASNY') : '💰 ' + p.price;
        var btnText = owned ? (equipped ? 'USUŃ Z SKŁADU' : 'DODAJ DO SKŁADU') : 'KUP';
        var btnColor = owned ? (equipped ? '#f44336' : '#4caf50') : (fbSave.coins >= p.price ? '#ff9800' : '#555');
        var btnDisabled = (!owned && fbSave.coins < p.price) ? 'disabled' : '';

        rosterHTML += `
            <div style="display:flex;align-items:center;background:rgba(255,255,255,0.08);border-radius:12px;padding:12px;margin:6px 0;border:2px solid ${owned ? p.color : 'rgba(255,255,255,0.1)'};">
                <div style="font-size:32px;margin-right:12px;width:40px;text-align:center;">${p.icon}</div>
                <div style="flex:1;">
                    <div style="color:#fff;font-weight:800;font-size:16px;">${p.name}</div>
                    <div style="color:rgba(255,255,255,0.5);font-size:12px;">${p.position}</div>
                    <div style="font-size:11px;margin-top:4px;">
                        <span style="color:#4caf50;">💨${p.speed}</span>
                        <span style="color:#f44336;margin-left:8px;">🎯${p.shot}</span>
                        <span style="color:#2196f3;margin-left:8px;">🛡️${p.defense}</span>
                    </div>
                </div>
                <div style="text-align:right;">
                    <div style="color:${owned ? '#4caf50' : '#ffd700'};font-size:12px;font-weight:700;margin-bottom:4px;">${badge}</div>
                    <button onclick="fbBuyOrTogglePlayer('${p.id}')" style="padding:6px 14px;background:${btnColor};color:#fff;font-size:12px;font-weight:800;border:none;border-radius:20px;cursor:pointer;" ${btnDisabled}>${btnText}</button>
                </div>
            </div>
        `;
    }

    container.innerHTML = `
        <div class="fb-lobby">
            <!-- Tło -->
            <div class="fb-lobby-bg">
                <span class="fb-blob fb-blob-1"></span>
                <span class="fb-blob fb-blob-2"></span>
            </div>

            <!-- Nagłówek -->
            <div class="fb-lobby-header">
                <div class="fb-logo">MINI <span>PIŁKA</span></div>
                <div class="fb-coins">💰 ${fbSave.coins}</div>
                <div class="fb-stats">⚽ ${fbSave.matchesPlayed} meczów | 🏆 ${fbSave.matchesWon} wygranych</div>
                <button class="fb-back-btn" onclick="fbBackToGameShop()">🏠 MIKI GAMESHOP</button>
            </div>

            <!-- Przycisk Graj -->
            <div class="fb-lobby-center">
                <button class="fb-play-btn" onclick="fbStartMatch()">▶ GRAJ</button>
                <div style="color:rgba(255,255,255,0.5);font-size:14px;margin-top:10px;">5 vs 5 | ${MATCH_DURATION}s meczu | Monety za wygraną!</div>
            </div>

            <!-- Skład drużyny -->
            <div class="fb-lobby-section">
                <h3 style="color:#42ff9e;margin-bottom:10px;">👥 SKŁAD DRUŻYNY (${fbSave.selectedPlayers.length}/5)</h3>
                <div style="display:flex;gap:8px;margin-bottom:15px;flex-wrap:wrap;">
                    ${fbSave.selectedPlayers.map(function(pid) {
                        var p = FOOTBALL_PLAYERS.find(function(x) { return x.id === pid; }) || FOOTBALL_PLAYERS[0];
                        return '<div style="background:' + p.color + ';border-radius:12px;padding:8px 12px;text-align:center;min-width:60px;"><div style="font-size:24px;">' + p.icon + '</div><div style="color:#fff;font-size:10px;font-weight:700;">' + p.name + '</div></div>';
                    }).join('')}
                </div>
            </div>

            <!-- Dostępni piłkarze -->
            <div class="fb-lobby-section">
                <h3 style="color:#ffd700;margin-bottom:10px;">🛒 PIŁKARZE</h3>
                ${rosterHTML}
            </div>
        </div>
    `;
}

// Kup lub dodaj/usuń piłkarza ze składu
function fbBuyOrTogglePlayer(playerId) {
    fbLoadData();

    var playerData = null;
    for (var i = 0; i < FOOTBALL_PLAYERS.length; i++) {
        if (FOOTBALL_PLAYERS[i].id === playerId) {
            playerData = FOOTBALL_PLAYERS[i];
            break;
        }
    }
    if (!playerData) return;

    var owned = fbSave.ownedPlayers.indexOf(playerId) >= 0;
    var inSquad = fbSave.selectedPlayers.indexOf(playerId) >= 0;

    if (owned) {
        if (inSquad) {
            // Usuń ze składu - ale zostaw min 2
            if (fbSave.selectedPlayers.length <= 2) {
                alert('Musisz mieć minimum 2 piłkarzy w składzie!');
                return;
            }
            var idx = fbSave.selectedPlayers.indexOf(playerId);
            fbSave.selectedPlayers.splice(idx, 1);
        } else {
            // Dodaj do składu - max 5
            if (fbSave.selectedPlayers.length >= 5) {
                alert('Skład ma już 5 piłkarzy! Usuń kogoś żeby dodać nowego.');
                return;
            }
            fbSave.selectedPlayers.push(playerId);
        }
    } else {
        // Kup
        if (fbSave.coins < playerData.price) {
            alert('Za mało monet! Potrzebujesz ' + playerData.price + ' 💰');
            return;
        }
        fbSave.coins -= playerData.price;
        fbSave.ownedPlayers.push(playerId);
        // Automatycznie dodaj do składu jeśli jest miejsce
        if (fbSave.selectedPlayers.length < 5) {
            fbSave.selectedPlayers.push(playerId);
        }
    }

    fbSaveData();
    fbShowLobby();
}

// Pokaż odpowiedni ekran
function fbShowScreen(screen) {
    if (screen === 'match') {
        var container = document.getElementById('footballContainer');
        container.innerHTML = '<canvas id="footballCanvas" style="width:100%;height:100vh;display:block;"></canvas>';
    }
}

// Powrót do Miki GameShop
function fbBackToGameShop() {
    var container = document.getElementById('footballContainer');
    if (container) container.style.display = 'none';
    document.getElementById('mikiGameShop').style.display = '';
    document.body.classList.add('platform-mode');
    document.body.classList.remove('game-shell');
}
