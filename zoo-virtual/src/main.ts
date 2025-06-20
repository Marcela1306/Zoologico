import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { AnimationMixer } from 'three';

// Escena y elementos globales
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;

let porton: THREE.Object3D | null = null;
let puertaIzquierda: THREE.Object3D | null = null;
let puertaDerecha: THREE.Object3D | null = null;

let kiosko: THREE.Object3D | null = null;
let kioskoMixer: AnimationMixer | null = null;

let sonidoPuerta: THREE.Audio;

const clock = new THREE.Clock();

export function inicializar() {
  // Escena
  scene = new THREE.Scene();

  // Cámara
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(-15, 1, 5);
  camera.lookAt(0, 2, -5);

  // Render
  renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas') as HTMLCanvasElement, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x87ceeb);
  renderer.shadowMap.enabled = true;

  // Controles
  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 2, -5);
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
  ground.receiveShadow = true;
  scene.add(ground);

  // Cargar modelos y sonidos
  cargarPorton();
  cargarKiosko();
  cargarSonido();

  // Ajustar pantalla al redimensionar
  window.addEventListener('resize', ajustarPantalla);

  // Animar
  animate();
}

function cargarPorton() {
  const loader = new GLTFLoader();
  loader.load('/assets/models/porton.gltf', (gltf) => {
    porton = gltf.scene;
    porton.scale.set(0.15, 0.15, 0.15);
    porton.position.set(0, 0, -5);

    puertaIzquierda = porton.getObjectByName('puertaIzquierda') || null;
    puertaDerecha = porton.getObjectByName('puertaDerecha') || null;

    porton.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    scene.add(porton);
  });
}

function cargarKiosko() {
  const loader = new GLTFLoader();
  loader.load('/assets/models/Kiosko.gltf', (gltf) => {
    kiosko = gltf.scene;
    kiosko.scale.set(1, 1, 1);

    kiosko.position.set(-5, 0, -4);
    kiosko.rotation.y = Math.PI;

    kiosko.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    scene.add(kiosko);

    if (gltf.animations.length > 0) {
      kioskoMixer = new AnimationMixer(kiosko);
      const clip = gltf.animations[0];
      const action = kioskoMixer.clipAction(clip);
      action.play();
    }
  });

  controls.target.set(0, 1.5, -5);
  controls.update();
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
  sonidoPuerta?.play();

  const duracion = 1.5;
  const fps = 60;
  const totalFrames = duracion * fps;
  const anguloMax = Math.PI / 2;

  let frame = 0;

  function animarApertura() {
    frame++;
    const progreso = frame / totalFrames;
    const angulo = anguloMax * progreso;

    if (puertaIzquierda) puertaIzquierda.rotation.y = angulo;
    if (puertaDerecha) puertaDerecha.rotation.y = -angulo;

    if (frame < totalFrames) {
      requestAnimationFrame(animarApertura);
    }
  }

  animarApertura();

  controls.target.set(0, 1.5, -2.5);
  camera.position.set(4, 2.5, 6);
  controls.update();
}

window.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 's') {
    abrirPortonDesdeHTML();
  }
});

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  if (kioskoMixer) kioskoMixer.update(delta);

  controls.update();
  renderer.render(scene, camera);
}

function ajustarPantalla() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
