// ============ LOGIKA MECZU MINI PIŁKA ============

var fbCanvas, fbCtx;
var fbMatchRunning = false;
var fbMatchTime = 0;
var fbScore = { player: 0, enemy: 0 };
var fbBall = null;
var fbMyTeam = [];
var fbEnemyTeam = [];
var fbMyPlayer = null; // piłkarz którym sterujesz
var fbKeys = {};
var fbJoystick = null;
var fbMatchCoins = 0;
var fbLastTime = 0;

// ---- START MECZU ----
function fbStartMatch() {
    var container = document.getElementById('footballContainer');
    if (!container) return;

    fbCanvas = document.getElementById('footballCanvas');
    fbCtx = fbCanvas.getContext('2d');
    fbCanvas.width = window.innerWidth;
    fbCanvas.height = window.innerHeight;

    fbMatchRunning = true;
    fbMatchTime = MATCH_DURATION;
    fbScore = { player: 0, enemy: 0 };
    fbMatchCoins = 0;

    // Piłka na środku
    fbBall = {
        x: FOOTBALL_FIELD_W / 2,
        y: FOOTBALL_FIELD_H / 2,
        vx: 0, vy: 0,
        radius: 10,
        holder: null // null, { team:'player', idx:0 }, { team:'enemy', idx:0 }
    };

    // Moja drużyna (3 + ja = 4, + bramkarz = 5)
    fbMyTeam = [];
    var myRoster = fbGetTeamRoster();
    for (var i = 0; i < myRoster.length && i < 5; i++) {
        var p = myRoster[i];
        fbMyTeam.push({
            id: p.id, name: p.name, icon: p.icon,
            speed: p.speed, shot: p.shot, defense: p.defense,
            color: p.color, position: p.position,
            x: 100 + i * 60, y: 100 + i * 120,
            vx: 0, vy: 0,
            isPlayer: (i === 0), // pierwszy to ten którym sterujesz
            isGoalkeeper: (p.position === 'Bramkarz'),
            isDead: false, respawnTimer: 0
        });
    }
    // Jeśli mniej niż 5 - dodaj podstawowych
    while (fbMyTeam.length < 5) {
        fbMyTeam.push({
            id: 'basic', name: 'Kamil', icon: '⚽',
            speed: 3, shot: 5, defense: 2,
            color: '#4caf50', position: 'Napastnik',
            x: 100 + fbMyTeam.length * 60, y: 100 + fbMyTeam.length * 100,
            vx: 0, vy: 0,
            isPlayer: false,
            isGoalkeeper: false,
            isDead: false, respawnTimer: 0
        });
    }

    fbMyPlayer = fbMyTeam[0];
    fbMyPlayer.isPlayer = true;

    // Drużyna przeciwna (5 AI)
    fbEnemyTeam = [];
    var enemyNames = ['Czerwony', 'Rubin', 'Szkarłat', 'Karmazyn', 'Wiśniowy'];
    var enemyPositions = [
        { x: FOOTBALL_FIELD_W - 80, y: FOOTBALL_FIELD_H / 2, gk: true },
        { x: FOOTBALL_FIELD_W - 200, y: 150 },
        { x: FOOTBALL_FIELD_W - 200, y: FOOTBALL_FIELD_H / 2 },
        { x: FOOTBALL_FIELD_W - 200, y: FOOTBALL_FIELD_H - 150 },
        { x: FOOTBALL_FIELD_W - 350, y: FOOTBALL_FIELD_H / 2 }
    ];
    for (var i = 0; i < 5; i++) {
        fbEnemyTeam.push({
            id: 'enemy_' + i, name: enemyNames[i], icon: '🔴',
            speed: 2.5 + Math.random() * 1.5,
            shot: 3 + Math.random() * 3,
            defense: 2 + Math.random() * 3,
            color: TEAM_ENEMY_COLOR,
            position: i === 0 ? 'Bramkarz' : 'Napastnik',
            x: enemyPositions[i].x,
            y: enemyPositions[i].y,
            vx: 0, vy: 0,
            isPlayer: false,
            isGoalkeeper: enemyPositions[i].gk,
            isDead: false, respawnTimer: 0
        });
    }

    // Pokaż ekran meczu
    fbShowScreen('match');

    // Sterowanie
    fbSetupControls();

    // Start pętli gry
    fbLastTime = performance.now();
    fbGameLoop();
}

// ---- PĘTLA GRY ----
function fbGameLoop() {
    if (!fbMatchRunning) return;

    var now = performance.now();
    var dt = (now - fbLastTime) / 1000;
    fbLastTime = now;

    // Odliczanie czasu
    fbMatchTime -= dt;
    if (fbMatchTime <= 0) {
        fbMatchTime = 0;
        fbEndMatch();
        return;
    }

    fbUpdateMatch(dt);
    fbDrawMatch();

    requestAnimationFrame(fbGameLoop);
}

// ---- AKTUALIZACJA MECZU ----
function fbUpdateMatch(dt) {
    // Sterowanie graczem
    fbUpdatePlayerControl(dt);

    // AI sojuszników
    fbUpdateTeamAI(fbMyTeam, 'player', dt);

    // AI przeciwników
    fbUpdateTeamAI(fbEnemyTeam, 'enemy', dt);

    // Fizyka piłki
    fbUpdateBall(dt);

    // Sprawdź gole
    fbCheckGoals();

    // Respawn martwych graczy
    fbCheckRespawns(dt);
}

// ---- STEROWANIE GRACZEM ----
function fbUpdatePlayerControl(dt) {
    if (!fbMyPlayer || fbMyPlayer.isDead) return;

    var dx = 0, dy = 0;
    if (fbKeys['ArrowUp'] || fbKeys['KeyW']) dy = -1;
    if (fbKeys['ArrowDown'] || fbKeys['KeyS']) dy = 1;
    if (fbKeys['ArrowLeft'] || fbKeys['KeyA']) dx = -1;
    if (fbKeys['ArrowRight'] || fbKeys['KeyD']) dx = 1;

    // Joystick mobilny
    if (fbJoystick && fbJoystick.active) {
        dx = fbJoystick.dx;
        dy = fbJoystick.dy;
    }

    var len = Math.sqrt(dx * dx + dy * dy);
    if (len > 0) {
        dx /= len; dy /= len;
        fbMyPlayer.x += dx * fbMyPlayer.speed * 60 * dt;
        fbMyPlayer.y += dy * fbMyPlayer.speed * 60 * dt;
    }

    // Ograniczenia boiska
    fbClampToField(fbMyPlayer);
}

function fbClampToField(p) {
    p.x = Math.max(15, Math.min(FOOTBALL_FIELD_W - 15, p.x));
    p.y = Math.max(15, Math.min(FOOTBALL_FIELD_H - 15, p.y));
}

// ---- AI DRUŻYNY ----
function fbUpdateTeamAI(team, teamSide, dt) {
    var goalX = teamSide === 'player' ? FOOTBALL_FIELD_W - GOAL_WIDTH : GOAL_WIDTH;
    var goalY = FOOTBALL_FIELD_H / 2;
    var ownGoalX = teamSide === 'player' ? GOAL_WIDTH : FOOTBALL_FIELD_W - GOAL_WIDTH;

    for (var i = 0; i < team.length; i++) {
        var p = team[i];
        if (p.isPlayer || p.isDead) continue;

        var targetX, targetY;
        var iAmHolder = fbBall && fbBall.holder && fbBall.holder.team === teamSide && fbBall.holder.idx === i;

        if (p.isGoalkeeper) {
            // Bramkarz stoi przy własnej bramce
            targetX = ownGoalX + (teamSide === 'player' ? 30 : -30);
            targetY = fbBall ? Math.max(goalY - 80, Math.min(goalY + 80, fbBall.y)) : goalY;
        } else if (iAmHolder) {
            // Mam piłkę - idę do bramki przeciwnika
            targetX = goalX;
            targetY = goalY;
        } else if (fbBall && fbBall.holder && fbBall.holder.team !== teamSide) {
            // Przeciwnik ma piłkę - bronię
            targetX = ownGoalX + (teamSide === 'player' ? 120 : -120);
            targetY = fbBall.y;
        } else if (fbBall && fbBall.holder && fbBall.holder.team === teamSide) {
            // Mój team ma piłkę - biegnę do przodu
            targetX = goalX - (teamSide === 'player' ? 200 : -200);
            targetY = p.y + Math.sin(performance.now() / 1000 + i) * 50;
        } else {
            // Piłka wolna - gonię ją
            targetX = fbBall ? fbBall.x : FOOTBALL_FIELD_W / 2;
            targetY = fbBall ? fbBall.y : FOOTBALL_FIELD_H / 2;
        }

        var dx = targetX - p.x;
        var dy = targetY - p.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 5) {
            p.x += (dx / dist) * p.speed * 60 * dt;
            p.y += (dy / dist) * p.speed * 60 * dt;
        }
        fbClampToField(p);

        // AI strzał gdy trzyma piłkę i blisko bramki
        if (iAmHolder && fbBall) {
            var distToGoal = Math.sqrt((goalX - p.x) ** 2 + (goalY - p.y) ** 2);
            if (distToGoal < 300 && Math.random() < 0.03) {
                fbShootBall(p, goalX, goalY);
            }
        }
    }
}

// ---- FIZYKA PIŁKI ----
function fbUpdateBall(dt) {
    if (!fbBall) return;

    // Podnoszenie piłki
    if (!fbBall.holder) {
        var allPlayers = fbMyTeam.concat(fbEnemyTeam);
        for (var i = 0; i < allPlayers.length; i++) {
            var p = allPlayers[i];
            if (p.isDead) continue;
            var dx = fbBall.x - p.x;
            var dy = fbBall.y - p.y;
            var dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 25) {
                var teamSide = (i < fbMyTeam.length) ? 'player' : 'enemy';
                var idx = (i < fbMyTeam.length) ? i : (i - fbMyTeam.length);
                fbBall.holder = { team: teamSide, idx: idx };
                fbBall.vx = 0;
                fbBall.vy = 0;
                break;
            }
        }
    }

    // Pozycja piłki
    if (fbBall.holder) {
        var holderTeam = fbBall.holder.team === 'player' ? fbMyTeam : fbEnemyTeam;
        var holder = holderTeam[fbBall.holder.idx];
        if (holder && !holder.isDead) {
            fbBall.x = holder.x + 15;
            fbBall.y = holder.y;
        } else {
            fbBall.holder = null;
        }
    } else {
        fbBall.x += fbBall.vx * 60 * dt;
        fbBall.y += fbBall.vy * 60 * dt;
        fbBall.vx *= 0.985;
        fbBall.vy *= 0.985;
        if (Math.abs(fbBall.vx) < 0.1) fbBall.vx = 0;
        if (Math.abs(fbBall.vy) < 0.1) fbBall.vy = 0;

        // Odbicia od ścian
        if (fbBall.y < fbBall.radius) { fbBall.y = fbBall.radius; fbBall.vy *= -0.7; }
        if (fbBall.y > FOOTBALL_FIELD_H - fbBall.radius) { fbBall.y = FOOTBALL_FIELD_H - fbBall.radius; fbBall.vy *= -0.7; }

        // Odbicia od ścian bez bramek
        if (fbBall.x < fbBall.radius) {
            if (fbBall.y < FOOTBALL_FIELD_H / 2 - GOAL_HEIGHT / 2 || fbBall.y > FOOTBALL_FIELD_H / 2 + GOAL_HEIGHT / 2) {
                fbBall.x = fbBall.radius; fbBall.vx *= -0.7;
            }
        }
        if (fbBall.x > FOOTBALL_FIELD_W - fbBall.radius) {
            if (fbBall.y < FOOTBALL_FIELD_H / 2 - GOAL_HEIGHT / 2 || fbBall.y > FOOTBALL_FIELD_H / 2 + GOAL_HEIGHT / 2) {
                fbBall.x = FOOTBALL_FIELD_W - fbBall.radius; fbBall.vx *= -0.7;
            }
        }
    }
}

// ---- STRZAŁ PIŁKI ----
function fbShootBall(shooter, targetX, targetY) {
    if (!fbBall || !fbBall.holder) return;

    var holderTeam = fbBall.holder.team === 'player' ? fbMyTeam : fbEnemyTeam;
    var holder = holderTeam[fbBall.holder.idx];
    if (!holder || holder !== shooter) return;

    var angle = Math.atan2(targetY - shooter.y, targetX - shooter.x);
    var power = shooter.shot * 3;
    fbBall.holder = null;
    fbBall.vx = Math.cos(angle) * power;
    fbBall.vy = Math.sin(angle) * power + (Math.random() - 0.5) * 2;
}

// Gracz strzela (spacja / przycisk)
function fbPlayerShoot() {
    if (!fbMyPlayer || !fbBall || !fbBall.holder) return;
    if (fbBall.holder.team !== 'player' || fbBall.holder.idx !== 0) return;
    if (fbMyPlayer.isDead) return;

    // Strzał w stronę bramki przeciwnika
    var targetX = FOOTBALL_FIELD_W - GOAL_WIDTH;
    var targetY = FOOTBALL_FIELD_H / 2 + (Math.random() - 0.5) * GOAL_HEIGHT * 0.6;
    fbShootBall(fbMyPlayer, targetX, targetY);
}

// ---- SPRAWDZANIE GOLI ----
function fbCheckGoals() {
    if (!fbBall) return;

    var goalTop = FOOTBALL_FIELD_H / 2 - GOAL_HEIGHT / 2;
    var goalBottom = FOOTBALL_FIELD_H / 2 + GOAL_HEIGHT / 2;

    // GOL dla przeciwnika (lewa bramka)
    if (fbBall.x < GOAL_WIDTH && fbBall.y > goalTop && fbBall.y < goalBottom) {
        fbScore.enemy++;
        fbResetBall();
        fbShowGoalMessage('😞 GOL przeciwnika!');
    }

    // GOL dla gracza (prawa bramka)
    if (fbBall.x > FOOTBALL_FIELD_W - GOAL_WIDTH && fbBall.y > goalTop && fbBall.y < goalBottom) {
        fbScore.player++;
        fbResetBall();
        fbShowGoalMessage('⚽ GOL! Świetnie!');
    }
}

function fbResetBall() {
    fbBall.x = FOOTBALL_FIELD_W / 2;
    fbBall.y = FOOTBALL_FIELD_H / 2;
    fbBall.vx = 0;
    fbBall.vy = 0;
    fbBall.holder = null;

    // Resetuj pozycje graczy
    var myPositions = [
        { x: 60, y: FOOTBALL_FIELD_H / 2 },
        { x: 150, y: 150 }, { x: 150, y: FOOTBALL_FIELD_H / 2 },
        { x: 150, y: FOOTBALL_FIELD_H - 150 }, { x: 300, y: FOOTBALL_FIELD_H / 2 }
    ];
    for (var i = 0; i < fbMyTeam.length && i < myPositions.length; i++) {
        fbMyTeam[i].x = myPositions[i].x;
        fbMyTeam[i].y = myPositions[i].y;
    }
    var enemyPositions = [
        { x: FOOTBALL_FIELD_W - 60, y: FOOTBALL_FIELD_H / 2 },
        { x: FOOTBALL_FIELD_W - 150, y: 150 }, { x: FOOTBALL_FIELD_W - 150, y: FOOTBALL_FIELD_H / 2 },
        { x: FOOTBALL_FIELD_W - 150, y: FOOTBALL_FIELD_H - 150 }, { x: FOOTBALL_FIELD_W - 300, y: FOOTBALL_FIELD_H / 2 }
    ];
    for (var i = 0; i < fbEnemyTeam.length && i < enemyPositions.length; i++) {
        fbEnemyTeam[i].x = enemyPositions[i].x;
        fbEnemyTeam[i].y = enemyPositions[i].y;
    }
}

var fbGoalMsgTimer = 0;
var fbGoalMsg = '';
function fbShowGoalMessage(msg) {
    fbGoalMsg = msg;
    fbGoalMsgTimer = 120;
}

// ---- RESPAWN ----
function fbCheckRespawns(dt) {
    // W tej grze nie ma śmierci - gracze nie giną
    // Może w przyszłości dodamy faule
}

// ---- RYSOWANIE MECZU ----
function fbDrawMatch() {
    if (!fbCtx) return;
    var W = fbCanvas.width;
    var H = fbCanvas.height;

    // Skalowanie boiska żeby zmieścić się na ekranie
    var scaleX = W / FOOTBALL_FIELD_W;
    var scaleY = H / FOOTBALL_FIELD_H;
    var scale = Math.min(scaleX, scaleY);
    var offsetX = (W - FOOTBALL_FIELD_W * scale) / 2;
    var offsetY = (H - FOOTBALL_FIELD_H * scale) / 2;

    fbCtx.save();
    fbCtx.translate(offsetX, offsetY);
    fbCtx.scale(scale, scale);

    // Tło
    fbCtx.fillStyle = '#1a1a2e';
    fbCtx.fillRect(0, 0, FOOTBALL_FIELD_W, FOOTBALL_FIELD_H);

    // Boisko
    fbCtx.fillStyle = FIELD_COLOR;
    fbCtx.fillRect(0, 0, FOOTBALL_FIELD_W, FOOTBALL_FIELD_H);

    // Linie boiska
    fbCtx.strokeStyle = FIELD_LINES;
    fbCtx.lineWidth = 2;

    // Ramka
    fbCtx.strokeRect(5, 5, FOOTBALL_FIELD_W - 10, FOOTBALL_FIELD_H - 10);

    // Linia środkowa
    fbCtx.beginPath();
    fbCtx.moveTo(FOOTBALL_FIELD_W / 2, 5);
    fbCtx.lineTo(FOOTBALL_FIELD_W / 2, FOOTBALL_FIELD_H - 5);
    fbCtx.stroke();

    // Koło środkowe
    fbCtx.beginPath();
    fbCtx.arc(FOOTBALL_FIELD_W / 2, FOOTBALL_FIELD_H / 2, 60, 0, Math.PI * 2);
    fbCtx.stroke();

    // Pole karne lewe
    fbCtx.strokeRect(5, FOOTBALL_FIELD_H / 2 - 100, 120, 200);
    // Pole karne prawe
    fbCtx.strokeRect(FOOTBALL_FIELD_W - 125, FOOTBALL_FIELD_H / 2 - 100, 120, 200);

    // Bramki
    var goalTop = FOOTBALL_FIELD_H / 2 - GOAL_HEIGHT / 2;
    fbCtx.fillStyle = 'rgba(255,255,255,0.3)';
    // Lewa bramka
    fbCtx.fillRect(0, goalTop, GOAL_WIDTH, GOAL_HEIGHT);
    fbCtx.strokeStyle = '#fff';
    fbCtx.lineWidth = 3;
    fbCtx.strokeRect(0, goalTop, GOAL_WIDTH, GOAL_HEIGHT);
    // Prawa bramka
    fbCtx.fillRect(FOOTBALL_FIELD_W - GOAL_WIDTH, goalTop, GOAL_WIDTH, GOAL_HEIGHT);
    fbCtx.strokeRect(FOOTBALL_FIELD_W - GOAL_WIDTH, goalTop, GOAL_WIDTH, GOAL_HEIGHT);

    // Rysuj piłkarzy
    var allPlayers = fbMyTeam.concat(fbEnemyTeam);
    for (var i = 0; i < allPlayers.length; i++) {
        var p = allPlayers[i];
        if (p.isDead) continue;
        var isMy = p.isPlayer;

        // Cień
        fbCtx.fillStyle = 'rgba(0,0,0,0.3)';
        fbCtx.beginPath();
        fbCtx.arc(p.x + 2, p.y + 2, 14, 0, Math.PI * 2);
        fbCtx.fill();

        // Ciało
        fbCtx.fillStyle = i < fbMyTeam.length ? TEAM_PLAYER_COLOR : TEAM_ENEMY_COLOR;
        fbCtx.beginPath();
        fbCtx.arc(p.x, p.y, 14, 0, Math.PI * 2);
        fbCtx.fill();

        // Obramowanie gracza
        if (isMy) {
            fbCtx.strokeStyle = '#ffd700';
            fbCtx.lineWidth = 3;
            fbCtx.beginPath();
            fbCtx.arc(p.x, p.y, 16, 0, Math.PI * 2);
            fbCtx.stroke();
        }

        // Ikona
        fbCtx.font = '14px Arial';
        fbCtx.textAlign = 'center';
        fbCtx.textBaseline = 'middle';
        fbCtx.fillText(p.icon, p.x, p.y);

        // Imię
        fbCtx.font = 'bold 9px Arial';
        fbCtx.fillStyle = '#fff';
        fbCtx.fillText(p.name, p.x, p.y - 20);
    }

    // Rysuj piłkę
    if (fbBall) {
        fbCtx.fillStyle = BALL_COLOR;
        fbCtx.beginPath();
        fbCtx.arc(fbBall.x, fbBall.y, fbBall.radius, 0, Math.PI * 2);
        fbCtx.fill();
        fbCtx.strokeStyle = '#333';
        fbCtx.lineWidth = 1;
        fbCtx.stroke();

        // Wzór piłki
        fbCtx.fillStyle = '#333';
        fbCtx.beginPath();
        fbCtx.arc(fbBall.x - 3, fbBall.y - 3, 3, 0, Math.PI * 2);
        fbCtx.fill();
    }

    fbCtx.restore();

    // HUD - Wynik i czas (poza skalowaniem)
    fbCtx.fillStyle = 'rgba(0,0,0,0.7)';
    fbCtx.fillRect(W / 2 - 120, 5, 240, 45);

    fbCtx.font = 'bold 24px Arial';
    fbCtx.textAlign = 'center';
    fbCtx.textBaseline = 'middle';
    fbCtx.fillStyle = '#4caf50';
    fbCtx.fillText(fbScore.player, W / 2 - 50, 28);
    fbCtx.fillStyle = '#fff';
    fbCtx.fillText(':', W / 2, 28);
    fbCtx.fillStyle = '#f44336';
    fbCtx.fillText(fbScore.enemy, W / 2 + 50, 28);

    // Czas
    var mins = Math.floor(fbMatchTime / 60);
    var secs = Math.floor(fbMatchTime % 60);
    fbCtx.font = 'bold 14px Arial';
    fbCtx.fillStyle = '#ffd700';
    fbCtx.fillText(mins + ':' + (secs < 10 ? '0' : '') + secs, W / 2, 48);

    // Wiadomość o golu
    if (fbGoalMsgTimer > 0) {
        fbGoalMsgTimer--;
        fbCtx.fillStyle = 'rgba(0,0,0,0.6)';
        fbCtx.fillRect(0, H / 2 - 40, W, 80);
        fbCtx.font = 'bold 32px Arial';
        fbCtx.fillStyle = '#ffd700';
        fbCtx.textAlign = 'center';
        fbCtx.fillText(fbGoalMsg, W / 2, H / 2);
    }

    // Podpowiedź sterowania
    fbCtx.font = '12px Arial';
    fbCtx.fillStyle = 'rgba(255,255,255,0.5)';
    fbCtx.textAlign = 'center';
    fbCtx.fillText('WASD/strzałki = ruch | SPACJA = strzał | ESC = koniec', W / 2, H - 15);
}

// ---- KONIEC MECZU ----
function fbEndMatch() {
    fbMatchRunning = false;
    fbCleanupControls();

    var result, coins;
    if (fbScore.player > fbScore.enemy) {
        result = 'win';
        coins = MATCH_REWARDS.win.min + Math.floor(Math.random() * (MATCH_REWARDS.win.max - MATCH_REWARDS.win.min));
    } else if (fbScore.player === fbScore.enemy) {
        result = 'draw';
        coins = MATCH_REWARDS.draw;
    } else {
        result = 'loss';
        coins = MATCH_REWARDS.loss;
    }

    fbMatchCoins = coins;
    fbSave.coins += coins;
    fbSave.matchesPlayed++;
    if (result === 'win') fbSave.matchesWon++;
    fbSaveData();

    // Pokaż ekran wyników
    fbShowResultScreen(result, coins);
}

// ---- WYNIKI MECZU ----
function fbShowResultScreen(result, coins) {
    var msg, color, emoji;
    if (result === 'win') { msg = 'WYGRANA!'; color = '#4caf50'; emoji = '🏆'; }
    else if (result === 'draw') { msg = 'REMIS'; color = '#ff9800'; emoji = '🤝'; }
    else { msg = 'PRZEGRANA'; color = '#f44336'; emoji = '😞'; }

    var container = document.getElementById('footballContainer');
    container.innerHTML = `
        <div style="width:100%;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:linear-gradient(180deg,#1a1a2e,#16213e);">
            <div style="font-size:80px;margin-bottom:20px;">${emoji}</div>
            <h1 style="color:${color};font-size:48px;margin-bottom:10px;font-family:Arial;">${msg}</h1>
            <div style="color:#fff;font-size:28px;margin-bottom:5px;">${fbScore.player} : ${fbScore.enemy}</div>
            <div style="color:#ffd700;font-size:24px;margin-bottom:30px;">💰 +${coins} monet</div>
            <div style="color:rgba(255,255,255,0.5);font-size:14px;margin-bottom:30px;">Łącznie monet: ${fbSave.coins}</div>
            <button onclick="fbShowLobby()" style="padding:16px 48px;background:linear-gradient(180deg,#4caf50,#2e7d32);color:#fff;font-size:20px;font-weight:800;border:none;border-radius:50px;cursor:pointer;margin:10px;">🏠 LOBBY</button>
            <button onclick="fbStartMatch()" style="padding:16px 48px;background:linear-gradient(180deg,#2196f3,#1565c0);color:#fff;font-size:20px;font-weight:800;border:none;border-radius:50px;cursor:pointer;margin:10px;">▶ ZAGRAJ PONOWNIE</button>
        </div>
    `;
}

// ---- STEROWANIE ----
function fbSetupControls() {
    fbKeyHandler = function(e) {
        fbKeys[e.code] = (e.type === 'keydown');
        if (e.code === 'Space' && e.type === 'keydown') {
            e.preventDefault();
            fbPlayerShoot();
        }
        if (e.code === 'Escape') {
            fbMatchRunning = false;
            fbShowLobby();
        }
    };
    window.addEventListener('keydown', fbKeyHandler);
    window.addEventListener('keyup', fbKeyHandler);

    // Mobilny joystick i przycisk strzału
    fbSetupMobileControls();
}

function fbCleanupControls() {
    if (fbKeyHandler) {
        window.removeEventListener('keydown', fbKeyHandler);
        window.removeEventListener('keyup', fbKeyHandler);
    }
    fbCleanupMobileControls();
}

// ---- MOBILNE STEROWANIE ----
var fbMobileFireBtn = null;
var fbMobileJoystickArea = null;
var fbMobileJoystickKnob = null;

function fbSetupMobileControls() {
    var isMobile = window.matchMedia('(pointer: coarse)').matches;
    if (!isMobile) return;

    var container = document.getElementById('footballContainer');

    // Joystick
    var joystickArea = document.createElement('div');
    joystickArea.id = 'fbJoystickArea';
    joystickArea.style.cssText = 'position:fixed;bottom:20px;left:20px;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,0.15);border:2px solid rgba(255,255,255,0.3);z-index:100;touch-action:none;';
    var knob = document.createElement('div');
    knob.id = 'fbJoystickKnob';
    knob.style.cssText = 'position:absolute;top:50%;left:50%;width:50px;height:50px;border-radius:50%;background:rgba(255,255,255,0.5);transform:translate(-50%,-50%);pointer-events:none;';
    joystickArea.appendChild(knob);
    container.appendChild(joystickArea);
    fbMobileJoystickArea = joystickArea;
    fbMobileJoystickKnob = knob;

    fbJoystick = { active: false, dx: 0, dy: 0 };

    var joyCenter = { x: 60, y: 60 };
    joystickArea.addEventListener('touchstart', function(e) {
        e.preventDefault();
        fbJoystick.active = true;
        fbHandleJoystickMove(e);
    });
    joystickArea.addEventListener('touchmove', function(e) {
        e.preventDefault();
        fbHandleJoystickMove(e);
    });
    joystickArea.addEventListener('touchend', function() {
        fbJoystick.active = false;
        fbJoystick.dx = 0;
        fbJoystick.dy = 0;
        knob.style.transform = 'translate(-50%,-50%)';
    });

    // Przycisk strzału
    var fireBtn = document.createElement('button');
    fireBtn.id = 'fbFireBtn';
    fireBtn.style.cssText = 'position:fixed;bottom:30px;right:30px;width:70px;height:70px;border-radius:50%;border:3px solid #ffd700;background:rgba(255,215,0,0.3);color:#fff;font-size:24px;font-weight:800;cursor:pointer;z-index:100;';
    fireBtn.textContent = '⚽';
    fireBtn.addEventListener('touchstart', function(e) {
        e.preventDefault();
        fbPlayerShoot();
    });
    container.appendChild(fireBtn);
    fbMobileFireBtn = fireBtn;
}

function fbHandleJoystickMove(e) {
    var touch = e.touches[0];
    var rect = fbMobileJoystickArea.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    var dx = touch.clientX - cx;
    var dy = touch.clientY - cy;
    var dist = Math.sqrt(dx * dx + dy * dy);
    var maxDist = 40;
    if (dist > maxDist) { dx = (dx / dist) * maxDist; dy = (dy / dist) * maxDist; dist = maxDist; }
    fbJoystick.dx = dx / maxDist;
    fbJoystick.dy = dy / maxDist;
    fbMobileJoystickKnob.style.transform = 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px))';
}

function fbCleanupMobileControls() {
    if (fbMobileFireBtn) { fbMobileFireBtn.remove(); fbMobileFireBtn = null; }
    if (fbMobileJoystickArea) { fbMobileJoystickArea.remove(); fbMobileJoystickArea = null; }
    fbMobileJoystickKnob = null;
    fbJoystick = null;
}

// ---- POMOCNIK: SKŁAD DRUŻYNY ----
function fbGetTeamRoster() {
    var roster = [];
    for (var i = 0; i < FOOTBALL_PLAYERS.length; i++) {
        if (fbSave.ownedPlayers.indexOf(FOOTBALL_PLAYERS[i].id) >= 0) {
            roster.push(FOOTBALL_PLAYERS[i]);
        }
    }
    return roster;
}
