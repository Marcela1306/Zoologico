import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

console.log("Three.js script started.");

// --- Setup Básico ---
const scene = new THREE.Scene();

// Ajustes de la cámara para mitigar el Z-fighting:
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, 9.0, 0);

const canvasElement = document.getElementById('canvas') as HTMLCanvasElement;
if (!canvasElement) {
    console.error("Error: Elemento canvas con ID 'canvas' no encontrado.");
}
const renderer = new THREE.WebGLRenderer({
    canvas: canvasElement,
    antialias: true,
    logarithmicDepthBuffer: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// --- Controls ---
const controls = new PointerLockControls(camera, document.body);

const blocker = document.getElementById('blocker');
const instructions = document.getElementById('instructions');
const ticketUi = document.getElementById('ticket-ui');
const buyTicketButton = document.querySelector("button");

if (ticketUi) ticketUi.style.display = 'block';

// --- Audio ---
const audioListener = new THREE.AudioListener();
camera.add(audioListener);

const backgroundSound = new THREE.Audio(audioListener);
const audioLoader = new THREE.AudioLoader();
audioLoader.load(
    '/assets/music/upbeat-documentary-116202.mp3',
    (buffer) => {
        backgroundSound.setBuffer(buffer);
        backgroundSound.setLoop(true);
        backgroundSound.setVolume(0.2);
    },
    undefined,
    (err) => console.error('Error al cargar el audio de fondo:', err)
);

// --- Controls Events ---
let unlockedByQ = false;

if (instructions) {
    instructions.addEventListener('click', () => {
        if (audioListener.context.state === 'suspended') {
            audioListener.context.resume();
        }
        controls.lock();
    });
}

controls.addEventListener('lock', () => {
    if (instructions) instructions.style.display = 'none';
    if (blocker) blocker.style.display = 'none';
    unlockedByQ = false;

    if (backgroundSound && !backgroundSound.isPlaying) {
        backgroundSound.play();
    }
});

controls.addEventListener('unlock', () => {
    if (!unlockedByQ) {
        if (instructions) instructions.style.display = '';
        if (blocker) blocker.style.display = 'block';
        if (ticketUi) ticketUi.style.display = 'block';
        portonAbierto = false;
        if (buyTicketButton) buyTicketButton.removeAttribute("disabled");
        
        if (backgroundSound && backgroundSound.isPlaying) {
            backgroundSound.pause();
        }
    }
    unlockedByQ = false;
});

scene.add(controls.getObject());

// --- Keyboard Handling ---
const keys: Record<string, boolean> = {
    KeyW: false,
    KeyA: false,
    KeyS: false,
    KeyD: false,
    KeyQ: false,
    Space: false
};

document.addEventListener('keydown', (event) => {
    if (keys.hasOwnProperty(event.code)) {
        keys[event.code] = true;
    }
    if (event.code === 'KeyQ') {
        if (controls.isLocked) {
            unlockedByQ = true;
            controls.unlock();
        } else {
            if (blocker && blocker.style.display === 'none') {
                controls.lock();
            }
        }
    }
});

document.addEventListener('keyup', (event) => {
    if (keys.hasOwnProperty(event.code)) {
        keys[event.code] = false;
    }
});

// --- Luces ---
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
directionalLight.position.set(5, 10, 5);
directionalLight.castShadow = true;

directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.left = -75;
directionalLight.shadow.camera.right = 75;
directionalLight.shadow.camera.top = 75;
directionalLight.shadow.camera.bottom = -75;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 150;
scene.add(directionalLight);

scene.add(new THREE.AmbientLight(0xffffff, 0.6));

// --- Sky y Ground Textures ---
const textureLoader = new THREE.TextureLoader();

const onTextureError = (url: string, err: any) => {
    console.error(`Error al cargar la textura desde: ${url}`, err);
};

// --- Cielo con Textura (Skybox simulado con una esfera grande) ---
const skyTexture = textureLoader.load(
    'https://images.unsplash.com/photo-1622554364278-d5b2b0c3a84d?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Zm9uZG8lMjBkZSUyMGNpZWxvJTIwYXzxlbnwwfHwwfHx8MA%3D%3D',
    undefined,
    (err) => onTextureError('https://images.unsplash.com/photo-1622554364278-d5b2b0c3a84d?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Zm9uZG8lMjBkZSUyMGNpZWxvJTIwYXzxlbnwwfHwwfHx8MA%3D%3D', err)
);
const skySphere = new THREE.Mesh(
    new THREE.SphereGeometry(1500, 32, 32),
    new THREE.MeshBasicMaterial({ map: skyTexture, side: THREE.BackSide })
);
scene.add(skySphere);

// --- Césped con Textura (Reestructurado para asegurar carga) ---
let ground: THREE.Mesh; // Declaramos 'ground' aquí para que sea accesible globalmente

// Carga la textura de pasto real
textureLoader.load(
    'https://media.istockphoto.com/id/506692747/es/foto/c%C3%A9sped-artificial.jpg?s=612x612&w=0&k=20&c=QbW-vBu7XTDiH_GQ6S5R2s4Xx9lAbfQ055cbozQ1fRs=', // <--- ¡Asegúrate de que esta ruta sea correcta para tu textura!
    (texture) => {
        // Esta función se ejecuta SÓLO cuando la textura ha terminado de cargar.
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(5, 5);
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        texture.colorSpace = THREE.SRGBColorSpace;

        // Ahora creamos y añadimos el ground a la escena una vez que la textura está lista.
        ground = new THREE.Mesh(
            new THREE.PlaneGeometry(500, 1500),
            new THREE.MeshStandardMaterial({
                map: texture, // Usamos la 'texture' que acaba de cargar
                roughness: 0.8,
                metalness: 0.0
            })
        );
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.01;
        ground.receiveShadow = true;
        ground.renderOrder = 0;
        scene.add(ground);
        
        // Opcional: Si tienes un loader manager, podrías indicar aquí que el pasto está cargado.
        console.log("Pasto cargado y añadido a la escena.");

    },
    undefined, // Callback de progreso (no usado aquí)
    (err) => {
        onTextureError('/assets/textures/grass_seamless.jpg', err);
        // Fallback: Si la textura no carga, podrías añadir un plano de color simple
        // para que la escena no quede sin pasto.
        ground = new THREE.Mesh(
            new THREE.PlaneGeometry(800, 800),
            new THREE.MeshStandardMaterial({ color: 0x75a33f }) // Color de pasto por defecto
        );
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.01;
        ground.receiveShadow = true;
        ground.renderOrder = 0;
        scene.add(ground);
        console.warn("Se cargó el pasto con un color de respaldo debido a un error de textura.");
    }
);


// --- Carga de Modelos ---
const gltfLoader = new GLTFLoader();
const objLoader = new OBJLoader();

let porton: THREE.Object3D | null = null;
const portonPivot = new THREE.Group();
let persona: THREE.Object3D | null = null;
let avanzar = true;

const portonTexture = textureLoader.load(
    '/assets/textures/briks_u1_v1.png',
    undefined,
    (err) => onTextureError('/assets/models/briks_u1_v1.png', err)
);

// Cargar hipopotamo GLTF
gltfLoader.load(
  '/assets/models/hippos/scene.gltf',
  (gltf) => {
    const hippo = gltf.scene;
    hippo.scale.set(7, 7, 7);
    hippo.position.set(10, 9, -3);
    hippo.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "hipopotamo";
      
      }
    });
    scene.add(hippo);
  },
  undefined,
  (error) => console.error("Error al cargar hipopotamo:", error)
);
gltfLoader.load(
    '/assets/models/persona/scene.gltf',
    (gltf) => {
        persona = gltf.scene;
        persona.scale.set(0.7, 0.7, 0.7);
        persona.position.set(10, 0, 0);
        persona.rotation.y = Math.PI;
        persona.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                (child as THREE.Mesh).castShadow = true;
                (child as THREE.Mesh).receiveShadow = true;
            }
        });
        scene.add(persona);
    }
);

// --- Control del Portón ---
let portonAbierto = false;
export function abrirPortonDesdeHTML() {
    portonAbierto = true;
    function animar() {
        if (portonPivot.rotation.y > -Math.PI / 2) {
            portonPivot.rotation.y -= 0.02;
            requestAnimationFrame(animar);
        }
    }
    animar();
    const ui = document.getElementById("ticket-ui");
    if (ui) ui.style.display = 'none';
}

// --- Bucle de Animación ---
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    // Movimiento de la cámara (PointerLockControls)
    if (controls.isLocked) {
        const velocity = new THREE.Vector3();
        const direction = new THREE.Vector3();

        direction.z = Number(keys.KeyW) - Number(keys.KeyS);
        direction.x = Number(keys.KeyD) - Number(keys.KeyA);
        direction.normalize();

        if (keys.KeyW || keys.KeyS) velocity.z -= direction.z * 400.0 * delta;
        if (keys.KeyA || keys.KeyD) velocity.x -= direction.x * 400.0 * delta;

        controls.moveRight(-velocity.x * delta);
        controls.moveForward(-velocity.z * delta);

        // Asegurarse de que la cámara no atraviese el suelo
        // Solo podemos acceder a 'ground' si ya ha sido inicializado.
        // Agregamos una verificación para 'ground' antes de usarlo.
        if (ground) { 
            controls.getObject().position.y = Math.max(controls.getObject().position.y, ground.position.y + 0.9);
        } else {
            // Un valor de respaldo si el ground aún no se ha cargado.
            controls.getObject().position.y = Math.max(controls.getObject().position.y, 0.9);
        }
    }

    // Movimiento automático de la persona
    if (persona && avanzar) {
        if (persona.position.x > -1.5) {
            persona.position.x -= 0.03;
        } else {
            avanzar = false;
            const boton = document.querySelector("button");
            if (boton) {
                boton.removeAttribute("disabled");
            }
        }
    }

    // Animación de apertura del portón
    if (portonAbierto && portonPivot.rotation.y > -Math.PI / 2) {
        portonPivot.rotation.y -= 0.02;
    }

    // Mantener cielo centrado con la cámara para un efecto de skybox
    skySphere.position.copy(camera.position);

    renderer.render(scene, camera);
}
animate();

// --- Manejo del Redimensionamiento de la Ventana ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});