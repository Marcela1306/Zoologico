import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

console.log("Three.js script started.");

// --- Setup Básico ---
const scene = new THREE.Scene();


//modelo de las jaulas
const gltfLoader = new GLTFLoader();

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

// Objeto para almacenar los sonidos de los animales
const animalSounds: { [key: string]: THREE.Audio } = {};

// Función para cargar un sonido de animal
function loadAnimalSound(name: string, path: string, volume: number = 1.0) {
    const sound = new THREE.Audio(audioListener);
    audioLoader.load(
        path,
        (buffer) => {
            sound.setBuffer(buffer);
            sound.setLoop(false); // No queremos que los sonidos de animales se repitan
            sound.setVolume(volume);
            animalSounds[name] = sound; // Almacenamos el sonido en el objeto
            console.log(`Sonido de ${name} cargado.`);
        },
        undefined,
        (err) => console.error(`Error al cargar el sonido de ${name} desde: ${path}`, err)
    );
}

// Cargar los sonidos de cada animal 
loadAnimalSound('leon', '/assets/music/lion-roar.mp3', 0.8); // ruta y volumen
loadAnimalSound('cocodrilo', '/music/sounds/alligator-hiss.mp3', 0.7);
loadAnimalSound('hipopotamo', '/music/sounds/hippo-sound.mp3', 0.9);
loadAnimalSound('tigre', '/assets/music/tiger-roar.mp3', 0.8);
loadAnimalSound('Cabra', '/assets/music/goat-bleat.mp3', 0.6);
loadAnimalSound('Venado', '/assets/music/deer-bellow.mp3', 0.6);
loadAnimalSound('Venadobebe', '/assets/music/fawn-bleat.mp3', 0.5);


// --- Controls Events

let unlockedByQ = false;

if (instructions) {
    instructions.addEventListener('click', () => {
        
        if (audioListener.context.state === 'suspended') {
            audioListener.context.resume();
        }

        controls.getObject().position.set(5, 10, 150); // donde inicia la camara despues de el click para empezar el paseo

        controls.lock();
    });
}

//inicio
controls.addEventListener('lock', () => {
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
            // Si el mouse no está bloqueado, al presionar Q lo bloqueamos para volver al paseo
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

// --- Sky y Ground Textures   ---

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

const mixers: THREE.AnimationMixer[] = []; //para ver el movimiento de modelos 3d 

// --- Carga de Modelos
// --- Cargar modelo de Portón (GATE) ---
gltfLoader.load(
    '/assets/models/porton1.gltf', 
    (gltf) => {
        const gate = gltf.scene;
        
        // Escala (ajusta si es necesario)
        gate.scale.set(1, 1, 1); 
        
       
        gate.position.set(-50, -1, 70); 
        
        
        gate.rotation.y = Math.PI / 2 + Math.PI; 
        
        gate.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                mesh.name = "porton"; 
            }
        });
        scene.add(gate);
        console.log("Portón cargado.");
    },
    undefined,
    (error) => console.error("Error al cargar el portón:", error)
);

// Declara la variable 'caseta' fuera de la función de carga si aún no lo has hecho
let caseta: THREE.Object3D | null = null;
const ticketScreen = document.getElementById('ticketScreen');
const buyTicketButton = document.getElementById('buyTicketButton');
const activationDistance = 30;


// --- Cargar modelo de Caseta ---
gltfLoader.load(
    '/assets/models/kiosko/Kiosko.gltf',
    (gltf) => {
        caseta = gltf.scene; 
        
        caseta.scale.set(5, 5, 5); 
        caseta.position.set(30, 0, 95); 
        
       
        caseta.rotation.y = -Math.PI / 2; 

        caseta.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                mesh.name = "caseta"; 
            }
        });
        scene.add(caseta);
        console.log("Caseta cargada.");
    },
    undefined,
    (error) => console.error("Error al cargar la caseta:", error)
);
//jaulas y estructura interna (en posicion)
gltfLoader.load('public/assets/models/modelo.glb', (gltf) => {
    const model = gltf.scene;
    console.log('Modelo cargado:', model); 

    model.scale.set(2, 2, 2); 
    model.position.set(90, 9, 30); 

    scene.add(model); 
}, undefined, (error) => {
    console.error("Error al cargar modelo modificacion.glb:", error);
});

const objetosInteractivos: THREE.Object3D[] = [];

// Cargar león GLTF (ya en posición)
gltfLoader.load(
  '/assets/models/lionesmom/scene.gltf',
  (gltf) => {
    const leon = gltf.scene;
    leon.scale.set(6, 6, 6);
    leon.position.set(-100, 2, -50); //x para derecha, izquierda. Y para arriba abajo. Z adelante, atras
    leon.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "leon";
        objetosInteractivos.push(mesh);
      }
    });
    //  Agregar animación 
    if (gltf.animations && gltf.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(leon);
      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.play();
      });
      mixers.push(mixer); //mixer para guardar la animación
    }
    scene.add(leon);
  },
  undefined,
  (error) => console.error("Error al cargar león:", error)
);

gltfLoader.load(
  '/assets/models/lionesmom/scene.gltf',
  (gltf) => {
    const leon1 = gltf.scene;
    leon1.scale.set(6, 6, 6);
    leon1.position.set(-90, 2, -60); 
    leon1.rotation.y = Math.PI / 2;
    leon1.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "leon";
        objetosInteractivos.push(mesh);
      }
    });
    //  Agregar animación 
    if (gltf.animations && gltf.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(leon1);
      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.play();
      });
      mixers.push(mixer); 
    }
    
    scene.add(leon1);
  },
  undefined,
  (error) => console.error("Error al cargar león:", error)
);


// Cargar cerdo GLTF (ya en posición)
gltfLoader.load(
  '/assets/models/pig/scene.gltf',
  (gltf) => {
    const pig = gltf.scene;
    pig.scale.set(13, 13, 13);
    pig.position.set(-120, 1, -130);
    pig.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "pig";
        objetosInteractivos.push(mesh);
      }
    });
    scene.add(pig);
  },
  undefined,
  (error) => console.error("Error al cargar cerdo:", error)
);


// Cargar cerdo GLTF (ya en posición)
gltfLoader.load(
  '/assets/models/piglet/scene.gltf',
  (gltf) => {
    const piglet = gltf.scene;
    piglet.scale.set(1, 1, 1);
    piglet.position.set(-110, 1, -110);
    piglet.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "piglet";
        objetosInteractivos.push(mesh);
      }
    });

    //  Agregar animación 
    if (gltf.animations && gltf.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(piglet);
      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.play();
      });
      mixers.push(mixer); //mixer para guardar la animación
    }
    scene.add(piglet);
  },
  undefined,
  (error) => console.error("Error al cargar cocodrilo:", error)
);

// Cargar cerdo GLTF (ya en posición)
gltfLoader.load(
  '/assets/models/piglet/scene.gltf',
  (gltf) => {
    const piglet = gltf.scene;
    piglet.scale.set(1, 1, 1);
    piglet.position.set(-100, 1, -120);
    piglet.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "piglet";
        objetosInteractivos.push(mesh);
      }
    });

    //  Agregar animación 
    if (gltf.animations && gltf.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(piglet);
      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.play();
      });
      mixers.push(mixer); //mixer para guardar la animación
    }
    scene.add(piglet);
  },
  undefined,
  (error) => console.error("Error al cargar cocodrilo:", error)
);

// Cargar hipopotamo GLTF (ya en posición)
gltfLoader.load(
  '/assets/models/hipposs/scene.gltf',
  (gltf) => {
    const hippo = gltf.scene;
    hippo.scale.set(0.2, 0.2, 0.2);
    hippo.position.set(70, 8, -135);
    hippo.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "hipopotamo";
        objetosInteractivos.push(mesh);
      }
    });
    //  Agregar animación 
    if (gltf.animations && gltf.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(hippo);
      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.play();
      });
      mixers.push(mixer); //mixer para guardar la animación
    }
    scene.add(hippo);
  },
  undefined,
  (error) => console.error("Error al cargar hipopotamo:", error)
);

// Cargar tigre GLTF (ya en posición)
gltfLoader.load(
  '/assets/models/tiger/scene.gltf',
  (gltf) => {
    const tiger = gltf.scene;
    tiger.scale.set(7, 7, 7);
    tiger.position.set(-100, 3, -1);
    tiger.rotation.y = Math.PI / 2; // Gira 90 grados sobre el eje Y
    tiger.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "tigre";
        objetosInteractivos.push(mesh);
      }
    });
    scene.add(tiger);
  },
  undefined,
  (error) => console.error("Error al cargar tigre:", error)
);

// Cargar mono GLTF (ya en posición)
gltfLoader.load(
  '/assets/models/antelope/scene.gltf',
  (gltf) => {
    const antelope = gltf.scene;
    antelope.scale.set(7, 7, 7);
    antelope.position.set(40, 4, 25);
    antelope.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "antelope";
        objetosInteractivos.push(mesh);
      }
    });

    //  Agregar animación 
    if (gltf.animations && gltf.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(antelope);
      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.play();
      });
      mixers.push(mixer); //mixer para guardar la animación
    }
    scene.add(antelope);
  },
  undefined,
  (error) => console.error("Error al cargar antelope:", error)
);

// Cargar mono GLTF (ya en posición)
gltfLoader.load(
  '/assets/models/antelope/scene.gltf',
  (gltf) => {
    const antelope = gltf.scene;
    antelope.scale.set(7, 7, 7);
    antelope.position.set(35, 4, 40);
    antelope.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "antelope";
        objetosInteractivos.push(mesh);
      }
    });

    //  Agregar animación 
    if (gltf.animations && gltf.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(antelope);
      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.play();
      });
      mixers.push(mixer); //mixer para guardar la animación
    }
    scene.add(antelope);
  },
  undefined,
  (error) => console.error("Error al cargar antelope:", error)
);


// Cargar venado GLTF (ya en posición)
gltfLoader.load(
  '/assets/models/little_buck_2.0/scene.gltf',
  (gltf) => {
    const venado = gltf.scene;
    venado.scale.set(1, 1, 1);
    venado.position.set(-20, 2, -30);
    venado.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "Venado";
        objetosInteractivos.push(mesh);
      }
    });
    scene.add(venado);
  },
  undefined,
  (error) => console.error("Error al cargar venado:", error)
);

// Cargar venado bebe GLTF (ya en posición)
gltfLoader.load(
  '/assets/models/kitzreh_4.0/scene.gltf',
  (gltf) => {
    const venadob = gltf.scene;
    venadob.scale.set(9, 9, 9);
    venadob.position.set(-10, 2, -30);
    venadob.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "Venadobebe";
        objetosInteractivos.push(mesh);
      }
    });
    scene.add(venadob);
  },
  undefined,
  (error) => console.error("Error al cargar venado:", error)
);

// Cargar venado bebe GLTF (ya en posición)
gltfLoader.load(
  '/assets/models/kitzreh_4.0/scene.gltf',
  (gltf) => {
    const venadob1 = gltf.scene;
    venadob1.scale.set(9, 9, 9);
    venadob1.position.set(-25, 2, -20);
    venadob1.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "Venadobebe";
        objetosInteractivos.push(mesh);
      }
    });
    scene.add(venadob1);
  },
  undefined,
  (error) => console.error("Error al cargar venado:", error)
);



// Cargar cabra GLTF (ya en posición)
gltfLoader.load(
  '/assets/models/goat/scene.gltf',
  (gltf) => {
    const goat = gltf.scene;
    goat.scale.set(4, 4, 4);
    goat.position.set(-10, 2, -120);
    goat.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "Cabra";
        objetosInteractivos.push(mesh);
      }
    });
    scene.add(goat);
  },
  undefined,
  (error) => console.error("Error al cargar cabra:", error)
);

// Modelo oveja 
gltfLoader.load(
  '/assets/models/sheep/scene.gltf',
  (gltf) => {
    const sheep = gltf.scene;
    sheep.scale.set(8, 8, 8);
    sheep.position.set(-10, 2, -90); //x para derecha, izquierda. Y para arriba abajo. Z adelante, atras
    sheep.rotation.y = Math.PI / 2; // Gira 90 grados sobre el eje Y
    sheep.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "sheep";
        objetosInteractivos.push(mesh);
      }
    });
    //  Agregar animación 
    if (gltf.animations && gltf.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(sheep);
      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.play();
      });
      mixers.push(mixer); //mixer para guardar la animación
    }
    
    scene.add(sheep);
  },
  undefined,
  (error) => console.error("Error al cargar oveja:", error)
);

// Modelo oveja 
gltfLoader.load(
  '/assets/models/sheep/scene.gltf',
  (gltf) => {
    const sheep1 = gltf.scene;
    sheep1.scale.set(8, 8, 8);
    sheep1.position.set(-20, 2, -120); //x para derecha, izquierda. Y para arriba abajo. Z adelante, atras
    sheep1.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "sheep";
        objetosInteractivos.push(mesh);
      }
    });
    //  Agregar animación 
    if (gltf.animations && gltf.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(sheep1);
      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.play();
      });
      mixers.push(mixer); //mixer para guardar la animación
    }
    
    scene.add(sheep1);
  },
  undefined,
  (error) => console.error("Error al cargar león:", error)
);


// Cargar aves GLTF (ya en posición)
gltfLoader.load(
  '/assets/models/bird/scene.gltf',
  (gltf) => {
    const bird = gltf.scene;
    bird.scale.set(1, 1, 1);
    bird.position.set(80, 4, 50);
    bird.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "birds";
        objetosInteractivos.push(mesh);
      }
    });
    //  Agregar animación 
    if (gltf.animations && gltf.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(bird);
      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.play();
      });
      mixers.push(mixer); //mixer para guardar la animación
    }
    scene.add(bird);
  },
  undefined,
  (error) => console.error("Error al cargar pajaro:", error)
);

// Cargar aves GLTF (ya en posición)
gltfLoader.load(
  '/assets/models/birds/scene.gltf',
  (gltf) => {
    const birds = gltf.scene;
    birds.scale.set(2, 2, 2);
    birds.position.set(80, 10, 30);
    birds.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "bird";
        objetosInteractivos.push(mesh);
      }
    });
    //  Agregar animación 
    if (gltf.animations && gltf.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(birds);
      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.play();
      });
      mixers.push(mixer); //mixer para guardar la animación
    }
    scene.add(birds);
  },
  undefined,
  (error) => console.error("Error al cargar pajaro:", error)
);

// Cargar bengal GLTF (ya en posición)
gltfLoader.load(
  '/assets/models/bengal_cat/scene.gltf',
  (gltf) => {
    const cat = gltf.scene;
    cat.scale.set(4, 4, 4);
    cat.position.set(100, 5, 30);
    cat.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "cat";
        objetosInteractivos.push(mesh);
      }
    });
    //  Agregar animación 
    if (gltf.animations && gltf.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(cat);
      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.play();
      });
      mixers.push(mixer); //mixer para guardar la animación
    }
    scene.add(cat);
  },
  undefined,
  (error) => console.error("Error al cargar gato:", error)
);

// Cargar aves GLTF (ya en posición)
gltfLoader.load(
  '/assets/models/bengal_cat/scene.gltf',
  (gltf) => {
    const cat = gltf.scene;
    cat.scale.set(4, 4, 4);
    cat.position.set(100, 5, 40);
    cat.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "cat";
        objetosInteractivos.push(mesh);
      }
    });
    //  Agregar animación 
    if (gltf.animations && gltf.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(cat);
      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.play();
      });
      mixers.push(mixer); //mixer para guardar la animación
    }
    scene.add(cat);
  },
  undefined,
  (error) => console.error("Error al cargar gato:", error)
);

// Cargar cafeteria GLTF (ya en posición)
gltfLoader.load(
  '/assets/models/cafeteria_salle/scene.gltf',
  (gltf) => {
    const cafeteria = gltf.scene;
    cafeteria.scale.set(1.7, 1.7, 1.7);
    cafeteria.position.set(79, 8, -14);
    
    cafeteria.rotation.y = Math.PI / -2; // Gira 90 grados sobre el eje Y


    cafeteria.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "Cafe";
        objetosInteractivos.push(mesh);
      }
    });
    scene.add(cafeteria);
  },
  undefined,
  (error) => console.error("Error al cargar cafeteria:", error)
);

// Cargar baño (ya en posición)
gltfLoader.load(
  '/assets/models/bathroom/scene.gltf',
  (gltf) => {
    const bathroom = gltf.scene;
    bathroom.scale.set(1.5, 1.5, 1.5);
    bathroom.position.set(67, 5, -80);
    
    bathroom.rotation.y = Math.PI / 2; // Gira 90 grados sobre el eje Y


    bathroom.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "Cafe";
        objetosInteractivos.push(mesh);
      }
    });
    scene.add(bathroom);
  },
  undefined,
  (error) => console.error("Error al cargar cabra:", error)
);

//bancas
gltfLoader.load(
  '/assets/models/bancacir/scene.gltf',
  (gltf) => {
    const banca = gltf.scene;
    banca.scale.set(1, 1, 1);
    banca.position.set(30, 3, -30);
    banca.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "banca";
        objetosInteractivos.push(mesh);
      }
    });
    scene.add(banca);
  },
  undefined,
  (error) => console.error("Error al cargar banca:", error)
);

gltfLoader.load(
  '/assets/models/bancacir/scene.gltf',
  (gltf) => {
    const banca1 = gltf.scene;
    banca1.scale.set(1, 1, 1);
    banca1.position.set(-100, 3, 50);
    banca1.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "banca1";
        objetosInteractivos.push(mesh);
      }
    });
    scene.add(banca1);
  },
  undefined,
  (error) => console.error("Error al cargar banca:", error)
);

gltfLoader.load(
  '/assets/models/tables/scene.gltf',
  (gltf) => {
    const tables = gltf.scene;
    tables.scale.set(18, 18, 18);
    tables.position.set(-70, 2, -100);
    tables.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "bancas";
        objetosInteractivos.push(mesh);
      }
    });
    scene.add(tables);
  },
  undefined,
  (error) => console.error("Error al cargar banca:", error)
);

gltfLoader.load(
  '/assets/models/tables/scene.gltf',
  (gltf) => {
    const tables1 = gltf.scene;
    tables1.scale.set(18, 18, 18);
    tables1.position.set(-70, 2, -40);
    tables1.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "bancas";
        objetosInteractivos.push(mesh);
      }
    });
    scene.add(tables1);
  },
  undefined,
  (error) => console.error("Error al cargar banca:", error)
);
// DECORACIÓN NATURALEZA
gltfLoader.load(
  '/assets/models/afrutal/scene.gltf',
  (gltf) => {
    const afrutal = gltf.scene;
    afrutal.scale.set(5, 5, 5);
    afrutal.position.set(-120, 3, 50);
    afrutal.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "afrutal";
        objetosInteractivos.push(mesh);
      }
    });
    scene.add(afrutal);
  },
  undefined,
  (error) => console.error("Error al cargar banca:", error)
);

gltfLoader.load(
  '/assets/models/afrutal/scene.gltf',
  (gltf) => {
    const afrutal1 = gltf.scene;
    afrutal1.scale.set(5, 5, 5);
    afrutal1.position.set(40, 8, -135);
    afrutal1.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "afrutal1";
        objetosInteractivos.push(mesh);
      }
    });
    scene.add(afrutal1);
  },
  undefined,
  (error) => console.error("Error al cargar afrutal1:", error)
);

gltfLoader.load(
  '/assets/models/arbol/scene.gltf',
  (gltf) => {
    const arbol = gltf.scene;
    arbol.scale.set(5, 5, 5);
    arbol.position.set(-100, 3, -40);
    arbol.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "arbol";
        objetosInteractivos.push(mesh);
      }
    });
    scene.add(arbol);
  },
  undefined,
  (error) => console.error("Error al cargar arbol:", error)
);

gltfLoader.load(
  '/assets/models/arbole/scene.gltf',
  (gltf) => {
    const arbole = gltf.scene;
    arbole.scale.set(0.5, 0.5, 0.5);
    arbole.position.set(100, 5, 40);
    arbole.rotation.y = Math.PI / 2; // Gira 90 grados sobre el eje Y

    arbole.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "arbole";
        objetosInteractivos.push(mesh);
      }
    });
    scene.add(arbole);
  },
  undefined,
  (error) => console.error("Error al cargar arbol:", error)
);

gltfLoader.load(
  '/assets/models/arbole/scene.gltf',
  (gltf) => {
    const arboles = gltf.scene;
    arboles.scale.set(0.5, 0.5, 0.5);
    arboles.position.set(10, 6, -170);
    arboles.rotation.y = Math.PI / 2; // Gira 90 grados sobre el eje Y

    arboles.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "arboles";
        objetosInteractivos.push(mesh);
      }
    });
    scene.add(arboles);
  },
  undefined,
  (error) => console.error("Error al cargar arboles:", error)
);

gltfLoader.load(
  '/assets/models/rocas/scene.gltf',
  (gltf) => {
    const rocas = gltf.scene;
    rocas.scale.set(5, 5, 5);
    rocas.position.set(-115, 3, 10);
    rocas.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "afrutal";
        objetosInteractivos.push(mesh);
      }
    });
    scene.add(rocas);
  },
  undefined,
  (error) => console.error("Error al cargar arbol:", error)
);



gltfLoader.load(
  '/assets/models/rocas/scene.gltf',
  (gltf) => {
    const rocas1 = gltf.scene;
    rocas1.scale.set(5, 5, 5);
    rocas1.position.set(-115, 3, -60);
    rocas1.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "roca1";
        objetosInteractivos.push(mesh);
      }
    });
    scene.add(rocas1);
  },
  undefined,
  (error) => console.error("Error al cargar roca", error)
);

// --- Raycasting para interacciones
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener("click", (event) => {
    // Si los controles están bloqueados, el clic activa el PointerLockControls

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
        
        // **NUEVO: Lógica para reproducir el sonido del animal**
        if (animalSounds[object.name] && !animalSounds[object.name].isPlaying) {
            animalSounds[object.name].play();
        }
if (object.name === "leon") {
      mostrarInfo("León Africano", "El león es el rey de la sabana africana. Vive en manadas y ruge para comunicarse.", "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Lion_waiting_in_Namibia.jpg/640px-Lion_waiting_in_Namibia.jpg");
    }
    if (object.name === "piglet") {
      mostrarInfo("Cerdo", "Es un animal doméstico usado en la alimentación humana por muchos pueblos", "https://www.animanaturalis.org/img/pages/full/202005/P27-11697.jpg");
    }
    if (object.name === "pig") {
      mostrarInfo("Cerdo", "Es un animal doméstico usado en la alimentación humana por muchos pueblos", "https://www.animanaturalis.org/img/pages/full/202005/P27-11697.jpg");
    }
    if (object.name == "hipopotamo") {
      mostrarInfo("Hipopotamo", "Es un gran mamífero artiodáctilo fundamentalmente herbívoro que habita en el África subsahariana.", "https://concepto.de/wp-content/uploads/2021/07/hipopotamo-e1626653651667-800x400.jpg");
    }
    if (object.name === "tigre") {
      mostrarInfo("Tigre", "es el felino más grande del mundo, conocido por su distintivo pelaje anaranjado con rayas negras, que son únicas para cada individuo", "https://www.medioambiente.net/wp-content/uploads/tigre3.jpg");
    }
    if (object.name == "bird") {
      mostrarInfo("Perico", "El perico o periquito común es un ave colorida considerada como un tipo de loro, siendo así la especie más pequeña de estos animales", "https://www.zoobioparqueamaru.com/nos-animaux/aves/28-zoo-cuenca.jpg");
    }
    if (object.name == "Cabra") {
      mostrarInfo("Cabra", "es un mamífero artiodáctilo, rumiante y herbívoro, conocido por su agilidad, capacidad de escalar y adaptación a diversos entornos, incluyendo zonas montañosas", "https://s3.animalia.bio/animals/photos/full/original/chc3a8vre-naine-rouan.webp");
    }
    if (object.name == "Venado") {
      mostrarInfo("Ciervo", "Son animales herbívoros, con un cuerpo delgado y robusto, y pueden variar considerablemente en tamaño y coloración dependiendo de la especie", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7eLyTg7mTPuwBVCfF2Xy224bPCBmfajHwwQ&s");
    }
    if (object.name == "Venadobebe") {
      mostrarInfo("Venado", "Los venados son animales esbeltos y bien proporcionados, con patas largas y delgadas que les permiten moverse con agilidad", "https://www.zoobioparqueamaru.com/nos-animaux/mamiferos/56-zoo-cuenca.jpg");
    }
    if (object.name == "sheep") {
      mostrarInfo("Oveja", "Es un mamífero cuadrúpedo ungulado doméstico, utilizado como ganado", "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQoEBy43imNaQ6npRkyHUplKyUmi5HWoOQBFEWGiHUPaEPnDcDoKJVCzJHrNB4w6kAMFsEgSo1oY512HCGfxrEr3HRym2GtbL_W-Ou7Ew");
    }
    if (object.name == "antelope") {
      mostrarInfo("Antelope", "son mamíferos ungulados con cuernos huecos que suelen confundirse con ciervos", "https://www.fao.org/4/v8300s/v8300s10.jpg");
    }
    if (object.name == "cat") {
      mostrarInfo("Gato bengali", "Es una raza de gato relativamente reciente, cuyo origen se encuentra en el cruce de un gato leopardo asiático con un gato doméstico en EE. UU.", "https://cdn.shopify.com/s/files/1/0692/9586/6135/files/Imagen4_a792b44d-55f4-4306-b725-ff840ccc0b46_480x480.png?v=1703242597");
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

// cierre del panel
document.getElementById("close-panel")!.addEventListener("click", (event) => {
    event.stopPropagation();

    const panel = document.getElementById("info-panel")!;
    panel.classList.remove("visible");

    // detiene cualquier sonido de animal al cerrar el panel
    for (const key in animalSounds) {
        if (animalSounds[key].isPlaying) {
            animalSounds[key].stop();
        }
    }

    setTimeout(() => {
        panel.style.display = 'none';
    }, 90);
});

// --- Bucle de Animación
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    // Actualiza las animaciones de tus modelos (animales, etc.)
    for (const mixer of mixers) {
        mixer.update(delta);
    }

    // Lógica de movimiento y controles de la cámara
    if (controls.isLocked) {
        const velocity = new THREE.Vector3();
        const direction = new THREE.Vector3();

        direction.z = Number(keys.KeyW) - Number(keys.KeyS);
        direction.x = Number(keys.KeyD) - Number(keys.KeyA);
        direction.normalize();

        if (keys.KeyW || keys.KeyS) velocity.z -= direction.z * 900.0 * delta;
        if (keys.KeyA || keys.KeyD) velocity.x -= direction.x * 900.0 * delta;

        controls.moveRight(-velocity.x * delta);
        controls.moveForward(-velocity.z * delta);

        // Ajusta la altura de la cámara para que no se hunda en el suelo
        if (ground) {
            controls.getObject().position.y = Math.max(controls.getObject().position.y, ground.position.y + 0.9);
        } else {
            controls.getObject().position.y = Math.max(controls.getObject().position.y, 0.9);
        }
    }

    skySphere.position.copy(camera.position);

    //Detección de proximidad para la pantalla de tickets ---
    if (caseta && ticketScreen) {
        const cameraPosition = controls.getObject().position; 
        const casetaPosition = caseta.position;            

        // Calcula la distancia entre la cámara y la caseta
        const distance = cameraPosition.distanceTo(casetaPosition);

        if (distance < activationDistance) {
            ticketScreen.style.display = 'block'; // Muestra la pantalla
        } else {
            ticketScreen.style.display = 'none';  
        }
    }

    renderer.render(scene, camera);

    // Esto es crucial si usas PointerLockControls o similares que necesitan ser actualizados
    // Lo tenías arriba, pero a veces se pone al final. Mantenlo donde funcione para ti.
    // controls.update(clock.getDelta());
}

// Asegúrate de llamar a animate() una vez para iniciar el bucle
animate();

// --- Configuración inicial del botón de comprar ticket (fuera de animate) ---
// Esto solo se ejecuta una vez cuando la página carga
if (buyTicketButton) { // Asegúrate de que buyTicketButton no es null
    buyTicketButton.addEventListener('click', () => {
        alert('¡Ticket comprado! ¡Disfruta tu visita!');
        
        // --- AQUÍ ES DONDE OCULTAMOS LA PANTALLA ---
        if (ticketScreen) { // Asegúrate de que ticketScreen no es null
            ticketScreen.style.display = 'none'; // Esto oculta el div CSS
        }
        
        // Opcional: Si desbloqueaste los controles al mostrar la pantalla,
        // aquí podrías volver a bloquearlos para que el jugador pueda moverse de nuevo.
        // controls.lock(); 
    });
}



window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});