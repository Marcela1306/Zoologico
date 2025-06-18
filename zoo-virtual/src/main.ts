import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

console.log("Three.js script started.");

// --- Setup Básico ---
const scene = new THREE.Scene();

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
        backgroundSound.setVolume(0.4);
    },
    undefined,
    (err) => console.error('Error al cargar el audio de fondo:', err)
);

// --- Controls Events 
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
    // Cuando los controles se bloquean (entramos al paseo), ocultamos la pantalla de inicio.
    if (instructions) instructions.style.display = 'none';
    if (blocker) blocker.style.display = 'none';
    unlockedByQ = false;

    if (backgroundSound && !backgroundSound.isPlaying) {
        backgroundSound.play();
    }
    // Ocultamos el panel de info si está abierto 
    const infoPanel = document.getElementById("info-panel");
    if (infoPanel) {
        infoPanel.classList.remove("visible"); 
        infoPanel.style.display = 'none'; 
    }
});

controls.addEventListener('unlock', () => {

    if (!unlockedByQ) { 
        if (instructions) instructions.style.display = ''; // Mostramos las instrucciones
        if (blocker) blocker.style.display = 'block'; // Mostramos el blocker
        
        // Pausamos la música si está sonando al salir
        if (backgroundSound && backgroundSound.isPlaying) {
            backgroundSound.pause();
        }
    }
    unlockedByQ = false; 
});

scene.add(controls.getObject());

// --- Keyboard Handling
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
            // Si el mouse no está bloqueado, al presionar Q lo bloqueamos para volver al juego
            // Asumimos que si estamos presionando Q y no está bloqueado, queremos bloquear.
            controls.lock();
            const infoPanel = document.getElementById("info-panel");
            if (infoPanel) {
                infoPanel.classList.remove("visible");
                infoPanel.style.display = 'none';
            }
        }
    }
});

document.addEventListener('keyup', (event) => {
    if (keys.hasOwnProperty(event.code)) {
        keys[event.code] = false;
    }
});

// --- Luces 
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

// --- Sky y Ground Textures (sin cambios) ---
const textureLoader = new THREE.TextureLoader();

const onTextureError = (url: string, err: any) => {
    console.error(`Error al cargar la textura desde: ${url}`, err);
};

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

let ground: THREE.Mesh; 

const grassTexture = textureLoader.load(
    'https://media.istockphoto.com/id/506692747/es/foto/c%C3%A9sped-artificial.jpg?s=612x612&w=0&k=20&c=QbW-vBu7XTDiH_GQ6S5R2s4Xx9lAbfQ055cbozQ1fRs='
);

grassTexture.wrapS = THREE.RepeatWrapping; 
grassTexture.wrapT = THREE.RepeatWrapping; 
grassTexture.repeat.set(10, 10); 

ground = new THREE.Mesh(
    new THREE.PlaneGeometry(800, 800), 
    new THREE.MeshStandardMaterial({
        map: grassTexture 
    })
);
ground.rotation.x = -Math.PI / 2; 
ground.position.y = -0.01;        
ground.receiveShadow = true;      
scene.add(ground);                

console.log("Césped cargado con textura repetida y sombras.");

// --- Carga de Modelos 
const gltfLoader = new GLTFLoader();

const objetosInteractivos: THREE.Object3D[] = [];

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
        objetosInteractivos.push(mesh); 
      }
    });
    scene.add(hippo);
  },
  undefined,
  (error) => console.error("Error al cargar hipopotamo:", error)
);

gltfLoader.load(
    '/assets/models/leon/scene.gltf', 
    (gltf) => {
        const leon = gltf.scene;
        leon.scale.set(0.1, 0.1, 0.1); 
        leon.position.set(-20, 0, -30); 
        leon.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                mesh.name = "leon"; 
                objetosInteractivos.push(mesh); 
            }
        });
        scene.add(leon);
        console.log("León cargado y añadido a la escena.");
    },
    undefined,
    (error) => console.error("Error al cargar el modelo del león:", error)
);

gltfLoader.load(
    '/assets/models/cocodrilo/scene.gltf', 
    (gltf) => {
        const cocodrilo = gltf.scene;
        cocodrilo.scale.set(5, 5, 5); 
        cocodrilo.position.set(30, 0, -20); 
        cocodrilo.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                mesh.name = "cocodrilo"; 
                objetosInteractivos.push(mesh);
            }
        });
        scene.add(cocodrilo);
        console.log("Cocodrilo cargado y añadido a la escena.");
    },
    undefined,
    (error) => console.error("Error al cargar el modelo del cocodrilo:", error)
);

gltfLoader.load(
    '/assets/models/tigre/scene.gltf', 
    (gltf) => {
        const tigre = gltf.scene;
        tigre.scale.set(0.5, 0.5, 0.5); 
        tigre.position.set(-15, 0, 25); 
        tigre.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                mesh.name = "tigre"; 
                objetosInteractivos.push(mesh);
            }
        });
        scene.add(tigre);
        console.log("Tigre cargado y añadido a la escena.");
    },
    undefined,
    (error) => console.error("Error al cargar el modelo del tigre:", error)
);

gltfLoader.load(
    '/assets/models/mono/scene.gltf', 
    (gltf) => {
        const mono = gltf.scene;
        mono.scale.set(0.3, 0.3, 0.3); 
        mono.position.set(20, 5, 20); 
        mono.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                mesh.name = "Mono"; 
                objetosInteractivos.push(mesh);
            }
        });
        scene.add(mono);
        console.log("Mono cargado y añadido a la escena.");
    },
    undefined,
    (error) => console.error("Error al cargar el modelo del mono:", error)
);


// --- Raycasting para interacciones 
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener("click", (event) => {
    // Si los controles están bloqueados, el clic activa el PointerLockControls
    // Si la cámara no está bloqueada, asumimos que el usuario está en un estado interactivo
    if (controls.isLocked) {
        return; 
    }

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(objetosInteractivos, true);
    
    if (intersects.length > 0) {
        const object = intersects[0].object;
        console.log("Click en:", object.name);
        
        if (object.name === "leon") {
            mostrarInfo("León Africano", "El león es el rey de la sabana africana. Vive en manadas y ruge para comunicarse.", "/assets/images/leon.jpg");
        }
        if (object.name === "cocodrilo") {
            mostrarInfo("Cocodrilo Agua Dulce", "Incluye a catorce especies actuales.​ Se trata de grandes reptiles semiacuáticos que viven en las regiones tropicales");
        }
        if (object.name === "hipopotamo") {
            mostrarInfo("Hipopotamo", "Es un gran mamífero artiodáctilo fundamentalmente herbívoro que habita en el África subsahariana.", "https://upload.wikimedia.org/wikipedia/commons/5/55/Aachen_-_Peanuts-Mural_8.jpg");
        }
        if (object.name === "tigre") {
            mostrarInfo("Tigre Moribundo", "Incluye a catorce especies actuales.​ Se trata de grandes reptiles semiacuáticos que viven en las regiones tropicales");
        }
        if (object.name === "Mono") { 
            mostrarInfo("Mono Yo", "Es un gran mamífero artiodáctilo fundamentalmente herbívoro que habita en el África subsahariana.");
        }
    }
});

// Mostrar información 
function mostrarInfo(titulo: string, descripcion: string, imagenURL?: string) {
    const panel = document.getElementById("info-panel")!;
    const title = document.getElementById("info-title")!;
    const desc = document.getElementById("info-description")!;
    const img = document.getElementById("info-image") as HTMLImageElement;

    title.textContent = titulo;
    desc.textContent = descripcion;

    if (imagenURL) {
        img.src = imagenURL;
        img.style.display = "block";
    } else {
        img.style.display = "none";
    }

    panel.style.display = "block"; 
    setTimeout(() => {
        panel.classList.add("visible");
    }, 10); 
}

// Este evento de cierre del panel 
document.getElementById("close-panel")!.addEventListener("click", (event) => {
    event.stopPropagation(); 

    const panel = document.getElementById("info-panel")!;
    panel.classList.remove("visible"); 

    setTimeout(() => {
        panel.style.display = 'none';
    }, 90); 
});

// --- Bucle de Animación
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();

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

        if (ground) { 
            controls.getObject().position.y = Math.max(controls.getObject().position.y, ground.position.y + 0.9);
        } else {
            controls.getObject().position.y = Math.max(controls.getObject().position.y, 0.9);
        }
    }

    skySphere.position.copy(camera.position);

    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

