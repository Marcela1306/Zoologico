import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { AnimationMixer } from 'three';

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
let personaMixers: AnimationMixer[] = [];

let ticketComprado = true; // Cambia a false si deseas controlar compra real

const clock = new THREE.Clock();

let entradaActiva = false;
let progresoEntrada = 0;
const duracionEntrada = 3;
const puntoInicio = new THREE.Vector3();
const puntoFinal = new THREE.Vector3(0, 1.8, -7);

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
  loader.load('/assets/models/Kioke.gltf', (gltf) => {
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
      gltf.animations.forEach((clip) => {
        const action = kioskoMixer!.clipAction(clip);
        action.play();
      });
    }

    console.log('Jerarquía del kiosko:');
    kiosko.traverse((child) => {
      console.log(child.name);
    });

    const nodoRaizMujer = kiosko.getObjectByName('metarig001');
    if (!nodoRaizMujer) {
      console.warn("❌ No se encontró 'metarig001' para clonar");
      return;
    }

    for (let i = 0; i < 5; i++) {
      const clon = nodoRaizMujer.clone(true);
      clon.position.set(0, 0, -10 + i * 1.5);
      clon.scale.set(1, 1, 1);
      clon.rotation.y = 0;

      clon.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;

          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((mat) => (mat.side = THREE.DoubleSide));
          } else {
            mesh.material.side = THREE.DoubleSide;
          }
        }
      });

      scene.add(clon);

      const mixer = new AnimationMixer(clon);
      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.play();
      });

      personaMixers.push(mixer);
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

export function abrirPortonDesdeHTML() {
  if (!ticketComprado) return alert("⚠️ No has comprado tu ticket aún.");

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
  personaMixers.forEach(mixer => mixer.update(delta));
  if (kioskoMixer) kioskoMixer.update(delta);
  if (portonMixer) portonMixer.update(delta);

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
