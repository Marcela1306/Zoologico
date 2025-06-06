import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
//import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Escena
const scene = new THREE.Scene();

// Cámara
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(10, 7, 25);
camera.lookAt(0, 1, -5);

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas') as HTMLCanvasElement, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x87ceeb);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1, -5);
controls.update();

// Luces
scene.add(new THREE.AmbientLight(0xffffff, 0.8));
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
directionalLight.position.set(5, 10, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Suelo
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(500, 500),
  new THREE.MeshStandardMaterial({ color: 0x75a33f })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.01;
ground.receiveShadow = true;
scene.add(ground);

// Loaders
const gltfLoader = new GLTFLoader();
//const objLoader = new OBJLoader();

// Variables
//let porton: THREE.Object3D | null = null;
const portonPivot = new THREE.Group();
let persona: THREE.Object3D | null = null;
let avanzar = true;
const objetosInteractivos: THREE.Object3D[] = [];

// Textura del portón (para mientras )
//const portonTexture = new THREE.TextureLoader().load('/assets/textures/briks_u1_v1.png');

// Cargar portón OBJ
/*objLoader.load(
  '/assets/models/wall1.obj',
  (obj) => {
    const material = new THREE.MeshStandardMaterial({ map: portonTexture });
    obj.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).material = material;
        child.name = "porton";
        (child as THREE.Mesh).castShadow = true;
        (child as THREE.Mesh).receiveShadow = true;
        objetosInteractivos.push(child);
      }
    });

    porton = obj;
    const escala = 0.15;
    porton.scale.set(escala, escala, escala);
    const anchoModelo = 10;
    const anchoEscalado = anchoModelo * escala;
    porton.position.set(anchoEscalado / 2, 0, 0);
    portonPivot.add(porton);
    portonPivot.position.set(0, 0, -5);
    scene.add(portonPivot);
  },
  undefined,
  (err) => console.error("Error al cargar portón:", err)
);*/

// Cargar persona GLTF
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
  },
  undefined,
  (err) => console.error("Error al cargar persona:", err)
);

// Cargar león GLTF
gltfLoader.load(
  '/assets/models/baby-_lion/scene.gltf',
  (gltf) => {
    const leon = gltf.scene;
    leon.scale.set(10, 10, 10);
    leon.position.set(5, 0, -80); //x para derecha, izquierda. Y para arriba abajo. Z adelante, atras
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
  },
  undefined,
  (error) => console.error("Error al cargar león:", error)
);

// Cargar cocodrilo GLTF
gltfLoader.load(
  '/assets/models/alligator/scene.gltf',
  (gltf) => {
    const cocodrilo = gltf.scene;
    cocodrilo.scale.set(12, 12, 12);
    cocodrilo.position.set(20, 3, -3);
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
  },
  undefined,
  (error) => console.error("Error al cargar cocodrilo:", error)
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
        objetosInteractivos.push(mesh);
      }
    });
    scene.add(hippo);
  },
  undefined,
  (error) => console.error("Error al cargar hipopotamo:", error)
);

// Cargar tigre GLTF
gltfLoader.load(
  '/assets/models/tiger/scene.gltf',
  (gltf) => {
    const tiger = gltf.scene;
    tiger.scale.set(7, 7, 7);
    tiger.position.set(30, 0, -80);
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

// Cargar mono GLTF
gltfLoader.load(
  '/assets/models/realsitic_monkey/scene.gltf',
  (gltf) => {
    const monkey = gltf.scene;
    monkey.scale.set(7, 7, 7);
    monkey.position.set(30, 3, 20);
    monkey.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "Mono";
        objetosInteractivos.push(mesh);
      }
    });
    scene.add(monkey);
  },
  undefined,
  (error) => console.error("Error al cargar cocodrilo:", error)
);


// Abrir portón
let portonAbierto = false;
function abrirPorton() {
  if (portonAbierto) return;
  portonAbierto = true;
  function animar() {
    if (portonPivot.rotation.y > -Math.PI / 2) {
      portonPivot.rotation.y -= 0.02;
      requestAnimationFrame(animar);
    }
  }
  animar();
}

export function abrirPortonDesdeHTML() {
  abrirPorton();
  const ui = document.getElementById("ticket-ui");
  if (ui) ui.style.display = "none";
}

// Animación principal
function animate() {
  requestAnimationFrame(animate);
  if (persona && avanzar) {
    if (persona.position.x > -1.5) {
      persona.position.x -= 0.03;
    } else {
      avanzar = false;
      const boton = document.querySelector("button");
      if (boton) boton.removeAttribute("disabled");
    }
  }
  controls.update();
  renderer.render(scene, camera);
}
animate();

// Raycasting para interacciones
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener("click", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(objetosInteractivos, true);
  if (intersects.length > 0) {
    const object = intersects[0].object;
    console.log("Click en:", object.name);
    if (object.name === "porton") {
      mostrarInfo("Portón del zoológico", "Este portón se abre al mostrar un ticket válido.");
    }
    if (object.name === "leon") {
      mostrarInfo("León Africano", "El león es el rey de la sabana africana. Vive en manadas y ruge para comunicarse.");
    }
    if (object.name === "cocodrilo") {
      mostrarInfo("Cocodrilo Agua Dulce", "Incluye a catorce especies actuales.​ Se trata de grandes reptiles semiacuáticos que viven en las regiones tropicales");
    }
    if (object.name == "hipopotamo") {
      mostrarInfo("Hipopotamo", "Es un gran mamífero artiodáctilo fundamentalmente herbívoro que habita en el África subsahariana.");
    }
    if (object.name === "tigre") {
      mostrarInfo("Tigre", "El tigre es una de las especies​ de la subfamilia de los panterinos pertenecientes al género Panthera");
    }
    if (object.name == "Mono") {
      mostrarInfo("Mono", "Son animales mamíferos, dotados de cuatro extremidades prensiles y una cola, con un cuerpo cubierto de pelaje diverso");
    }
  }
});

// Mostrar información
function mostrarInfo(titulo: string, descripcion: string) {
  const panel = document.getElementById("info-panel")!;
  const title = document.getElementById("info-title")!;
  const desc = document.getElementById("info-description")!;
  title.textContent = titulo;
  desc.textContent = descripcion;
  panel.style.display = "block";
}

document.getElementById("close-panel")!.addEventListener("click", () => {
  const panel = document.getElementById("info-panel")!;
  panel.style.display = "none";
});

// Ajuste al redimensionar
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
