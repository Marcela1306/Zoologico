import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { AnimationMixer } from 'three';

// Variables globales
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;

let porton: THREE.Object3D | null = null;
let kiosko: THREE.Object3D | null = null;

let kioskoMixer: AnimationMixer | null = null;
let portonMixer: AnimationMixer | null = null;
let sonidoPuerta: THREE.Audio;
let portonAction: THREE.AnimationAction | null = null;

const clock = new THREE.Clock();

// Animación de entrada de cámara
let entradaActiva = false;
let progresoEntrada = 0;
const duracionEntrada = 3;
const puntoInicio = new THREE.Vector3();
const puntoFinal = new THREE.Vector3(0, 1.8, -7);

// Personas animadas en fila
let personaMixers: AnimationMixer[] = [];
let modeloPersona: THREE.Object3D | null = null;
const cantidadPersonas = 6;

export function inicializar() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(5, 3, 8);
  camera.lookAt(0, 2, -5);

  renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('canvas') as HTMLCanvasElement,
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x87ceeb);
  renderer.shadowMap.enabled = true;

  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 2, -5);
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
  cargarKiosko();
  cargarSonido();
  cargarFilaDePersonas(); // << AQUI CARGAMOS LAS PERSONAS

  window.addEventListener('resize', ajustarPantalla);
  window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 's') {
      abrirPortonDesdeHTML();
    }
  });

  animate();
}

function cargarPorton() {
  const loader = new GLTFLoader();
  loader.load('/assets/models/poen1.gltf', (gltf) => {
    porton = gltf.scene;
    porton.scale.set(0.15, 0.15, 0.15);
    porton.position.set(0, 0, -5);
    scene.add(porton);

    if (gltf.animations.length > 0) {
      portonMixer = new AnimationMixer(porton);
      const clip = gltf.animations[0];
      portonAction = portonMixer.clipAction(clip);
      portonAction.clampWhenFinished = true;
      portonAction.setLoop(THREE.LoopOnce, 1);
      portonAction.stop();
    }
  });
}

function cargarKiosko() {
  const loader = new GLTFLoader();
  loader.load('/assets/models/Kiosko.gltf', (gltf) => {
    kiosko = gltf.scene;
    kiosko.scale.set(1, 1, 1);
    kiosko.position.set(-7, 0, -4);
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

function cargarFilaDePersonas() {
  const loader = new GLTFLoader();
  loader.load('/assets/models/persona/scene.gltf', (gltf) => {
    modeloPersona = gltf.scene;
    const animacion = gltf.animations[0];

    for (let i = 0; i < cantidadPersonas; i++) {
      const persona = modeloPersona.clone(true);
      persona.scale.set(0.05, 0.05, 0.05);  // Ajustá según tu modelo
      //persona.position.set(-4, 0, -8 - i * 1.3);
      persona.position.set(-7, 0, -8 - i * 1.5);

      scene.add(persona);

      const mixer = new AnimationMixer(persona);
      const action = mixer.clipAction(animacion);
      action.play();
      personaMixers.push(mixer);
    }
  });
}

export function abrirPortonDesdeHTML() {
  sonidoPuerta?.play();
  if (portonAction) {
    portonAction.reset().play();
  }

  setTimeout(() => {
    puntoInicio.copy(camera.position);
    progresoEntrada = 0;
    entradaActiva = true;
    controls.enabled = false;
  }, 1500);
}

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  if (kioskoMixer) kioskoMixer.update(delta);
  if (portonMixer) portonMixer.update(delta);
  personaMixers.forEach(mixer => mixer.update(delta));

  if (entradaActiva) {
    progresoEntrada += delta;
    const t = Math.min(progresoEntrada / duracionEntrada, 1);
    camera.position.lerpVectors(puntoInicio, puntoFinal, t);
    camera.lookAt(0, 2, -5);

    if (t >= 1) {
      entradaActiva = false;
      controls.enabled = true;
    }
  }

  renderer.render(scene, camera);
}

function ajustarPantalla() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
