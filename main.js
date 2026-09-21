
/* =========================
   ESCENA
========================= */

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x0a0e2a);
scene.fog = new THREE.Fog(0x0a0e2a, 12, 45);

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    120
);

camera.position.set(0, 5, 14);
camera.lookAt(0, 2, 0);


/* =========================
   TEXTURA CIRCULAR (estrellas/luciérnagas)
========================= */

function makeCircleTexture(color) {
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(
        size / 2, size / 2, 0,
        size / 2, size / 2, size / 2
    );
    grad.addColorStop(0,   color);
    grad.addColorStop(0.4, color);
    grad.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(canvas);
}

const starTexture      = makeCircleTexture('rgba(255,255,255,1)');
const fireflyTexture   = makeCircleTexture('rgba(255,238,100,1)');


/* =========================
   AJUSTE RESPONSIVE CÁMARA
========================= */

// Valores base que el loop de animación lee cada frame
let camBaseY  = 5;
let camBaseZ  = 14;
let camLookAt = new THREE.Vector3(0, 2, -3);

function updateCamera() {
    const aspect = window.innerWidth / window.innerHeight;

    if (aspect < 1) {
        camera.fov = 70;
        camBaseY  = 7;
        camBaseZ  = 12;
        camLookAt.set(0, 1.5, -5);
        if (renderer) renderer.shadowMap.enabled = false;
    } else {
        camera.fov = 60;
        camBaseY  = 5;
        camBaseZ  = 14;
        camLookAt.set(0, 2, -3);
        if (renderer) renderer.shadowMap.enabled = true;
    }

    camera.position.set(0, camBaseY, camBaseZ);
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
}

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.body.appendChild(renderer.domElement);

// Llamar DESPUÉS de que renderer existe
updateCamera();



/* =========================
   LUCES
========================= */

const ambientLight =
    new THREE.AmbientLight(0x4466aa, 1.1);

scene.add(ambientLight);

const sun =
    new THREE.DirectionalLight(0x8899cc, 1.6);

sun.position.set(10, 18, 10);
sun.castShadow = true;
sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 50;
sun.shadow.camera.left = -25;
sun.shadow.camera.right = 25;
sun.shadow.camera.top = 25;
sun.shadow.camera.bottom = -25;
sun.shadow.bias = -0.001;

scene.add(sun);

const moonGlow =
    new THREE.PointLight(0xffeebb, 1.4, 40);

moonGlow.position.set(0, 7, 2);

scene.add(moonGlow);


/* =========================
   SUELO
========================= */

const groundGeometry =
    new THREE.PlaneGeometry(250, 250);

const groundMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x142810,
        roughness: 1
    });

const ground =
    new THREE.Mesh(
        groundGeometry,
        groundMaterial
    );

ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;

scene.add(ground);


/* =========================
   MATERIALES
========================= */

const stemMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x267326
    });

const petalMaterial =
    new THREE.MeshStandardMaterial({
        color: 0xffd900,
        emissive: 0xffa500,
        emissiveIntensity: 0.25,
        roughness: 0.6,
        side: THREE.DoubleSide
    });

const centerMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x8b4b12,
        roughness: 0.8
    });


/* =========================
   GEOMETRÍAS COMPARTIDAS
========================= */

const sharedPetalGeometry =
    new THREE.SphereGeometry(0.28, 12, 8);
sharedPetalGeometry.scale(0.55, 1.3, 0.25);

const sharedCenterGeometry =
    new THREE.SphereGeometry(0.22, 16, 16);


/* =========================
   CREAR FLOR
========================= */

function createFlower(x, z, scale = 1) {

    const flower = new THREE.Group();

    /* TALLO */

    const height =
        0.8 + Math.random() * 3.0;

    const stemGeometry =
        new THREE.CylinderGeometry(
            0.035,
            0.055,
            height,
            8
        );

    const stem =
        new THREE.Mesh(
            stemGeometry,
            stemMaterial
        );

    stem.position.y = height / 2;

    flower.add(stem);


    /* CABEZA */

    const head =
        new THREE.Group();

    head.position.y = height;


    /* PÉTALOS */

    const petals = 10;

    for (let i = 0; i < petals; i++) {

        const petal =
            new THREE.Mesh(
                sharedPetalGeometry,
                petalMaterial
            );

        const angle =
            (i / petals) *
            Math.PI * 2;

        petal.position.set(
            Math.cos(angle) * 0.32,
            Math.sin(angle) * 0.32,
            0
        );

        petal.rotation.z =
            angle - Math.PI / 2;

        petal.castShadow = true;

        head.add(petal);
    }


    /* CENTRO */

    const center =
        new THREE.Mesh(
            sharedCenterGeometry,
            centerMaterial
        );

    center.position.z = 0.12;
    center.castShadow = true;

    head.add(center);


    /* ORIENTAR HACIA CÁMARA */

    head.rotation.x = -0.2;

    flower.add(head);


    /* POSICIÓN */

    flower.position.set(x, 0, z);

    flower.scale.set(0, 0, 0);

    flower.userData = {
        targetScale: scale,
        speed: 0.015 + Math.random() * 0.02,
        wind: Math.random() * Math.PI * 2
    };

    scene.add(flower);

    return flower;
}


/* =========================
   CAMPO DE FLORES
========================= */

const flowers = [];

const amount = 260;

for (let i = 0; i < amount; i++) {

    // Distribución más compacta
    const z = -18 + Math.random() * 24; // rango z más corto
    const spreadX = 14 + (14 - z) * 0.65; // más estrecho
    const x = (Math.random() - 0.5) * spreadX;

    // 30% flores grandes, 70% pequeñas → mezcla variada
    const scale = Math.random() < 0.3
        ? 0.6 + Math.random() * 0.35   // grande: 0.60–0.95
        : 0.18 + Math.random() * 0.32; // pequeña: 0.18–0.50

    const flower =
        createFlower(x, z, scale);

    flowers.push(flower);
}


/* =========================
   ESTRELLAS
========================= */

const starCount = 600;

const starGeometry =
    new THREE.BufferGeometry();

const starPositions =
    new Float32Array(starCount * 3);

for (let i = 0; i < starCount; i++) {
    starPositions[i * 3] =
        (Math.random() - 0.5) * 140;
    starPositions[i * 3 + 1] =
        8 + Math.random() * 45;
    starPositions[i * 3 + 2] =
        (Math.random() - 0.5) * 140;
}

starGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(
        starPositions,
        3
    )
);

const starMaterial =
    new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.5,
        map: starTexture,
        transparent: true,
        alphaTest: 0.05,
        opacity: 0.9,
        depthWrite: false
    });

const stars =
    new THREE.Points(
        starGeometry,
        starMaterial
    );

scene.add(stars);


/* =========================
   LUCIÉRNAGAS ✨
========================= */

const particleCount = 200;

const particleGeometry =
    new THREE.BufferGeometry();

const positions =
    new Float32Array(
        particleCount * 3
    );

for (let i = 0; i < particleCount; i++) {

    positions[i * 3] =
        (Math.random() - 0.5) * 55;

    positions[i * 3 + 1] =
        0.4 + Math.random() * 6;

    positions[i * 3 + 2] =
        -20 + Math.random() * 32;
}

particleGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(
        positions,
        3
    )
);

const particleMaterial =
    new THREE.PointsMaterial({
        color: 0xffee66,
        size: 0.4,
        map: fireflyTexture,
        transparent: true,
        alphaTest: 0.05,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

const particles =
    new THREE.Points(
        particleGeometry,
        particleMaterial
    );

scene.add(particles);


/* =========================
   ANIMACIÓN
========================= */

const clock =
    new THREE.Clock();

/* =========================
   CONTROL DE ENTRADA
========================= */

let animationStarted = false;
let startTime = 0;

const btnEntrar = document.getElementById('btn-entrar');
const introScreen = document.getElementById('intro-screen');
const dedicatoria = document.getElementById('dedicatoria');
const bgMusic = document.getElementById('bg-music');
const btnMusica = document.getElementById('btn-musica');
const musicaIcono = document.getElementById('musica-icono');

function typeWriter(element, text, speed) {
    return new Promise(resolve => {
        let i = 0;
        element.textContent = '';
        const timer = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(timer);
                resolve();
            }
        }, speed);
    });
}

async function escribirDedicatoria() {
    const dedTitulo = document.getElementById('ded-titulo');
    const dedLinea1 = document.getElementById('ded-linea1');
    const dedLinea2 = document.getElementById('ded-linea2');

    if (dedTitulo) {
        await typeWriter(dedTitulo, "Pa ti:", 70);
        await new Promise(r => setTimeout(r, 350));
    }
    if (dedLinea1) {
        await typeWriter(dedLinea1, "Por ser linda, guapa y única.", 45);
        await new Promise(r => setTimeout(r, 400));
    }
    if (dedLinea2) {
        await typeWriter(dedLinea2, "Como te mereces el mundo entero, empecé por este jardín 💛", 40);
    }
}

if (btnEntrar) {
    btnEntrar.addEventListener('click', () => {
        animationStarted = true;
        startTime = clock.getElapsedTime();

        // Reproducir música tras la interacción del usuario
        if (bgMusic) {
            bgMusic.play().catch(err => {
                console.log("Autoplay prevenido por navegador:", err);
            });
        }

        if (introScreen) {
            introScreen.classList.add('fade-out');
            setTimeout(() => {
                introScreen.style.display = 'none';
            }, 1200);
        }
        if (dedicatoria) {
            setTimeout(() => {
                dedicatoria.classList.add('visible');
                escribirDedicatoria();
            }, 700);
        }
        if (btnMusica) {
            setTimeout(() => {
                btnMusica.classList.remove('oculto');
            }, 1000);
        }
    });
}

// Control manual de música (pausar / reanudar)
if (btnMusica && bgMusic && musicaIcono) {
    btnMusica.addEventListener('click', () => {
        if (bgMusic.paused) {
            bgMusic.play();
            musicaIcono.textContent = '🔊';
        } else {
            bgMusic.pause();
            musicaIcono.textContent = '🔇';
        }
    });
}

function animate() {

    requestAnimationFrame(animate);

    const rawTime = clock.getElapsedTime();


    /* FLORES CRECIENDO — solo se activan cuando el usuario hace clic */

    if (animationStarted) {
        const growthTime = rawTime - startTime;

        flowers.forEach((flower, index) => {

            const delay    = index * 0.04;   // ola progresiva
            const duration = 2.2;            // duración de florecimiento
            const elapsed  = Math.max(0, growthTime - delay);
            const t        = Math.min(1, elapsed / duration);

            // Ease-out cúbico
            const eased = 1 - Math.pow(1 - t, 3);
            const value = flower.userData.targetScale * eased;

            flower.scale.setScalar(value);


            /* VIENTO */

            if (t > 0.6) {
                const windStrength = (t - 0.6) / 0.4;
                flower.rotation.z =
                    Math.sin(growthTime * 1.5 + flower.userData.wind) * 0.025 * windStrength;
                flower.rotation.x =
                    Math.cos(growthTime      + flower.userData.wind) * 0.015 * windStrength;
            } else {
                flower.rotation.z = 0;
                flower.rotation.x = 0;
            }

        });
    }


    /* ESTRELLAS TITILANDO */

    starMaterial.opacity =
        0.6 + Math.sin(rawTime * 2) * 0.3;


    /* LUCIÉRNAGAS */

    particles.rotation.y =
        rawTime * 0.015;

    particles.position.y =
        Math.sin(rawTime * 0.3) * 0.4;

    particleMaterial.opacity =
        0.4 + Math.sin(rawTime * 3) * 0.5;


    /* MOVIMIENTO SUAVE CÁMARA */

    camera.position.x =
        Math.sin(rawTime * 0.08) * 2;

    camera.position.y = camBaseY;
    camera.position.z = camBaseZ;

    camera.lookAt(camLookAt);


    renderer.render(
        scene,
        camera
    );
}

animate();


/* =========================
   RESPONSIVE
========================= */

window.addEventListener(
    'resize',
    () => {

        updateCamera();

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

    }
);
