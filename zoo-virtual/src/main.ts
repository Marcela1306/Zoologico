import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Escena
const scene = new THREE.Scene();

// Cámara con mejor campo para ver toda la escena
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(10, 7, 25);
camera.lookAt(0, 1, -5);

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas') as HTMLCanvasElement, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

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

// Suelo muy grande para que cubra todo el portón
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(500, 500),
  new THREE.MeshStandardMaterial({ color: 0x75a33f }) // Verde pasto
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.01;
ground.receiveShadow = true;
scene.add(ground);

// Loaders
const gltfLoader = new GLTFLoader();
const objLoader = new OBJLoader();

// Variables
let porton: THREE.Object3D | null = null;
const portonPivot = new THREE.Group(); // Grupo para pivotar portón
let persona: THREE.Object3D | null = null;
let avanzar = true;

// Cargar textura para portón
const portonTexture = new THREE.TextureLoader().load('/assets/textures/briks_u1_v1.png');

// Cargar portón OBJ
objLoader.load(
  '/assets/models/wall1.obj',
  (obj) => {
    const material = new THREE.MeshStandardMaterial({ map: portonTexture });
    obj.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).material = material;
        (child as THREE.Mesh).castShadow = true;
        (child as THREE.Mesh).receiveShadow = true;
      }
    });

    porton = obj;

    // ESCALAR a tamaño más pequeño
    const escala = 0.15;
    porton.scale.set(escala, escala, escala);

    const anchoModelo = 10;
    const anchoEscalado = anchoModelo * escala;
    porton.position.set(anchoEscalado / 2, 0, 0);

    // Añadimos portón al pivot
    portonPivot.add(porton);

    // Posicionamos el pivot en la escena donde quieres la puerta
    portonPivot.position.set(0, 0, -5);

    scene.add(portonPivot);
  },
  undefined,
  (err) => console.error("Error al cargar portón:", err)
);

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

// Animar apertura portón
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

// Exportar función para llamada desde HTML
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

// Ajuste resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
