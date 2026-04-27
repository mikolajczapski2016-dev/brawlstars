// ============================================================
// ZOMBIE STORY - LOBBY 3D (Three.js)
// Scena z postacią w lobby która się obraca i animuje
// ============================================================

var lobbyScene3d, lobbyCamera3d, lobbyRenderer3d, lobbyContainer;
var lobbyCharMesh = null;
var lobbyAnimFrame = null;

function initLobby3D() {
    lobbyContainer = document.getElementById('lobby3d');
    if (!lobbyContainer || typeof THREE === 'undefined') return;

    // Scene — ciemne tło z mgłą
    lobbyScene3d = new THREE.Scene();
    lobbyScene3d.background = new THREE.Color(0x0d1117);
    lobbyScene3d.fog = new THREE.Fog(0x0d1117, 200, 600);

    // Kamera
    var aspect = lobbyContainer.clientWidth / lobbyContainer.clientHeight;
    lobbyCamera3d = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    lobbyCamera3d.position.set(0, 60, 120);
    lobbyCamera3d.lookAt(0, 25, 0);

    // Renderer
    lobbyRenderer3d = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    lobbyRenderer3d.setSize(lobbyContainer.clientWidth, lobbyContainer.clientHeight);
    lobbyRenderer3d.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    lobbyRenderer3d.shadowMap.enabled = true;
    lobbyContainer.appendChild(lobbyRenderer3d.domElement);

    // Światła
    var ambient = new THREE.AmbientLight(0xffffff, 0.4);
    lobbyScene3d.add(ambient);

    var keyLight = new THREE.DirectionalLight(0xffffff, 0.8);
    keyLight.position.set(50, 100, 50);
    keyLight.castShadow = true;
    lobbyScene3d.add(keyLight);

    var fillLight = new THREE.PointLight(0x7c4dff, 0.5, 200);
    fillLight.position.set(-40, 40, -40);
    lobbyScene3d.add(fillLight);

    var rimLight = new THREE.PointLight(0xffd700, 0.4, 200);
    rimLight.position.set(40, 30, -60);
    lobbyScene3d.add(rimLight);

    // Podłoga — okrągła platforma
    var floorGeo = new THREE.CylinderGeometry(80, 80, 2, 32);
    var floorMat = new THREE.MeshStandardMaterial({ color: 0x1a1f2e, roughness: 0.8, metalness: 0.2 });
    var floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -1;
    floor.receiveShadow = true;
    lobbyScene3d.add(floor);

    // Gwiazdy w tle (małe sfery)
    var starGeo = new THREE.SphereGeometry(0.5, 4, 4);
    var starMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for (var i = 0; i < 80; i++) {
        var star = new THREE.Mesh(starGeo, starMat);
        var r = 150 + Math.random() * 300;
        var theta = Math.random() * Math.PI * 2;
        var phi = Math.random() * Math.PI;
        star.position.set(
            r * Math.sin(phi) * Math.cos(theta),
            r * Math.cos(phi) + 50,
            r * Math.sin(phi) * Math.sin(theta)
        );
        lobbyScene3d.add(star);
    }

    // Zamek w tle — imponujący, za postacią
    createLobbyCastle();

    // Postać
    updateLobbyCharacter3D();

    // Resize handler
    window.addEventListener('resize', onLobby3DResize);

    // Start animacji
    animateLobby3D();
}

function disposeLobby3D() {
    if (lobbyAnimFrame) {
        cancelAnimationFrame(lobbyAnimFrame);
        lobbyAnimFrame = null;
    }
    if (lobbyRenderer3d) {
        lobbyRenderer3d.dispose();
        if (lobbyRenderer3d.domElement && lobbyRenderer3d.domElement.parentNode) {
            lobbyRenderer3d.domElement.parentNode.removeChild(lobbyRenderer3d.domElement);
        }
        lobbyRenderer3d = null;
    }
    lobbyScene3d = null;
    lobbyCamera3d = null;
    lobbyCharMesh = null;
    window.removeEventListener('resize', onLobby3DResize);
}

function onLobby3DResize() {
    if (!lobbyRenderer3d || !lobbyCamera3d || !lobbyContainer) return;
    var w = lobbyContainer.clientWidth;
    var h = lobbyContainer.clientHeight;
    lobbyCamera3d.aspect = w / h;
    lobbyCamera3d.updateProjectionMatrix();
    lobbyRenderer3d.setSize(w, h);
}

function updateLobbyCharacter3D() {
    if (!lobbyScene3d) return;
    if (lobbyCharMesh) {
        lobbyScene3d.remove(lobbyCharMesh);
        lobbyCharMesh = null;
    }
    var charName = selectedCharacter || 'Zombie';
    lobbyCharMesh = createCharacterMesh(charName, currentSkin || 'default');
    lobbyCharMesh.position.set(0, 0, 0);
    lobbyScene3d.add(lobbyCharMesh);
}

function bounceLobbyChar3D() {
    if (!lobbyCharMesh) return;
    // Animacja skoku — ustawiamy flagę w userData
    lobbyCharMesh.userData.bounceTime = Date.now();
}

function animateLobby3D() {
    if (!lobbyRenderer3d || !lobbyScene3d || !lobbyCamera3d) return;
    lobbyAnimFrame = requestAnimationFrame(animateLobby3D);

    var time = Date.now() / 1000;

    if (lobbyCharMesh) {
        // Obrót postaci
        lobbyCharMesh.rotation.y = Math.sin(time * 0.5) * 0.4;

        // Podskakiwanie (bounce)
        var bounceY = Math.abs(Math.sin(time * 2)) * 8;
        // Dodatkowy skok po kliknięciu
        if (lobbyCharMesh.userData.bounceTime) {
            var elapsed = (Date.now() - lobbyCharMesh.userData.bounceTime) / 1000;
            if (elapsed < 0.6) {
                bounceY += Math.sin(elapsed * Math.PI / 0.6) * 30;
            } else {
                lobbyCharMesh.userData.bounceTime = null;
            }
        }
        lobbyCharMesh.position.y = bounceY;
    }

    // Subtelny ruch kamery
    lobbyCamera3d.position.x = Math.sin(time * 0.3) * 10;
    lobbyCamera3d.lookAt(0, 25 + Math.sin(time * 0.5) * 3, 0);

    lobbyRenderer3d.render(lobbyScene3d, lobbyCamera3d);
}

function createLobbyCastle() {
    if (!lobbyScene3d) return;
    var castleGroup = new THREE.Group();

    var wallMat = new THREE.MeshStandardMaterial({ color: 0x4e342e, roughness: 0.9 });
    var darkWallMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.95 });
    var roofMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.8 });
    var torchMat = new THREE.MeshStandardMaterial({ color: 0xffab00, emissive: 0xff5722, emissiveIntensity: 1 });

    // Główny mur — podkowa
    var mainWall = new THREE.Mesh(new THREE.BoxGeometry(140, 50, 20), wallMat);
    mainWall.position.set(0, 25, -120);
    mainWall.castShadow = true;
    castleGroup.add(mainWall);

    // Lewe skrzydło muru
    var leftWall = new THREE.Mesh(new THREE.BoxGeometry(20, 40, 80), wallMat);
    leftWall.position.set(-70, 20, -80);
    leftWall.castShadow = true;
    castleGroup.add(leftWall);

    // Prawe skrzydło muru
    var rightWall = new THREE.Mesh(new THREE.BoxGeometry(20, 40, 80), wallMat);
    rightWall.position.set(70, 20, -80);
    rightWall.castShadow = true;
    castleGroup.add(rightWall);

    // Wieża lewa
    var towerL = new THREE.Mesh(new THREE.CylinderGeometry(18, 20, 80, 12), darkWallMat);
    towerL.position.set(-70, 40, -120);
    towerL.castShadow = true;
    castleGroup.add(towerL);
    // Dach wieży lewej
    var roofL = new THREE.Mesh(new THREE.ConeGeometry(22, 25, 12), roofMat);
    roofL.position.set(-70, 92, -120);
    castleGroup.add(roofL);

    // Wieża prawa
    var towerR = new THREE.Mesh(new THREE.CylinderGeometry(18, 20, 80, 12), darkWallMat);
    towerR.position.set(70, 40, -120);
    towerR.castShadow = true;
    castleGroup.add(towerR);
    // Dach wieży prawej
    var roofR = new THREE.Mesh(new THREE.ConeGeometry(22, 25, 12), roofMat);
    roofR.position.set(70, 92, -120);
    castleGroup.add(roofR);

    // Centralna wieża — wyższa
    var towerC = new THREE.Mesh(new THREE.CylinderGeometry(22, 24, 110, 12), darkWallMat);
    towerC.position.set(0, 55, -120);
    towerC.castShadow = true;
    castleGroup.add(towerC);
    // Dach centralnej
    var roofC = new THREE.Mesh(new THREE.ConeGeometry(26, 35, 12), roofMat);
    roofC.position.set(0, 127, -120);
    castleGroup.add(roofC);
    // Flaga na centralnej wieży
    var flagPole = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 20, 6), new THREE.MeshStandardMaterial({ color: 0x888888 }));
    flagPole.position.set(0, 145, -120);
    castleGroup.add(flagPole);
    var flag = new THREE.Mesh(new THREE.BoxGeometry(12, 8, 1), new THREE.MeshStandardMaterial({ color: 0x880e4f }));
    flag.position.set(7, 150, -120);
    castleGroup.add(flag);

    // Bramy
    var gateFrame = new THREE.Mesh(new THREE.BoxGeometry(40, 35, 8), darkWallMat);
    gateFrame.position.set(0, 17, -110);
    castleGroup.add(gateFrame);
    // Drzwi
    var gateDoor = new THREE.Mesh(new THREE.BoxGeometry(30, 28, 4), new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.9 }));
    gateDoor.position.set(0, 14, -106);
    castleGroup.add(gateDoor);
    // Kłódka
    var lock = new THREE.Mesh(new THREE.TorusGeometry(3, 1, 6, 12), new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.2 }));
    lock.position.set(0, 20, -104);
    castleGroup.add(lock);

    // Okna w wieżach (świecące)
    var windowMat = new THREE.MeshStandardMaterial({ color: 0xffeb3b, emissive: 0xffab00, emissiveIntensity: 0.8 });
    for (var wi = 0; wi < 3; wi++) {
        var win = new THREE.Mesh(new THREE.BoxGeometry(6, 10, 2), windowMat);
        win.position.set(-70, 30 + wi * 20, -102);
        castleGroup.add(win);
    }
    for (var wi = 0; wi < 3; wi++) {
        var win = new THREE.Mesh(new THREE.BoxGeometry(6, 10, 2), windowMat);
        win.position.set(70, 30 + wi * 20, -102);
        castleGroup.add(win);
    }

    // Pochodnie na wieżach
    var torchGeo = new THREE.CylinderGeometry(1.5, 2, 6, 6);
    for (var ti = 0; ti < 4; ti++) {
        var tx = ti < 2 ? -70 : 70;
        var tz = ti % 2 === 0 ? -110 : -130;
        var torch = new THREE.Mesh(torchGeo, torchMat);
        torch.position.set(tx, 85, tz);
        castleGroup.add(torch);
        var torchLight = new THREE.PointLight(0xff5722, 1, 60);
        torchLight.position.set(tx, 90, tz);
        castleGroup.add(torchLight);
    }

    // Mroczna poświata wokół zamku
    var castleGlow = new THREE.PointLight(0x7b1fa2, 0.5, 150);
    castleGlow.position.set(0, 50, -120);
    castleGroup.add(castleGlow);

    castleGroup.position.z = -20; // przesunięcie za postacią
    lobbyScene3d.add(castleGroup);
}
