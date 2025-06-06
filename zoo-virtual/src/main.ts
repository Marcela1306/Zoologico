import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;

let portonPivot = new THREE.Group();
let porton: THREE.Object3D | null = null;
let persona: THREE.Object3D | null = null;
let avanzar = false;
let portonAbierto = false;
let sonidoPuerta: THREE.Audio;

export function inicializar() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(10, 7, 25);

  renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas') as HTMLCanvasElement, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x87ceeb);
  renderer.shadowMap.enabled = true;

  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 1, -5);
  controls.update();

  scene.add(new THREE.AmbientLight(0xffffff, 0.8));
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
  directionalLight.position.set(5, 10, 5);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(500, 500),
    new THREE.MeshStandardMaterial({ color: 0x75a33f })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  cargarPorton();
  cargarPersona();
  cargarSonido();

  window.addEventListener('resize', ajustarPantalla);
  animate();
}

function cargarPorton() {
  const objLoader = new OBJLoader();
  const textura = new THREE.TextureLoader().load('/assets/textures/briks_u1_v1.png');

  objLoader.load('/assets/models/wall1.obj', (obj) => {
    obj.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).material = new THREE.MeshStandardMaterial({ map: textura });
        (child as THREE.Mesh).castShadow = true;
        (child as THREE.Mesh).receiveShadow = true;
      }
    });

    const escala = 0.15;
    obj.scale.set(escala, escala, escala);
    obj.position.set((10 * escala) / 2, 0, 0);

    porton = obj;
    portonPivot.add(porton);
    portonPivot.position.set(0, 0, -5);
    scene.add(portonPivot);
  });
}

function cargarPersona() {
  const gltfLoader = new GLTFLoader();
  gltfLoader.load('/assets/models/persona/scene.gltf', (gltf) => {
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

    const btn = document.getElementById("buy-ticket-btn") as HTMLButtonElement;
    if (btn) btn.removeAttribute("disabled");
  });
}

function cargarSonido() {
  const listener = new THREE.AudioListener();
  camera.add(listener);
  sonidoPuerta = new THREE.Audio(listener);
  const loader = new THREE.AudioLoader();
  loader.load('/assets/sounds/puerta.mp3', (buffer) => {
    sonidoPuerta.setBuffer(buffer);
    sonidoPuerta.setLoop(false);
    sonidoPuerta.setVolume(0.7);
  });
}

export function abrirPortonDesdeHTML() {
  if (portonAbierto) return;
  portonAbierto = true;

  sonidoPuerta?.play();

  const duracion = 1.5;
  const velocidad = (Math.PI / 2) / (duracion * 60);

  function animarApertura() {
    if (portonPivot.rotation.y > -Math.PI / 2) {
      portonPivot.rotation.y -= velocidad;
      requestAnimationFrame(animarApertura);
    }
  }
  animarApertura();

  avanzar = true;

  controls.target.set(0, 1, -5);
  camera.position.set(8, 5, 14);
  controls.update();

  const ui = document.getElementById("ticket-ui");
  if (ui) {
    ui.innerHTML = "<h2>🎉 Ticket comprado</h2><p>¡Bienvenido al Zoológico!</p>";
    setTimeout(() => (ui.style.opacity = "0"), 4000);
  }
}

function animate() {
  requestAnimationFrame(animate);

  if (persona && avanzar) {
    if (persona.position.x > -1.5) {
      persona.position.x -= 0.02;
      persona.position.z -= 0.01;

      // Seguimiento de cámara
      camera.position.x -= 0.01;
      camera.lookAt(persona.position);
    } else {
      avanzar = false;
    }
  }

  controls.update();
  renderer.render(scene, camera);
}

function ajustarPantalla() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
