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
let ticketComprado = false;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

export function inicializar() {
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xa3d1ff, 30, 120);
  scene.background = new THREE.Color(0xa3d1ff);

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(25, 15, 50);

  renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('canvas') as HTMLCanvasElement,
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 1, -5);
  controls.update();

  scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1));
  const luzDir = new THREE.DirectionalLight(0xffffff, 0.8);
  luzDir.position.set(30, 60, 30);
  luzDir.castShadow = true;
  luzDir.shadow.mapSize.set(2048, 2048);
  luzDir.shadow.camera.near = 1;
  luzDir.shadow.camera.far = 200;
  luzDir.shadow.camera.left = -50;
  luzDir.shadow.camera.right = 50;
  luzDir.shadow.camera.top = 50;
  luzDir.shadow.camera.bottom = -50;
  scene.add(luzDir);

  const suelo = new THREE.Mesh(
    new THREE.PlaneGeometry(2000, 2000),
    new THREE.MeshStandardMaterial({ color: 0x6db96d })
  );
  suelo.rotation.x = -Math.PI / 2;
  suelo.receiveShadow = true;
  scene.add(suelo);

  cargarPorton();
  cargarPersona();
  cargarSonido();
  cargarSonidoAmbiente();
  agregarAnimales();
  agregarDecoracion();
  agregarCartelBienvenida();

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
        const mesh = child as THREE.Mesh;
        mesh.material = new THREE.MeshStandardMaterial({ map: textura });
        mesh.castShadow = true;
        mesh.receiveShadow = true;
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
    persona.scale.set(1, 1, 1);
    persona.position.set(15, 0, 0);
    persona.rotation.y = Math.PI;

    persona.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
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
    sonidoAmbiente.setVolume(0.4);
    sonidoAmbiente.play();
  });
}

function agregarAnimales() {
  const geometria = new THREE.SphereGeometry(1.5, 16, 16);
  const material = new THREE.MeshStandardMaterial({ color: 0xffcc00 });

  for (let i = 0; i < 8; i++) {
    const animal = new THREE.Mesh(geometria, material.clone());
    animal.position.set(Math.random() * 40 - 20, 1.5, Math.random() * -40);
    animal.castShadow = true;
    animal.userData = { nombre: `Animal ${i + 1}` };
    scene.add(animal);
  }
}

function agregarDecoracion() {
  const troncoMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b });
  const hojaMat = new THREE.MeshStandardMaterial({ color: 0x228b22 });

  for (let i = 0; i < 12; i++) {
    const tronco = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 3, 8), troncoMat);
    tronco.position.set(Math.random() * 60 - 30, 1.5, Math.random() * -60);
    tronco.castShadow = true;
    scene.add(tronco);

    const copa = new THREE.Mesh(new THREE.SphereGeometry(1.5, 8, 8), hojaMat);
    copa.position.set(tronco.position.x, 3, tronco.position.z);
    copa.castShadow = true;
    scene.add(copa);
  }
}

function agregarCartelBienvenida() {
  const geometria = new THREE.PlaneGeometry(12, 4);
  const textura = new THREE.TextureLoader().load('/assets/textures/cartel-bienvenida.png');
  const material = new THREE.MeshBasicMaterial({ map: textura, transparent: true });
  const cartel = new THREE.Mesh(geometria, material);
  cartel.position.set(0, 5, -12);
  scene.add(cartel);
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
  if (portonAbierto || ticketComprado) return;
  ticketComprado = true;
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
  camera.position.set(12, 8, 20);
  controls.update();

  const ui = document.getElementById("ticket-ui");
  if (ui) {
    ui.innerHTML = "<h2>🎟️ Ticket comprado</h2><p>¡Bienvenido al Zoológico Virtual!</p>";
    ui.style.background = '#d4edda';
    ui.style.border = '2px solid #28a745';
    ui.style.color = '#155724';
    setTimeout(() => (ui.style.opacity = "0"), 5000);
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
      camera.position.lerp(objetivoCamara, 0.04);
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
