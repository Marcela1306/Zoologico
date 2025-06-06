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

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

export function inicializar() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xadd8e6);

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(10, 7, 25);

  renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('canvas') as HTMLCanvasElement,
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;

  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 1, -5);
  controls.update();

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const luzDireccional = new THREE.DirectionalLight(0xffffff, 0.8);
  luzDireccional.position.set(5, 10, 5);
  luzDireccional.castShadow = true;
  scene.add(luzDireccional);

  const suelo = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.MeshStandardMaterial({ color: 0x75a33f })
  );
  suelo.rotation.x = -Math.PI / 2;
  suelo.receiveShadow = true;
  scene.add(suelo);

  cargarPorton();
  cargarPersona();
  cargarSonido();
  cargarSonidoAmbiente();
  agregarAnimales();

  window.addEventListener('resize', ajustarPantalla);
  window.addEventListener('click', detectarClickAnimal);
  window.addEventListener('keydown', manejarTeclas);

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

function cargarSonidoAmbiente() {
  const listener = new THREE.AudioListener();
  camera.add(listener);

  const sonidoAmbiente = new THREE.Audio(listener);
  const loader = new THREE.AudioLoader();
  loader.load('/assets/sounds/zoo-ambiente.mp3', (buffer) => {
    sonidoAmbiente.setBuffer(buffer);
    sonidoAmbiente.setLoop(true);
    sonidoAmbiente.setVolume(0.3);
    sonidoAmbiente.play();
  });
}

function agregarAnimales() {
  const geometria = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({ color: 0xffa500 });

  for (let i = 0; i < 5; i++) {
    const animal = new THREE.Mesh(geometria, material.clone());
    animal.position.set(Math.random() * 20 - 10, 0.5, Math.random() * -20);
    animal.userData = { nombre: "Animal " + (i + 1) };
    scene.add(animal);

    const offset = Math.random() * Math.PI * 2;
    const originalY = animal.position.y;

    const animar = () => {
      animal.position.y = originalY + Math.sin(Date.now() * 0.002 + offset) * 0.2;
      requestAnimationFrame(animar);
    };
    animar();
  }
}

function detectarClickAnimal(event: MouseEvent) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersectados = raycaster.intersectObjects(scene.children);

  for (let obj of intersectados) {
    if (obj.object.userData.nombre) {
      alert(`🐾 Estás viendo: ${obj.object.userData.nombre}`);
      break;
    }
  }
}

function manejarTeclas(e: KeyboardEvent) {
  if (e.key.toLowerCase() === 'f') {
    if (!document.fullscreenElement) {
      document.body.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }
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

      const offset = new THREE.Vector3(5, 5, 10);
      const objetivoCamara = persona.position.clone().add(offset);
      camera.position.lerp(objetivoCamara, 0.05);
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
