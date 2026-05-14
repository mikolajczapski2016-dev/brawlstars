// ============================================================
// ZOMBIE STORY - PANEL POSTACI 3D PREVIEW
// Mini-scena z obracającą się postacią w panelu wyboru
// ============================================================

var previewScene, previewCamera, previewRenderer, previewMesh, previewAnimFrame;
var previewContainer;

function initCharPreview3D() {
    previewContainer = document.getElementById('charPreview3d');
    if (!previewContainer || typeof THREE === 'undefined') return;

    // Jeśli już istnieje — tylko zaktualizuj postać
    if (previewRenderer) {
        updateCharPreview3D();
        return;
    }

    // Scene
    previewScene = new THREE.Scene();
    previewScene.background = new THREE.Color(0x1a1f2e);

    // Kamera
    var w = previewContainer.clientWidth || 200;
    var h = previewContainer.clientHeight || 200;
    previewCamera = new THREE.PerspectiveCamera(40, w / h, 0.1, 500);
    previewCamera.position.set(0, 35, 70);
    previewCamera.lookAt(0, 22, 0);

    // Renderer
    previewRenderer = new THREE.WebGLRenderer({ antialias: true });
    previewRenderer.setSize(w, h);
    previewRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    previewRenderer.shadowMap.enabled = true;
    previewContainer.appendChild(previewRenderer.domElement);

    // Światła
    var ambient = new THREE.AmbientLight(0xffffff, 0.5);
    previewScene.add(ambient);

    var key = new THREE.DirectionalLight(0xffffff, 0.8);
    key.position.set(20, 40, 30);
    key.castShadow = true;
    previewScene.add(key);

    var fill = new THREE.PointLight(0x7c4dff, 0.3, 100);
    fill.position.set(-20, 20, -20);
    previewScene.add(fill);

    // Podłoga
    var floor = new THREE.Mesh(
        new THREE.CylinderGeometry(35, 35, 1, 24),
        new THREE.MeshStandardMaterial({ color: 0x2a3050, roughness: 0.8 })
    );
    floor.position.y = -0.5;
    floor.receiveShadow = true;
    previewScene.add(floor);

    // Postać
    updateCharPreview3D();

    // Animacja
    animateCharPreview3D();
}

function updateCharPreview3D() {
    if (!previewScene) return;
    if (previewMesh) {
        previewScene.remove(previewMesh);
        previewMesh = null;
    }
    var charName = previewCharacter || selectedCharacter || 'Zombie';
    previewMesh = createCharacterMesh(charName, currentSkin || 'default');
    previewMesh.position.set(0, 0, 0);
    previewScene.add(previewMesh);
}

function disposeCharPreview3D() {
    if (previewAnimFrame) {
        cancelAnimationFrame(previewAnimFrame);
        previewAnimFrame = null;
    }
    if (previewRenderer) {
        previewRenderer.dispose();
        if (previewRenderer.domElement && previewRenderer.domElement.parentNode) {
            previewRenderer.domElement.parentNode.removeChild(previewRenderer.domElement);
        }
        previewRenderer = null;
    }
    previewScene = null;
    previewCamera = null;
    previewMesh = null;
}

function animateCharPreview3D() {
    if (!previewRenderer || !previewScene || !previewCamera) return;
    previewAnimFrame = requestAnimationFrame(animateCharPreview3D);

    var time = Date.now() / 1000;

    if (previewMesh) {
        previewMesh.rotation.y = time * 1.5; // obrót wokół własnej osi
        // Subtelne podskakiwanie
        previewMesh.position.y = Math.abs(Math.sin(time * 2)) * 3;
    }

    previewRenderer.render(previewScene, previewCamera);
}
