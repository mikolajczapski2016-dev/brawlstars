// ============================================================
// ZOMBIE STORY - ARENA 3D (Three.js)
// Rendering całej walki w 3D z widokiem z góry-perspektywą
// ============================================================

var scene3d, camera3d, renderer3d, gameContainer;
var playerMesh, enemyMeshes = [], allyMeshes = [];
var arenaObjects = []; // ściany, krzewy, zamek
var projectileMeshes = [];
var particleSystem;
var clock3d = new THREE.Clock();
var use3D = true;
var arena3dNeedsRebuild = true;

// Raycaster dla myszki w 3D
var raycaster3d = new THREE.Raycaster();
var mouseNDC3d = new THREE.Vector2();
var mouseWorld3D = { x: 0, z: 0 };

// Materiały wspólne (reuse)
var materials = {};
var geometries = {};

// ============================================================
// INICJALIZACJA / DISPOSE
// ============================================================

function initArena3D() {
    if (!use3D) return;
    if (renderer3d) { disposeArena3D(); }

    gameContainer = document.getElementById('game3dContainer');
    if (!gameContainer) return;
    gameContainer.innerHTML = '';

    // Scene
    scene3d = new THREE.Scene();
    scene3d.background = new THREE.Color(0x87CEEB);
    scene3d.fog = new THREE.Fog(0x87CEEB, 300, 1800);

    // Wymiary — fallback na window gdy container ma 0 (przejście z display:none)
    var cw = gameContainer.clientWidth || window.innerWidth;
    var ch = gameContainer.clientHeight || window.innerHeight;

    // Kamera: perspektywiczna z góry i z tyłu gracza
    var aspect = cw / ch;
    camera3d = new THREE.PerspectiveCamera(55, aspect, 0.1, 3000);

    // Renderer
    renderer3d = new THREE.WebGLRenderer({ antialias: true });
    renderer3d.setSize(cw, ch);
    renderer3d.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer3d.shadowMap.enabled = true;
    renderer3d.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer3d.domElement.style.pointerEvents = 'none';
    gameContainer.appendChild(renderer3d.domElement);

    // Światła
    var ambient = new THREE.AmbientLight(0xffffff, 0.45);
    scene3d.add(ambient);

    var sun = new THREE.DirectionalLight(0xffffff, 0.9);
    sun.position.set(300, 500, 300);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 10;
    sun.shadow.camera.far = 1600;
    sun.shadow.camera.left = -700;
    sun.shadow.camera.right = 700;
    sun.shadow.camera.top = 700;
    sun.shadow.camera.bottom = -700;
    scene3d.add(sun);

    // Podłoga areny
    createArenaFloor();

    // Resize handler
    window.addEventListener('resize', onArena3DResize);

    // Flaga — przy pierwszym renderze odbudujemy obiekty i wrogów
    arena3dNeedsRebuild = true;
}

function disposeArena3D() {
    if (renderer3d) {
        renderer3d.dispose();
        if (renderer3d.domElement && renderer3d.domElement.parentNode) {
            renderer3d.domElement.parentNode.removeChild(renderer3d.domElement);
        }
        renderer3d = null;
    }
    scene3d = null;
    camera3d = null;
    playerMesh = null;
    enemyMeshes = [];
    allyMeshes = [];
    arenaObjects = [];
    projectileMeshes = [];
    ballMesh = null;
    bossMesh = null;
    blackHoleMesh = null;
    lavaZoneMesh = null;
    materials = {};
    geometries = {};
    window.removeEventListener('resize', onArena3DResize);
}

function onArena3DResize() {
    if (!renderer3d || !camera3d || !gameContainer) return;
    var w = gameContainer.clientWidth || window.innerWidth;
    var h = gameContainer.clientHeight || window.innerHeight;
    camera3d.aspect = w / h;
    camera3d.updateProjectionMatrix();
    renderer3d.setSize(w, h);
}

// ============================================================
// PODŁOGA I OBIEKTY ARENY
// ============================================================

function createArenaFloor() {
    // Zielona szachownica kratek 50x50
    var gridSize = 50;
    var cols = Math.floor(ARENA_W / gridSize);
    var rows = Math.floor(ARENA_H / gridSize);
    for (var cx = 0; cx < cols; cx++) {
        for (var cz = 0; cz < rows; cz++) {
            var isEven = (cx + cz) % 2 === 0;
            var color = isEven ? 0x4a8c2a : 0x3e7a22;
            var tileGeo = new THREE.PlaneGeometry(gridSize, gridSize);
            var tileMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.9 });
            var tile = new THREE.Mesh(tileGeo, tileMat);
            tile.rotation.x = -Math.PI / 2;
            tile.position.set(cx * gridSize + gridSize / 2, 0, cz * gridSize + gridSize / 2);
            tile.receiveShadow = true;
            tile.userData.isFloorTile = true; // oznacz kafelek podłogi
            scene3d.add(tile);
            arenaObjects.push(tile);
        }
    }

    // Granica areny (płaski box jako linia)
    var borderGeo = new THREE.BoxGeometry(ARENA_W + 4, 2, 4);
    var borderMat = new THREE.MeshStandardMaterial({ color: 0xcccccc });
    var top = new THREE.Mesh(borderGeo, borderMat);
    top.position.set(ARENA_W / 2, 1, -2);
    scene3d.add(top);
    arenaObjects.push(top);

    var bottom = top.clone();
    bottom.position.set(ARENA_W / 2, 1, ARENA_H + 2);
    scene3d.add(bottom);
    arenaObjects.push(bottom);

    var sideGeo = new THREE.BoxGeometry(4, 2, ARENA_H + 4);
    var left = new THREE.Mesh(sideGeo, borderMat);
    left.position.set(-2, 1, ARENA_H / 2);
    scene3d.add(left);
    arenaObjects.push(left);

    var right = left.clone();
    right.position.set(ARENA_W + 2, 1, ARENA_H / 2);
    scene3d.add(right);
    arenaObjects.push(right);
}

function rebuildArenaObjects3D() {
    if (!scene3d) return;
    // Usuń stare obiekty areny (poza kafelkami podłogi)
    var newArenaObjects = [];
    for (var i = 0; i < arenaObjects.length; i++) {
        var obj = arenaObjects[i];
        if (obj && obj.userData && obj.userData.isFloorTile) {
            newArenaObjects.push(obj); // zostaw kafelek podłogi
        } else {
            scene3d.remove(obj); // usuń resztę
        }
    }
    arenaObjects = newArenaObjects;
    // Odbuduj
    createArenaObjects();
}

function createArenaObjects() {
    // Ściany
    if (walls && walls.length) {
        for (var i = 0; i < walls.length; i++) {
            var w = walls[i];
            if (!w || w.w === undefined || w.h === undefined) continue;
            var geo = new THREE.BoxGeometry(w.w, 40, w.h);
            var mat = new THREE.MeshStandardMaterial({ color: 0x8d6e4a, roughness: 0.8 });
            var mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(w.x + w.w / 2, 20, w.y + w.h / 2);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            scene3d.add(mesh);
            arenaObjects.push(mesh);
        }
    }

    // Krzewy
    if (bushes && bushes.length) {
        for (var bi = 0; bi < bushes.length; bi++) {
            var b = bushes[bi];
            if (!b) continue;
            var group = new THREE.Group();
            // Główna kula
            var bushGeo = new THREE.SphereGeometry(Math.max(b.w, b.h) / 2, 12, 8);
            var bushMat = new THREE.MeshStandardMaterial({ color: 0x2d6b1a, roughness: 0.9 });
            var bush = new THREE.Mesh(bushGeo, bushMat);
            bush.scale.set(1, 0.7, 1);
            bush.position.y = 5;
            group.add(bush);
            // Mniejsza kula w środku
            var inner = new THREE.Mesh(
                new THREE.SphereGeometry(Math.max(b.w, b.h) / 3, 10, 6),
                new THREE.MeshStandardMaterial({ color: 0x3a8a25 })
            );
            inner.scale.set(1, 0.6, 1);
            inner.position.y = 6;
            group.add(inner);

            group.position.set(b.x + b.w / 2, 0, b.y + b.h / 2);
            group.castShadow = true;
            scene3d.add(group);
            arenaObjects.push(group);
        }
    }

    // Zamek (jeśli aktywny)
    if (castle) {
        createCastle3D();
    }

    // Akumulatory (poziom 100)
    if (accumulators && accumulators.length > 0) {
        for (var i = 0; i < accumulators.length; i++) {
            createAccumulator3D(accumulators[i], i);
        }
    }

    // Gniazdo zombie (tryb nest)
    if (gameMode === 'nest' && nestObject) {
        createNest3D();
    }

    // Bramki (football)
    if (gameMode === 'football') {
        createFootballGoals3D();
    }
}

function createCastle3D() {
    var c = castle;
    var group = new THREE.Group();

    // Główny budynek
    var body = new THREE.Mesh(
        new THREE.BoxGeometry(c.w, c.h, 60),
        new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.9 })
    );
    body.position.set(c.w / 2, c.h / 2, 30);
    body.castShadow = true;
    group.add(body);

    // Wieża
    var tower = new THREE.Mesh(
        new THREE.BoxGeometry(c.towerW, c.towerH, 60),
        new THREE.MeshStandardMaterial({ color: 0x4e342e })
    );
    tower.position.set(c.w + c.towerW / 2 - 15, c.towerH / 2, 30);
    tower.castShadow = true;
    group.add(tower);

    // Drzwi
    var doorColor = c.doorOpen ? 0x2e1a0f : 0x8d6e63;
    var door = new THREE.Mesh(
        new THREE.BoxGeometry(50, 60, 5),
        new THREE.MeshStandardMaterial({ color: doorColor })
    );
    door.position.set(c.w / 2, 30, 62);
    door.userData.isCastleDoor = true;
    group.add(door);

    // Kłódka
    var lock = new THREE.Mesh(
        new THREE.TorusGeometry(6, 2, 8, 16),
        new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.2 })
    );
    lock.position.set(c.w / 2, 35, 65);
    lock.userData.isCastleLock = true;
    lock.visible = !c.doorOpen;
    group.add(lock);

    group.position.set(c.x, 0, c.y);
    group.userData.isCastle = true;
    scene3d.add(group);
    arenaObjects.push(group);
}

function updateCastleDoor3D() {
    if (!castle || !scene3d) return;
    for (var i = 0; i < arenaObjects.length; i++) {
        var obj = arenaObjects[i];
        if (obj && obj.userData && obj.userData.isCastle) {
            obj.traverse(function(child) {
                if (child.userData && child.userData.isCastleDoor) {
                    child.material.color.setHex(castle.doorOpen ? 0x2e1a0f : 0x8d6e63);
                }
                if (child.userData && child.userData.isCastleLock) {
                    child.visible = !castle.doorOpen;
                }
            });
        }
    }
}

function createAccumulator3D(acc, index) {
    var group = new THREE.Group();
    // Filar
    var pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(10, 12, 40, 8),
        new THREE.MeshStandardMaterial({ color: 0x37474f })
    );
    pillar.position.y = 20;
    group.add(pillar);

    // Kryształ
    var crystal = new THREE.Mesh(
        new THREE.OctahedronGeometry(16, 0),
        new THREE.MeshStandardMaterial({
            color: acc.active ? 0x4fc3f7 : 0x607d8b,
            emissive: acc.active ? 0x4fc3f7 : 0x000000,
            emissiveIntensity: acc.active ? 0.6 : 0,
            transparent: true,
            opacity: 0.9
        })
    );
    crystal.position.y = 55;
    group.add(crystal);

    // Światło
    if (acc.active) {
        var light = new THREE.PointLight(0x4fc3f7, 1, 120);
        light.position.y = 55;
        group.add(light);
    }

    group.position.set(acc.x, 0, acc.y);
    scene3d.add(group);
    arenaObjects.push(group);
}

function createNest3D() {
    var n = nestObject;
    var group = new THREE.Group();

    var body = new THREE.Mesh(
        new THREE.BoxGeometry(80, 80, 80),
        new THREE.MeshStandardMaterial({ color: 0x4a148c })
    );
    body.position.y = 40;
    group.add(body);

    var inner = new THREE.Mesh(
        new THREE.BoxGeometry(60, 60, 60),
        new THREE.MeshStandardMaterial({ color: 0x7b1fa2 })
    );
    inner.position.y = 40;
    group.add(inner);

    // Oczy gniazda (świecące)
    var eyeGeo = new THREE.SphereGeometry(8, 8, 8);
    var eyeMat = new THREE.MeshStandardMaterial({ color: 0xe040fb, emissive: 0xe040fb, emissiveIntensity: 0.8 });
    var eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-15, 50, 42);
    group.add(eyeL);
    var eyeR = eyeL.clone();
    eyeR.position.set(15, 50, 42);
    group.add(eyeR);

    group.position.set(n.x, 0, n.y);
    scene3d.add(group);
    arenaObjects.push(group);
}

function createFootballGoals3D() {
    var goalTop = ARENA_H / 2 - 80;
    var goalHeight = 160;
    var goalDepth = 60;

    // Lewa bramka (czerwona)
    var leftGroup = new THREE.Group();
    var postGeo = new THREE.CylinderGeometry(3, 3, goalHeight, 8);
    var redMat = new THREE.MeshStandardMaterial({ color: 0xe53935 });
    var post1 = new THREE.Mesh(postGeo, redMat);
    post1.position.set(0, goalHeight / 2, 0);
    leftGroup.add(post1);
    var post2 = post1.clone();
    post2.position.set(0, goalHeight / 2, goalHeight);
    leftGroup.add(post2);
    var crossGeo = new THREE.CylinderGeometry(3, 3, goalHeight, 8);
    var cross = new THREE.Mesh(crossGeo, new THREE.MeshStandardMaterial({ color: 0xffffff }));
    cross.rotation.z = Math.PI / 2;
    cross.position.set(0, goalHeight, goalHeight / 2);
    leftGroup.add(cross);
    leftGroup.position.set(0, 0, goalTop);
    scene3d.add(leftGroup);
    arenaObjects.push(leftGroup);

    // Prawa bramka (niebieska)
    var rightGroup = leftGroup.clone();
    rightGroup.children[0].material = new THREE.MeshStandardMaterial({ color: 0x2196f3 });
    rightGroup.children[1].material = new THREE.MeshStandardMaterial({ color: 0x2196f3 });
    rightGroup.position.set(ARENA_W, 0, goalTop);
    scene3d.add(rightGroup);
    arenaObjects.push(rightGroup);
}

// ============================================================
// MODELE POSTACI (proceduralne z brył)
// ============================================================

function createCharacterMesh(characterName, skinId) {
    var char = characters[characterName] || characters['Zombie'];
    var group = new THREE.Group();
    group.userData = { character: characterName, skin: skinId };

    var color = char.bgColor || '#5d8a66';
    var c = new THREE.Color(color);

    // Factory functions
    var addBox = function(w, h, d, col, x, y, z) {
        var m = new THREE.Mesh(
            new THREE.BoxGeometry(w, h, d),
            new THREE.MeshStandardMaterial({ color: new THREE.Color(col), roughness: 0.7 })
        );
        m.position.set(x, y, z);
        m.castShadow = true;
        group.add(m);
        return m;
    };

    var addSphere = function(r, col, x, y, z) {
        var m = new THREE.Mesh(
            new THREE.SphereGeometry(r, 16, 12),
            new THREE.MeshStandardMaterial({ color: new THREE.Color(col), roughness: 0.6 })
        );
        m.position.set(x, y, z);
        m.castShadow = true;
        group.add(m);
        return m;
    };

    var addCylinder = function(rt, rb, h, col, x, y, z) {
        var m = new THREE.Mesh(
            new THREE.CylinderGeometry(rt, rb, h, 10),
            new THREE.MeshStandardMaterial({ color: new THREE.Color(col), roughness: 0.7 })
        );
        m.position.set(x, y, z);
        m.castShadow = true;
        group.add(m);
        return m;
    };

    // === ZOMBIE / NOOBEK ===
    if (characterName === 'Zombie' || !characterName) {
        var shirtMat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#8d6e63'), roughness: 0.9 });
        var pantsMat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#5d4037'), roughness: 0.8 });
        var skinMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(color), roughness: 0.6 });

        // Nogi (2 segmenty)
        addCylinder(5.5, 6.5, 14, '#5d4037', -7, 7, 0);   // lewe udo
        addCylinder(5.5, 6.5, 14, '#5d4037', 7, 7, 0);     // prawe udo
        addCylinder(4.5, 5.5, 10, '#3e2723', -7, 19, 0);   // lewa łydka
        addCylinder(4.5, 5.5, 10, '#3e2723', 7, 19, 0);     // prawa łydka
        // Buty
        addBox(7, 5, 10, '#1a1a1a', -7, 24.5, 2);
        addBox(7, 5, 10, '#1a1a1a', 7, 24.5, 2);

        // Tułów — koszula z dziurami
        var torso = new THREE.Mesh(new THREE.BoxGeometry(18, 24, 14), shirtMat);
        torso.position.set(0, 26, 0);
        torso.castShadow = true;
        group.add(torso);
        // Dziury w koszuli
        addBox(3, 2, 15, '#2d2d2d', -4, 30, 0);
        addBox(2, 3, 15, '#2d2d2d', 5, 24, 0);
        addBox(4, 2, 15, '#8b0000', 2, 28, 0); // plama krwi

        // Ręce (2 segmenty)
        addCylinder(4, 5, 12, color, -15, 24, 0);   // lewe ramię
        addCylinder(4, 5, 12, color, 15, 24, 0);    // prawe ramię
        addCylinder(3.5, 4, 10, color, -15, 14, 0); // lewe przedramię
        addCylinder(3.5, 4, 10, color, 15, 14, 0);    // prawe przedramię
        // Dłonie
        addSphere(3, color, -15, 8, 0);
        addSphere(3, color, 15, 8, 0);

        // Głowa — mniejsza, bardziej realistyczna
        var head = new THREE.Mesh(new THREE.SphereGeometry(10, 16, 12), skinMat);
        head.position.set(0, 42, 0);
        head.castShadow = true;
        group.add(head);
        // Czoło — wyżej
        addSphere(8, color, 0, 44, 3);

        // Włosy / czupryna zombie
        for (var hi = 0; hi < 6; hi++) {
            var hAngle = (hi / 6) * Math.PI * 2;
            addCylinder(1.5, 0.5, 5 + Math.random() * 4, '#2e1a0f',
                Math.cos(hAngle) * 6, 49, Math.sin(hAngle) * 6);
        }

        // Oczy — głęboko osadzone
        addSphere(3, 0xffffff, -4.5, 42, 8);
        addSphere(3, 0xffffff, 4.5, 42, 8);
        addSphere(1.8, 0xff0000, -4.5, 42, 10);
        addSphere(1.8, 0xff0000, 4.5, 42, 10);

        // Kły
        addCylinder(1.5, 0.5, 5, 0xffffff, -3, 38, 9);
        addCylinder(1.5, 0.5, 5, 0xffffff, 3, 38, 9);

        // Usta — szramy
        addBox(8, 1, 1, '#3e2723', 0, 38, 9);
    }

    // === BLAZER ===
    else if (characterName === 'Blazer') {
        var baconMat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#e85d4a'), roughness: 0.5 });
        var fatMat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#f5c6b8'), roughness: 0.4 });

        // Nogi — krótsze, grubsze
        addCylinder(6, 7, 12, '#8b4513', -7, 6, 0);
        addCylinder(6, 7, 12, '#8b4513', 7, 6, 0);
        addBox(8, 4, 10, '#5d4037', -7, 12.5, 2); // buty
        addBox(8, 4, 10, '#5d4037', 7, 12.5, 2);

        // Tułów — okrągły boczek (sfera zeskalowana)
        var body = new THREE.Mesh(new THREE.SphereGeometry(16, 14, 10), baconMat);
        body.scale.set(1.1, 0.85, 0.95);
        body.position.set(0, 22, 0);
        body.castShadow = true;
        group.add(body);

        // Paski tłuszczu / boczku
        for (var pi = 0; pi < 3; pi++) {
            var strip = new THREE.Mesh(
                new THREE.TorusGeometry(14 - pi * 2, 2, 6, 20),
                fatMat
            );
            strip.rotation.x = Math.PI / 2;
            strip.position.set(0, 18 + pi * 5, 0);
            group.add(strip);
        }

        // Ręce — mięsiste
        addCylinder(5, 6, 12, '#c43e2e', -20, 22, 0);
        addCylinder(5, 6, 12, '#c43e2e', 20, 22, 0);
        addSphere(4, '#e85d4a', -20, 14, 0);
        addSphere(4, '#e85d4a', 20, 14, 0);

        // Głowa — okrągła, bekonowa
        var head = new THREE.Mesh(new THREE.SphereGeometry(11, 16, 12), baconMat);
        head.position.set(0, 40, 0);
        group.add(head);
        // Pasek tłuszczu na głowie
        addBox(20, 2, 20, '#f5c6b8', 0, 43, 0);

        // Oczy
        addSphere(2.8, 0xffffff, -4, 41, 9);
        addSphere(2.8, 0xffffff, 4, 41, 9);
        addSphere(1.8, 0x222222, -4, 41, 10);
        addSphere(1.8, 0x222222, 4, 41, 10);

        // Grymas — odwrócony uśmiech
        addBox(6, 1, 1, '#3e2723', 0, 37, 10);
    }

    // === FROSTIK ===
    else if (characterName === 'Frostik') {
        var iceMat = new THREE.MeshStandardMaterial({ color: 0x29b6f6, transparent: true, opacity: 0.85, roughness: 0.2, metalness: 0.1 });
        var iceDarkMat = new THREE.MeshStandardMaterial({ color: 0x01579b, roughness: 0.3 });

        // Nogi — kryształowe
        addCylinder(5, 6, 12, 0x01579b, -7, 6, 0);
        addCylinder(5, 6, 12, 0x01579b, 7, 6, 0);
        addCylinder(4, 5, 10, 0x4fc3f7, -7, 17, 0);
        addCylinder(4, 5, 10, 0x4fc3f7, 7, 17, 0);
        // Lodowe buty
        var bootGeo = new THREE.BoxGeometry(7, 5, 9);
        var bootMat = new THREE.MeshStandardMaterial({ color: 0x81d4fa, transparent: true, opacity: 0.7, roughness: 0.2 });
        var bootL = new THREE.Mesh(bootGeo, bootMat);
        bootL.position.set(-7, 23, 2);
        group.add(bootL);
        var bootR = bootL.clone();
        bootR.position.set(7, 23, 2);
        group.add(bootR);

        // Tułów — lodowy
        var torso = new THREE.Mesh(new THREE.BoxGeometry(16, 26, 13), iceMat);
        torso.position.set(0, 25, 0);
        group.add(torso);

        // Kryształowa zbroja na klatce
        for (var ci = 0; ci < 5; ci++) {
            var crys = new THREE.Mesh(
                new THREE.OctahedronGeometry(3 + Math.random() * 2, 0),
                new THREE.MeshStandardMaterial({ color: 0xb3e5fc, emissive: 0xb3e5fc, emissiveIntensity: 0.4, transparent: true, opacity: 0.8 })
            );
            crys.position.set((Math.random() - 0.5) * 12, 22 + Math.random() * 10, 7);
            group.add(crys);
        }

        // Ręce — lodowe
        addCylinder(4, 5, 12, 0x29b6f6, -15, 26, 0);
        addCylinder(4, 5, 12, 0x29b6f6, 15, 26, 0);
        addCylinder(3.5, 4, 10, 0x29b6f6, -15, 15, 0);
        addCylinder(3.5, 4, 10, 0x29b6f6, 15, 15, 0);
        // Lodowe dłonie
        addSphere(3.5, 0xb3e5fc, -15, 9, 0);
        addSphere(3.5, 0xb3e5fc, 15, 9, 0);

        // Głowa — lodowa
        var head = new THREE.Mesh(new THREE.SphereGeometry(10, 16, 12), iceMat);
        head.position.set(0, 41, 0);
        group.add(head);
        // Lodowa czupryna — igły lodu
        for (var fi = 0; fi < 8; fi++) {
            var fAngle = (fi / 8) * Math.PI * 2;
            addCylinder(1, 0.5, 6, 0x81d4fa,
                Math.cos(fAngle) * 7, 47, Math.sin(fAngle) * 7);
        }

        // Oczy — lodowe
        addSphere(2.8, 0xffffff, -4, 42, 9);
        addSphere(2.8, 0xffffff, 4, 42, 9);
        addSphere(1.8, 0x01579b, -4, 42, 10);
        addSphere(1.8, 0x01579b, 4, 42, 10);
    }

    // === CIENIAK ===
    else if (characterName === 'Cieniak') {
        var darkMat = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.2, metalness: 0.3 });
        var voidMat = new THREE.MeshStandardMaterial({ color: 0x1a0a2e, roughness: 0.4 });

        // Nogi — płaszczowe
        addCylinder(6, 8, 16, 0x1a0a2e, -7, 8, 0);
        addCylinder(6, 8, 16, 0x1a0a2e, 7, 8, 0);
        // Stopy — zanikające w cieniu
        addSphere(4, 0x000000, -7, 18, 0);
        addSphere(4, 0x000000, 7, 18, 0);

        // Tułów — wiszący płaszcz
        var torso = new THREE.Mesh(new THREE.CylinderGeometry(10, 16, 28, 8), voidMat);
        torso.position.set(0, 24, 0);
        group.add(torso);

        // Ręce — macki
        for (var ti = 0; ti < 3; ti++) {
            var tAngle = -0.5 + ti * 0.5;
            var armGroup = new THREE.Group();
            for (var seg = 0; seg < 4; seg++) {
                var segMesh = new THREE.Mesh(
                    new THREE.SphereGeometry(3 - seg * 0.5, 8, 6),
                    darkMat
                );
                segMesh.position.set(seg * 6, -seg * 3, 0);
                armGroup.add(segMesh);
            }
            armGroup.position.set((ti - 1) * 18, 30, 0);
            armGroup.rotation.z = tAngle * 0.3;
            group.add(armGroup);
        }

        // Głowa — wisząca czarna dziura
        var head = new THREE.Mesh(new THREE.TorusGeometry(9, 3.5, 8, 20), darkMat);
        head.position.set(0, 42, 0);
        head.rotation.x = Math.PI / 2;
        group.add(head);
        // Wewnętrzne spiralne oczy
        var eyeCore = new THREE.Mesh(
            new THREE.SphereGeometry(5, 12, 10),
            new THREE.MeshStandardMaterial({ color: 0x311b92, emissive: 0x7c4dff, emissiveIntensity: 0.8 })
        );
        eyeCore.position.set(0, 42, 0);
        group.add(eyeCore);

        // Fioletowa poświata
        var glow = new THREE.PointLight(0x7c4dff, 2, 100);
        glow.position.set(0, 35, 0);
        group.add(glow);
        // Mgła wokół
        var fogSphere = new THREE.Mesh(
            new THREE.SphereGeometry(30, 12, 10),
            new THREE.MeshStandardMaterial({ color: 0x311b92, transparent: true, opacity: 0.08 })
        );
        fogSphere.position.set(0, 25, 0);
        group.add(fogSphere);
    }

    // === MAGMAK ===
    else if (characterName === 'Magmak') {
        var rockMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.95 });
        var lavaSkinMat = new THREE.MeshStandardMaterial({ color: 0xff5722, emissive: 0xff5722, emissiveIntensity: 0.5, roughness: 0.7 });

        // Nogi — kamienne z lawą w środku
        addCylinder(6, 7, 14, 0x3e2723, -8, 7, 0);
        addCylinder(6, 7, 14, 0x3e2723, 8, 7, 0);
        // Lawa w nogach
        addCylinder(3, 4, 10, 0xff5722, -8, 7, 0);
        addCylinder(3, 4, 10, 0xff5722, 8, 7, 0);
        // Kamienne stopy
        addSphere(5, 0x5d4037, -8, 16, 2);
        addSphere(5, 0x5d4037, 8, 16, 2);

        // Tułów — kamienny wulkan
        var torso = new THREE.Mesh(new THREE.CylinderGeometry(14, 16, 28, 10), rockMat);
        torso.position.set(0, 25, 0);
        group.add(torso);
        // Pęknięcia z lawą
        for (var li = 0; li < 4; li++) {
            var lAngle = (li / 4) * Math.PI * 2;
            addBox(2, 12, 2, 0xff5722,
                Math.cos(lAngle) * 13, 25, Math.sin(lAngle) * 13);
        }

        // Ręce — kamienne z lawowymi pięściami
        addCylinder(5, 6, 12, 0x3e2723, -20, 28, 0);
        addCylinder(5, 6, 12, 0x3e2723, 20, 28, 0);
        addSphere(6, 0xff5722, -20, 18, 0); // lawowa pięść
        addSphere(6, 0xff5722, 20, 18, 0);

        // Głowa — wulkaniczna skała
        var head = new THREE.Mesh(new THREE.SphereGeometry(10, 14, 10), rockMat);
        head.position.set(0, 42, 0);
        group.add(head);
        // Krater na głowie
        var crater = new THREE.Mesh(
            new THREE.CylinderGeometry(4, 3, 3, 8),
            new THREE.MeshStandardMaterial({ color: 0xffab00, emissive: 0xffab00, emissiveIntensity: 1.2 })
        );
        crater.position.set(0, 49, 0);
        group.add(crater);

        // Oczy — płomienne
        addSphere(2.5, 0xffffff, -4, 43, 9);
        addSphere(2.5, 0xffffff, 4, 43, 9);
        addSphere(1.8, 0xff5722, -4, 43, 10);
        addSphere(1.8, 0xff5722, 4, 43, 10);

        // Dym i ogień — małe cząsteczki nad głową
        for (var fi = 0; fi < 5; fi++) {
            addSphere(1.5 + Math.random(), 0xff5722, (Math.random() - 0.5) * 10, 50 + fi * 3, (Math.random() - 0.5) * 6);
        }
    }

    // === TOKSYK ===
    else if (characterName === 'Toksyk') {
        var slimeMat = new THREE.MeshStandardMaterial({ color: 0x00e676, roughness: 0.3, metalness: 0.1 });
        var bubbleMat = new THREE.MeshStandardMaterial({ color: 0x69f0ae, transparent: true, opacity: 0.6, roughness: 0.2 });

        // Nogi — śluzowate (2 segmenty)
        addCylinder(5, 6, 10, 0x00c853, -8, 5, 0);
        addCylinder(5, 6, 10, 0x00c853, 8, 5, 0);
        addCylinder(4, 5, 8, 0x00e676, -8, 14, 0);
        addCylinder(4, 5, 8, 0x00e676, 8, 14, 0);
        // Śluzowe stopy
        addSphere(5, 0x00e676, -8, 19, 2);
        addSphere(5, 0x00e676, 8, 19, 2);

        // Tułów — bąbelkowy
        var torso = new THREE.Mesh(new THREE.SphereGeometry(13, 14, 10), slimeMat);
        torso.scale.set(1, 1.1, 0.9);
        torso.position.set(0, 24, 0);
        group.add(torso);
        // Bąbelki na tułowie
        for (var bi = 0; bi < 6; bi++) {
            var bubl = new THREE.Mesh(new THREE.SphereGeometry(2 + Math.random() * 2, 8, 6), bubbleMat);
            bubl.position.set((Math.random() - 0.5) * 16, 20 + Math.random() * 12, 8);
            group.add(bubl);
        }

        // Butelka trucizny w ręce
        var bottle = new THREE.Mesh(
            new THREE.CylinderGeometry(3, 4, 10, 8),
            new THREE.MeshStandardMaterial({ color: 0x81c784, transparent: true, opacity: 0.5 })
        );
        bottle.position.set(-18, 22, 0);
        group.add(bottle);
        var liquid = new THREE.Mesh(
            new THREE.CylinderGeometry(2.5, 3.5, 7, 8),
            new THREE.MeshStandardMaterial({ color: 0x00e676, emissive: 0x00e676, emissiveIntensity: 0.3 })
        );
        liquid.position.set(-18, 21, 0);
        group.add(liquid);

        // Ręce
        addCylinder(4, 5, 11, 0x00e676, -15, 26, 0);
        addCylinder(4, 5, 11, 0x00e676, 15, 26, 0);
        addCylinder(3.5, 4, 9, 0x00e676, -15, 16, 0);
        addCylinder(3.5, 4, 9, 0x00e676, 15, 16, 0);
        addSphere(3.5, 0x00e676, -15, 10, 0);
        addSphere(3.5, 0x00e676, 15, 10, 0);

        // Głowa — ślimakowata
        var head = new THREE.Mesh(new THREE.SphereGeometry(10, 14, 10), slimeMat);
        head.position.set(0, 40, 0);
        group.add(head);
        // Czułki — 2 segmenty cylindra
        for (var ai = 0; ai < 2; ai++) {
            var side = ai === 0 ? -1 : 1;
            var ant1 = new THREE.Mesh(
                new THREE.CylinderGeometry(1.2, 1.8, 10, 6),
                slimeMat
            );
            ant1.position.set(side * 6, 50, 0);
            ant1.rotation.z = side * 0.3;
            group.add(ant1);
            var ant2 = new THREE.Mesh(
                new THREE.CylinderGeometry(0.8, 1.2, 8, 6),
                slimeMat
            );
            ant2.position.set(side * 7, 57, 1);
            ant2.rotation.z = side * 0.2;
            group.add(ant2);
            // Kulka na czubku
            addSphere(2.5, 0x69f0ae, side * 7, 61, 2);
        }

        // Oczy
        addSphere(2.8, 0xffffff, -4, 41, 9);
        addSphere(2.8, 0xffffff, 4, 41, 9);
        addSphere(1.8, 0x1b5e20, -4, 41, 10);
        addSphere(1.8, 0x1b5e20, 4, 41, 10);
    }

    // === DUSZEK ===
    else if (characterName === 'Duszek') {
        var ghostMat = new THREE.MeshStandardMaterial({ color: 0xe8e8e8, transparent: true, opacity: 0.5, roughness: 0.3 });
        var innerMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.3, roughness: 0.2 });

        // Ciało — wiszące, faliste
        var bodyGeo = new THREE.SphereGeometry(14, 16, 12);
        var body = new THREE.Mesh(bodyGeo, ghostMat);
        body.scale.set(1, 1.3, 0.85);
        body.position.set(0, 24, 0);
        group.add(body);
        // Wewnętrzna poświata
        var inner = new THREE.Mesh(new THREE.SphereGeometry(10, 12, 10), innerMat);
        inner.position.set(0, 24, 0);
        group.add(inner);

        // Falisty ogon — segmenty sfer
        for (var oi = 0; oi < 6; oi++) {
            var tailSeg = new THREE.Mesh(
                new THREE.SphereGeometry(6 - oi * 0.7, 10, 8),
                ghostMat
            );
            tailSeg.position.set(Math.sin(oi * 0.5) * 3, 8 - oi * 4, -oi * 2);
            group.add(tailSeg);
        }

        // Ręce — eteryczne (3 segmenty cylindrów)
        for (var ri = 0; ri < 2; ri++) {
            var side = ri === 0 ? -1 : 1;
            var arm1 = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 3, 10, 6), ghostMat);
            arm1.position.set(side * 16, 26, 0);
            arm1.rotation.z = side * 0.5;
            group.add(arm1);
            var arm2 = new THREE.Mesh(new THREE.CylinderGeometry(2, 2.5, 10, 6), ghostMat);
            arm2.position.set(side * 22, 20, 0);
            arm2.rotation.z = side * 0.3;
            group.add(arm2);
            var arm3 = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 2, 8, 6), ghostMat);
            arm3.position.set(side * 26, 14, 1);
            arm3.rotation.z = side * 0.2;
            group.add(arm3);
            // Dłoń — zanikająca
            addSphere(3, 0xffffff, side * 28, 10, 2);
        }

        // Głowa
        var head = new THREE.Mesh(new THREE.SphereGeometry(10, 16, 12), ghostMat);
        head.position.set(0, 40, 0);
        group.add(head);

        // Poświata
        var ghostLight = new THREE.PointLight(0xffffff, 1.2, 80);
        ghostLight.position.set(0, 30, 0);
        group.add(ghostLight);

        // Oczy — puste, przerażające
        addSphere(3, 0x000000, -4, 41, 8);
        addSphere(3, 0x000000, 4, 41, 8);
        addSphere(1.2, 0xffffff, -4, 41, 9);
        addSphere(1.2, 0xffffff, 4, 41, 9);
    }

    // === ZŁOTEK ===
    else if (characterName === 'Złotek') {
        var goldMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 1.0, roughness: 0.15 });
        var goldDarkMat = new THREE.MeshStandardMaterial({ color: 0xff8f00, metalness: 0.9, roughness: 0.2 });

        // Nogi — złote z metalicznym połyskiem
        addCylinder(5, 6, 12, 0xffd700, -7, 6, 0);
        addCylinder(5, 6, 12, 0xffd700, 7, 6, 0);
        addCylinder(4, 5, 10, 0xff8f00, -7, 17, 0);
        addCylinder(4, 5, 10, 0xff8f00, 7, 17, 0);
        // Złote buty
        addBox(7, 4, 9, 0xffd700, -7, 23, 2);
        addBox(7, 4, 9, 0xffd700, 7, 23, 2);

        // Tułów — złoty pancerz
        var torso = new THREE.Mesh(new THREE.CylinderGeometry(12, 13, 26, 10), goldMat);
        torso.position.set(0, 25, 0);
        group.add(torso);
        // Pasek z monetami
        for (var mi = 0; mi < 5; mi++) {
            var coin = new THREE.Mesh(
                new THREE.CylinderGeometry(2.5, 2.5, 0.8, 12),
                goldMat
            );
            coin.rotation.x = Math.PI / 2;
            coin.position.set((mi - 2) * 5, 28, 11);
            group.add(coin);
        }

        // Ręce — złote, jedna trzyma berło
        addCylinder(4, 5, 12, 0xffd700, -15, 26, 0);
        addCylinder(4, 5, 12, 0xffd700, 15, 26, 0);
        addCylinder(3.5, 4, 10, 0xff8f00, -15, 15, 0);
        addCylinder(3.5, 4, 10, 0xff8f00, 15, 15, 0);
        // Złote dłonie
        addSphere(4, 0xffd700, -15, 9, 0);
        addSphere(4, 0xffd700, 15, 9, 0);
        // Berło w prawej ręce
        var scepter = new THREE.Mesh(
            new THREE.CylinderGeometry(1, 1, 18, 8),
            goldMat
        );
        scepter.position.set(15, 20, 5);
        scepter.rotation.x = 0.3;
        group.add(scepter);
        var scepterGem = new THREE.Mesh(
            new THREE.OctahedronGeometry(4, 0),
            new THREE.MeshStandardMaterial({ color: 0x4caf50, emissive: 0x4caf50, emissiveIntensity: 0.5 })
        );
        scepterGem.position.set(15, 30, 8);
        group.add(scepterGem);

        // Głowa — złota
        var head = new THREE.Mesh(new THREE.SphereGeometry(10, 16, 12), goldMat);
        head.position.set(0, 41, 0);
        group.add(head);

        // Korona — bogata
        for (var ki = 0; ki < 7; ki++) {
            var kAngle = (ki / 7) * Math.PI * 2;
            var spike = new THREE.Mesh(
                new THREE.ConeGeometry(2.5, 8, 6),
                goldMat
            );
            spike.position.set(Math.sin(kAngle) * 9, 48, Math.cos(kAngle) * 9);
            group.add(spike);
        }
        addSphere(11, 0xffd700, 0, 43, 0); // podstawa korony

        // Złota poświata
        var goldLight = new THREE.PointLight(0xffd700, 1.5, 60);
        goldLight.position.set(0, 30, 0);
        group.add(goldLight);

        // Oczy — szmaragdowe
        addSphere(2.8, 0x4caf50, -4, 42, 9);
        addSphere(2.8, 0x4caf50, 4, 42, 9);
        addSphere(1.5, 0x1b5e20, -4, 42, 10);
        addSphere(1.5, 0x1b5e20, 4, 42, 10);
    }

    // === ULTRA ZOMBI ===
    else if (characterName === 'UltraZombi') {
        var skinMat = new THREE.MeshStandardMaterial({ color: 0xe91e63, roughness: 0.4 });
        var armorMat = new THREE.MeshStandardMaterial({ color: 0x880e4f, metalness: 0.4, roughness: 0.6 });
        var spikeMat = new THREE.MeshStandardMaterial({ color: 0xff1744, emissive: 0xff1744, emissiveIntensity: 0.4 });

        // Nogi — pancerz + skóra
        addCylinder(6, 7, 14, 0x880e4f, -8, 7, 0);   // udo
        addCylinder(6, 7, 14, 0x880e4f, 8, 7, 0);
        addCylinder(5, 6, 10, 0xe91e63, -8, 19, 0); // łydka
        addCylinder(5, 6, 10, 0xe91e63, 8, 19, 0);
        // Kolce na nogach
        for (var ni = 0; ni < 3; ni++) {
            addCylinder(1, 0.5, 5, 0xff1744, -10, 10 + ni * 6, 0);
            addCylinder(1, 0.5, 5, 0xff1744, 10, 10 + ni * 6, 0);
        }
        addBox(8, 5, 10, 0x1a1a1a, -8, 24, 2); // buty
        addBox(8, 5, 10, 0x1a1a1a, 8, 24, 2);

        // Tułów — muskularny z pancerzem
        var torso = new THREE.Mesh(new THREE.CylinderGeometry(14, 15, 28, 10), skinMat);
        torso.position.set(0, 25, 0);
        group.add(torso);
        // Płytka pancerza
        var plate = new THREE.Mesh(new THREE.BoxGeometry(20, 16, 4), armorMat);
        plate.position.set(0, 26, 8);
        group.add(plate);
        // Łańcuchy
        for (var ci = 0; ci < 3; ci++) {
            addCylinder(2, 2, 18, 0x555555, 0, 22 + ci * 3, 10);
        }

        // Ręce — ogromne z kolcami
        addCylinder(6, 7, 13, 0xe91e63, -20, 28, 0);
        addCylinder(6, 7, 13, 0xe91e63, 20, 28, 0);
        addCylinder(5, 6, 11, 0xe91e63, -20, 16, 0);
        addCylinder(5, 6, 11, 0xe91e63, 20, 16, 0);
        // Kolce na przedramionach
        for (var ai = 0; ai < 3; ai++) {
            addCylinder(1.5, 0.5, 6, 0xff1744, -24, 14 + ai * 5, 0);
            addCylinder(1.5, 0.5, 6, 0xff1744, 24, 14 + ai * 5, 0);
        }
        addSphere(6, 0xc2185b, -20, 9, 0); // dłonie
        addSphere(6, 0xc2185b, 20, 9, 0);

        // Głowa — potężna
        var head = new THREE.Mesh(new THREE.SphereGeometry(11, 16, 12), skinMat);
        head.position.set(0, 43, 0);
        group.add(head);
        // Kolce na głowie — imponujące
        for (var si = 0; si < 7; si++) {
            var sAngle = (si / 7) * Math.PI * 2;
            var spike = new THREE.Mesh(
                new THREE.ConeGeometry(2.5, 14, 6),
                spikeMat
            );
            spike.position.set(Math.sin(sAngle) * 10, 52, Math.cos(sAngle) * 10);
            group.add(spike);
        }
        addSphere(12, 0xad1457, 0, 45, 0); // podstawa kolców

        // Oczy — świecące żółte
        var eyeGlowMat = new THREE.MeshStandardMaterial({ color: 0xffeb3b, emissive: 0xffeb3b, emissiveIntensity: 1.2 });
        var eyeL = new THREE.Mesh(new THREE.SphereGeometry(3.5, 10, 8), eyeGlowMat);
        eyeL.position.set(-5, 44, 9);
        group.add(eyeL);
        var eyeR = eyeL.clone();
        eyeR.position.set(5, 44, 9);
        group.add(eyeR);

        // Ogromne kły
        addCylinder(2.5, 1, 8, 0xffffff, -3, 38, 9);
        addCylinder(2.5, 1, 8, 0xffffff, 3, 38, 9);

        // Czerwona poświata
        var ultraLight = new THREE.PointLight(0xe91e63, 1.5, 80);
        ultraLight.position.set(0, 35, 0);
        group.add(ultraLight);
        // Mgła krwi
        var bloodFog = new THREE.Mesh(
            new THREE.SphereGeometry(35, 12, 10),
            new THREE.MeshStandardMaterial({ color: 0xe91e63, transparent: true, opacity: 0.06 })
        );
        bloodFog.position.set(0, 25, 0);
        group.add(bloodFog);
    }

    // Fallback
    else {
        addCylinder(5, 6, 22, color, -7, 11, 0);
        addCylinder(5, 6, 22, color, 7, 11, 0);
        addBox(16, 26, 13, color, 0, 25, 0);
        addSphere(10, color, 0, 42, 0);
    }

    return group;
}

// Helper do przyciemniania koloru
function darken(threeColor, factor) {
    var c = threeColor.clone();
    c.multiplyScalar(1 - factor);
    return c.getHexString() ? '#' + c.getHexString() : '#444444';
}

// ============================================================
// AKTUALIZACJA MESHÓW ZE STANU GRY
// ============================================================

function rebuildEnemyMeshes() {
    // Usuń stare
    for (var i = 0; i < enemyMeshes.length; i++) {
        if (enemyMeshes[i]) scene3d.remove(enemyMeshes[i]);
    }
    enemyMeshes = [];
    if (enemies && enemies.length) {
        for (var i = 0; i < enemies.length; i++) {
            var e = enemies[i];
            var mesh = createSimpleHumanoidMesh(e.color || '#aaa');
            mesh.position.set(e.x, 0, e.y);
            scene3d.add(mesh);
            enemyMeshes.push(mesh);
        }
    }
}

function rebuildAllyMeshes() {
    for (var i = 0; i < allyMeshes.length; i++) {
        if (allyMeshes[i]) scene3d.remove(allyMeshes[i]);
    }
    allyMeshes = [];
    if (gameMode === 'football' && footballAllies && footballAllies.length) {
        for (var i = 0; i < footballAllies.length; i++) {
            var mesh = createSimpleHumanoidMesh(0x2196f3);
            mesh.position.set(footballAllies[i].x, 0, footballAllies[i].y);
            scene3d.add(mesh);
            allyMeshes.push(mesh);
        }
    }
}

function createSimpleHumanoidMesh(col) {
    var group = new THREE.Group();
    var mainColor = new THREE.Color(col);
    var mat = new THREE.MeshStandardMaterial({ color: mainColor, roughness: 0.7 });
    var darkColor = mainColor.clone().multiplyScalar(0.6);
    var darkMat = new THREE.MeshStandardMaterial({ color: darkColor, roughness: 0.8 });
    var shoeMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 });
    var eyeRedMat = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 0.4 });

    // Nogi (2 segmenty)
    var legL = new THREE.Mesh(new THREE.CylinderGeometry(5, 6, 14, 8), darkMat);
    legL.position.set(-7, 7, 0);
    legL.castShadow = true;
    group.add(legL);
    var legR = new THREE.Mesh(new THREE.CylinderGeometry(5, 6, 14, 8), darkMat);
    legR.position.set(7, 7, 0);
    legR.castShadow = true;
    group.add(legR);

    var shinL = new THREE.Mesh(new THREE.CylinderGeometry(4, 5, 12, 8), mat);
    shinL.position.set(-7, 20, 0);
    group.add(shinL);
    var shinR = new THREE.Mesh(new THREE.CylinderGeometry(4, 5, 12, 8), mat);
    shinR.position.set(7, 20, 0);
    group.add(shinR);

    // Buty
    var bootL = new THREE.Mesh(new THREE.BoxGeometry(7, 5, 10), shoeMat);
    bootL.position.set(-7, 27, 2);
    group.add(bootL);
    var bootR = new THREE.Mesh(new THREE.BoxGeometry(7, 5, 10), shoeMat);
    bootR.position.set(7, 27, 2);
    group.add(bootR);

    // Tułów
    var torso = new THREE.Mesh(new THREE.BoxGeometry(16, 26, 13), mat);
    torso.position.set(0, 26, 0);
    torso.castShadow = true;
    group.add(torso);

    // Ręce (2 segmenty)
    var armL1 = new THREE.Mesh(new THREE.CylinderGeometry(4, 5, 12, 8), darkMat);
    armL1.position.set(-15, 30, 0);
    group.add(armL1);
    var armR1 = new THREE.Mesh(new THREE.CylinderGeometry(4, 5, 12, 8), darkMat);
    armR1.position.set(15, 30, 0);
    group.add(armR1);

    var armL2 = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 4, 10, 8), mat);
    armL2.position.set(-15, 19, 0);
    group.add(armL2);
    var armR2 = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 4, 10, 8), mat);
    armR2.position.set(15, 19, 0);
    group.add(armR2);

    // Dłonie
    var handL = new THREE.Mesh(new THREE.SphereGeometry(3.5, 10, 8), darkMat);
    handL.position.set(-15, 12, 0);
    group.add(handL);
    var handR = new THREE.Mesh(new THREE.SphereGeometry(3.5, 10, 8), darkMat);
    handR.position.set(15, 12, 0);
    group.add(handR);

    // Głowa
    var head = new THREE.Mesh(new THREE.SphereGeometry(10, 14, 12), mat);
    head.position.set(0, 43, 0);
    head.castShadow = true;
    group.add(head);

    // Oczy
    var eyeWhite = new THREE.MeshStandardMaterial({ color: 0xffffff });
    var eyeL = new THREE.Mesh(new THREE.SphereGeometry(2.5, 8, 6), eyeWhite);
    eyeL.position.set(-4, 44, 8);
    group.add(eyeL);
    var eyeR = new THREE.Mesh(new THREE.SphereGeometry(2.5, 8, 6), eyeWhite);
    eyeR.position.set(4, 44, 8);
    group.add(eyeR);

    var pupilL = new THREE.Mesh(new THREE.SphereGeometry(1.5, 8, 6), eyeRedMat);
    pupilL.position.set(-4, 44, 9.5);
    group.add(pupilL);
    var pupilR = new THREE.Mesh(new THREE.SphereGeometry(1.5, 8, 6), eyeRedMat);
    pupilR.position.set(4, 44, 9.5);
    group.add(pupilR);

    // Brwi — groźne
    var browMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    var browL = new THREE.Mesh(new THREE.BoxGeometry(5, 1.5, 1), browMat);
    browL.position.set(-4, 47, 9);
    browL.rotation.z = 0.2;
    group.add(browL);
    var browR = new THREE.Mesh(new THREE.BoxGeometry(5, 1.5, 1), browMat);
    browR.position.set(4, 47, 9);
    browR.rotation.z = -0.2;
    group.add(browR);

    return group;
}

// ============================================================
// PROJEKTYLE 3D
// ============================================================

function createProjectile3D(attack) {
    var mesh;
    if (attack.type === 'bacon') {
        mesh = new THREE.Mesh(
            new THREE.BoxGeometry(24, 8, 12),
            new THREE.MeshStandardMaterial({ color: 0xe85d4a })
        );
    } else if (attack.type === 'ice') {
        mesh = new THREE.Mesh(
            new THREE.SphereGeometry(8, 10, 8),
            new THREE.MeshStandardMaterial({ color: 0xb3e5fc, transparent: true, opacity: 0.8 })
        );
    } else if (attack.type === 'darkball') {
        mesh = new THREE.Mesh(
            new THREE.SphereGeometry(12, 12, 10),
            new THREE.MeshStandardMaterial({ color: 0x311b92, emissive: 0x311b92, emissiveIntensity: 0.5 })
        );
    } else if (attack.type === 'magmabomb') {
        mesh = new THREE.Mesh(
            new THREE.SphereGeometry(14, 12, 10),
            new THREE.MeshStandardMaterial({ color: 0xff5722, emissive: 0xff5722, emissiveIntensity: 0.6 })
        );
    } else if (attack.type === 'poisonball') {
        mesh = new THREE.Mesh(
            new THREE.SphereGeometry(10, 10, 8),
            new THREE.MeshStandardMaterial({ color: 0x00e676, transparent: true, opacity: 0.8 })
        );
    } else if (attack.type === 'flyingblackhole') {
        mesh = new THREE.Mesh(
            new THREE.TorusGeometry(10, 4, 8, 20),
            new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0x7c4dff, emissiveIntensity: 0.7 })
        );
    } else if (attack.type === 'lightning') {
        // Piorun czarodzieja - żółta/fioletowa błyskawica
        var group = new THREE.Group();
        var bolt = new THREE.Mesh(
            new THREE.CylinderGeometry(2, 1, 20, 6),
            new THREE.MeshStandardMaterial({ color: 0xe040fb, emissive: 0xffeb3b, emissiveIntensity: 1.5 })
        );
        group.add(bolt);
        var glow = new THREE.Mesh(
            new THREE.SphereGeometry(4, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0xffeb3b, transparent: true, opacity: 0.6 })
        );
        glow.position.y = 0;
        group.add(glow);
        mesh = group;
    } else {
        mesh = new THREE.Mesh(
            new THREE.SphereGeometry(8, 8, 6),
            new THREE.MeshStandardMaterial({ color: 0xff0000 })
        );
    }
    mesh.position.set(attack.x, 8, attack.y);
    mesh.rotation.y = attack.angle || 0;
    scene3d.add(mesh);
    return mesh;
}

function updateProjectiles3D() {
    // Czyścimy i odbudowujemy — proste podejście
    for (var i = 0; i < projectileMeshes.length; i++) {
        scene3d.remove(projectileMeshes[i]);
    }
    projectileMeshes = [];
    if (!attacks || !attacks.length) return;
    for (var i = 0; i < attacks.length; i++) {
        var a = attacks[i];
        var ax = a.x + Math.cos(a.angle) * a.dist;
        var ay = a.y + Math.sin(a.angle) * a.dist;
        var mesh = createProjectile3D(a);
        mesh.position.set(ax, 8, ay);
        mesh.lookAt(ax + Math.cos(a.angle), 8, ay + Math.sin(a.angle));
        projectileMeshes.push(mesh);
    }
}

// ============================================================
// CZĄSTECZKI 3D
// ============================================================

function updateParticles3D() {
    // Proste: małe sfery dla cząsteczek (można zoptymalizować później)
    // Usuń stare cząsteczki
    for (var i = 0; i < (scene3d.userData.particleMeshes || []).length; i++) {
        scene3d.remove(scene3d.userData.particleMeshes[i]);
    }
    scene3d.userData.particleMeshes = [];

    if (!particles || !particles.length) return;
    for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        var geo = new THREE.SphereGeometry(3 + Math.random() * 2, 4, 4);
        var mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(p.color || '#ffffff'), transparent: true, opacity: Math.max(0.2, p.life / 25) });
        var m = new THREE.Mesh(geo, mat);
        m.position.set(p.x, 10 + Math.random() * 15, p.y);
        scene3d.add(m);
        scene3d.userData.particleMeshes.push(m);
    }
}

// ============================================================
// BOSS 3D
// ============================================================

var bossMesh = null;

function updateBoss3D() {
    if (!castleBoss) {
        if (bossMesh) { scene3d.remove(bossMesh); bossMesh = null; }
        return;
    }
    if (!bossMesh) {
        bossMesh = new THREE.Group();
        // Ciało
        var body = new THREE.Mesh(
            new THREE.CylinderGeometry(35, 45, 90, 10),
            new THREE.MeshStandardMaterial({ color: 0x1a0000 })
        );
        body.position.y = 45;
        bossMesh.add(body);
        // Korona
        for (var k = 0; k < 7; k++) {
            var spike = new THREE.Mesh(
                new THREE.ConeGeometry(5, 18, 6),
                new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8 })
            );
            var a = ((k - 3) / 3) * 0.8;
            spike.position.set(Math.sin(a) * 28, 88, Math.cos(a) * 28);
            bossMesh.add(spike);
        }
        // Głowa
        var head = new THREE.Mesh(
            new THREE.SphereGeometry(28, 14, 12),
            new THREE.MeshStandardMaterial({ color: 0x2d1f1f })
        );
        head.position.y = 88;
        bossMesh.add(head);
        // Oczy
        var eyeMat = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 1 });
        var eyeL = new THREE.Mesh(new THREE.SphereGeometry(8, 10, 8), eyeMat);
        eyeL.position.set(-12, 92, 20);
        bossMesh.add(eyeL);
        var eyeR = eyeL.clone();
        eyeR.position.set(12, 92, 20);
        bossMesh.add(eyeR);
        // Zęby
        var toothMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
        var t1 = new THREE.Mesh(new THREE.BoxGeometry(6, 10, 4), toothMat);
        t1.position.set(-10, 76, 22);
        bossMesh.add(t1);
        var t2 = t1.clone();
        t2.position.set(10, 76, 22);
        bossMesh.add(t2);
        // Tarcza zbroi
        if (bossHasArmor) {
            var shield = new THREE.Mesh(
                new THREE.SphereGeometry(70, 16, 12),
                new THREE.MeshStandardMaterial({ color: 0x4fc3f7, transparent: true, opacity: 0.25 })
            );
            shield.position.y = 50;
            bossMesh.add(shield);
        }
        scene3d.add(bossMesh);
    }
    bossMesh.position.set(castleBoss.x, 0, castleBoss.y);
    // Animacja pulsu
    var t = Date.now() / 1000;
    bossMesh.scale.setScalar(1 + Math.sin(t * 4) * 0.03);
}

// ============================================================
// PIŁKA NOŻNA 3D
// ============================================================

var ballMesh = null;

function updateFootball3D() {
    if (gameMode !== 'football' || !footballBall) {
        if (ballMesh) { scene3d.remove(ballMesh); ballMesh = null; }
        return;
    }
    if (!ballMesh) {
        ballMesh = new THREE.Group();
        var ball = new THREE.Mesh(
            new THREE.SphereGeometry(15, 16, 12),
            new THREE.MeshStandardMaterial({ color: 0xffffff })
        );
        ballMesh.add(ball);
        // Czarne "pięciokąty" uproszczone do kropek
        var blackMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        for (var b = 0; b < 5; b++) {
            var dot = new THREE.Mesh(new THREE.SphereGeometry(3, 6, 6), blackMat);
            var ba = (b / 5) * Math.PI * 2;
            dot.position.set(Math.cos(ba) * 10, Math.sin(ba) * 10, 12);
            ballMesh.add(dot);
        }
        scene3d.add(ballMesh);
    }
    ballMesh.position.set(footballBall.x, 15, footballBall.y);
}

// ============================================================
// GŁÓWNA FUNKCJA RENDERUJĄCA
// ============================================================

function renderArena3D() {
    if (!use3D || !renderer3d || !scene3d || !camera3d) {
        // Fallback do starego rendereru 2D
        if (typeof drawArena === 'function') drawArena();
        return;
    }

    // Aktualizuj drzwi zamku w 3D
    updateCastleDoor3D();

    // Pierwszy render lub zmiana poziomu — odbuduj obiekty areny i wrogów
    if (arena3dNeedsRebuild) {
        rebuildArenaObjects3D();
        rebuildEnemyMeshes();
        rebuildAllyMeshes();
        // Odbuduj gracza jeśli zmieniła się postać
        if (playerMesh && playerMesh.userData.character !== (selectedCharacter || 'Zombie')) {
            scene3d.remove(playerMesh);
            playerMesh = createCharacterMesh(selectedCharacter || 'Zombie', currentSkin || 'default');
            scene3d.add(playerMesh);
        }
        if (!playerMesh) {
            playerMesh = createCharacterMesh(selectedCharacter || 'Zombie', currentSkin || 'default');
            scene3d.add(playerMesh);
        }
        arena3dNeedsRebuild = false;
    }

    // Jeśli liczba wrogów się zmieniła (np. nowy spawn, śmierć)
    if (enemyMeshes.length !== enemies.length) {
        rebuildEnemyMeshes();
    }
    if (gameMode === 'football' && allyMeshes.length !== (footballAllies ? footballAllies.length : 0)) {
        rebuildAllyMeshes();
    }

    // Aktualizuj pozycję gracza
    if (playerMesh && player) {
        playerMesh.position.set(player.x, 0, player.y);
        // Obrót w stronę myszki (świat)
        var worldMX = mouse.x + camera.x;
        var worldMY = mouse.y + camera.y;
        playerMesh.lookAt(worldMX, 0, worldMY);
    }

    // Aktualizuj wrogów (ukryj ich w zamku)
    for (var i = 0; i < enemies.length; i++) {
        if (enemyMeshes[i] && enemies[i]) {
            enemyMeshes[i].position.set(enemies[i].x, 0, enemies[i].y);
            if (enemies[i].isDead || inCastle) {
                enemyMeshes[i].visible = false;
            } else {
                enemyMeshes[i].visible = true;
                enemyMeshes[i].lookAt(player.x, 0, player.y);
            }
        }
    }

    // Aktualizuj sojuszników (football)
    if (gameMode === 'football' && footballAllies) {
        for (var i = 0; i < footballAllies.length; i++) {
            if (allyMeshes[i]) {
                allyMeshes[i].position.set(footballAllies[i].x, 0, footballAllies[i].y);
                allyMeshes[i].visible = !footballAllies[i].isDead;
            }
        }
    }

    // Wrogowie w zamku (3D)
    if (inCastle) {
        updateCastleEnemies3D();
    }

    // Projektyle
    updateProjectiles3D();

    // Cząsteczki
    updateParticles3D();

    // Boss (na arenie lub w zamku)
    updateBoss3D();

    // Piłka
    updateFootball3D();

    // Czarna dziura (Cieniak)
    updateBlackHole3D();

    // Strefa lawy (Magmak)
    updateLavaZone3D();

    // Kamera podąża za graczem
    if (player) {
        var targetCamX = player.x;
        var targetCamY = 320;
        var targetCamZ = player.y + 280;
        // Inicjalizacja kamery przy pierwszym renderze
        if (!camera3d.position.x || isNaN(camera3d.position.x)) {
            camera3d.position.set(targetCamX, targetCamY, targetCamZ);
        }
        camera3d.position.x += (targetCamX - camera3d.position.x) * 0.08;
        camera3d.position.y += (targetCamY - camera3d.position.y) * 0.08;
        camera3d.position.z += (targetCamZ - camera3d.position.z) * 0.08;
        camera3d.lookAt(player.x, 0, player.y);
    }

    // Aktualizuj pozycję myszki w świecie 3D (dla strzelania)
    updateMouseWorld3D();

    renderer3d.render(scene3d, camera3d);
}

// --- RAYCASTER: myszka w świecie 3D ---
var aimRing3d = null;
function updateMouseWorld3D() {
    if (!camera3d || !renderer3d) return;
    var w = renderer3d.domElement.clientWidth || window.innerWidth;
    var h = renderer3d.domElement.clientHeight || window.innerHeight;
    if (!w || !h) return;
    mouseNDC3d.x = (mouse.x / w) * 2 - 1;
    mouseNDC3d.y = -(mouse.y / h) * 2 + 1;
    raycaster3d.setFromCamera(mouseNDC3d, camera3d);
    var planeY = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    var target = new THREE.Vector3();
    raycaster3d.ray.intersectPlane(planeY, target);
    if (target) {
        mouseWorld3D.x = target.x;
        mouseWorld3D.z = target.z;
    }
    // Celownik na podłodze
    if (!aimRing3d && scene3d) {
        aimRing3d = new THREE.Mesh(
            new THREE.RingGeometry(10, 14, 32),
            new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
        );
        aimRing3d.rotation.x = -Math.PI / 2;
        scene3d.add(aimRing3d);
    }
    if (aimRing3d) {
        aimRing3d.position.set(mouseWorld3D.x, 1, mouseWorld3D.z);
        aimRing3d.visible = gameRunning && !player.superReady;
        var pulse = 1 + Math.sin(Date.now() / 150) * 0.15;
        aimRing3d.scale.setScalar(pulse);
    }
}

// ============================================================
// WROGOWIE W ZAMKU 3D
// ============================================================

var castleEnemyMeshes = [];

function updateCastleEnemies3D() {
    if (!scene3d) return;
    if (!inCastle) {
        // Ukryj wszystkie meshe wrogów zamku gdy na arenie
        for (var i = 0; i < castleEnemyMeshes.length; i++) {
            if (castleEnemyMeshes[i]) castleEnemyMeshes[i].visible = false;
        }
        return;
    }
    // Upewnij się że mamy tyle meshów ile bossów (max 1 na piętro)
    var enemyList = [];
    if (castleFloor === 0 && bossFloor0 && bossFloor0.hp > 0) enemyList.push(bossFloor0);
    if (castleFloor === 1 && bossFloor1 && bossFloor1.hp > 0) enemyList.push(bossFloor1);
    
    // Usuń nadmiarowe meshe
    while (castleEnemyMeshes.length > enemyList.length) {
        var m = castleEnemyMeshes.pop();
        if (m) scene3d.remove(m);
    }
    
    // Stwórz brakujące meshe
    while (castleEnemyMeshes.length < enemyList.length) {
        var color = castleFloor === 0 ? 0x5d4037 : 0x4a148c;
        var mesh = createSimpleHumanoidMesh(color);
        scene3d.add(mesh);
        castleEnemyMeshes.push(mesh);
    }
    
    // Aktualizuj pozycje
    for (var i = 0; i < enemyList.length; i++) {
        var e = enemyList[i];
        if (castleEnemyMeshes[i] && e) {
            castleEnemyMeshes[i].position.set(e.x, 0, e.y);
            castleEnemyMeshes[i].visible = true;
            castleEnemyMeshes[i].lookAt(player.x, 0, player.y);
        }
    }
}

// ============================================================
// EFEKTY SPECJALNE 3D
// ============================================================

var blackHoleMesh = null;

function updateBlackHole3D() {
    if (!player || !player.blackHole || player.blackHole.timer <= 0) {
        if (blackHoleMesh) { scene3d.remove(blackHoleMesh); blackHoleMesh = null; }
        return;
    }
    if (!blackHoleMesh) {
        blackHoleMesh = new THREE.Group();
        var torus = new THREE.Mesh(
            new THREE.TorusGeometry(25, 6, 12, 30),
            new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0x311b92, emissiveIntensity: 0.8 })
        );
        torus.rotation.x = Math.PI / 2;
        blackHoleMesh.add(torus);
        var inner = new THREE.Mesh(
            new THREE.SphereGeometry(18, 14, 12),
            new THREE.MeshStandardMaterial({ color: 0x311b92, transparent: true, opacity: 0.6 })
        );
        blackHoleMesh.add(inner);
        var light = new THREE.PointLight(0x9c27b0, 2, 200);
        blackHoleMesh.add(light);
        scene3d.add(blackHoleMesh);
    }
    blackHoleMesh.position.set(player.blackHole.x, 5, player.blackHole.y);
    blackHoleMesh.rotation.z += 0.05;
    var s = 0.5 + 0.5 * (player.blackHole.timer / player.blackHole.maxTimer);
    blackHoleMesh.scale.setScalar(s);
}

var lavaZoneMesh = null;

function updateLavaZone3D() {
    if (!player || !player.lavaZone || player.lavaZone.timer <= 0) {
        if (lavaZoneMesh) { scene3d.remove(lavaZoneMesh); lavaZoneMesh = null; }
        return;
    }
    if (!lavaZoneMesh) {
        var radius = player.lavaZone.radius || 120;
        lavaZoneMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(radius, radius, 1, 32),
            new THREE.MeshStandardMaterial({
                color: 0xff5722,
                emissive: 0xff5722,
                emissiveIntensity: 0.5,
                transparent: true,
                opacity: 0.7
            })
        );
        lavaZoneMesh.position.y = 0.5;
        scene3d.add(lavaZoneMesh);
    }
    lavaZoneMesh.position.set(player.lavaZone.x, 0.5, player.lavaZone.y);
    var pulse = 1 + Math.sin(Date.now() / 100) * 0.1;
    lavaZoneMesh.scale.set(pulse, 1, pulse);
}
