import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Escena y elementos globales
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

// Inicialización
export function inicializar() {
  // Escena
  scene = new THREE.Scene();

  // Cámara
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(10, 7, 25);

  // Render
  renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas') as HTMLCanvasElement, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x87ceeb);
  renderer.shadowMap.enabled = true;

  // Controles
  controls = new OrbitControls(camera, renderer.domElement);
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
  ground.receiveShadow = true;
  scene.add(ground);

  // Cargar modelos y sonidos
  cargarPorton();
  cargarPersona();
  cargarSonido();

  // Escuchar resize
  window.addEventListener('resize', ajustarPantalla);

  // Iniciar animación
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
    obj.position.set((10 * escala) / 2, 0, 0); // Ajuste para abrir bien

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

    // Habilitar botón
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

  // Mostrar ticket dorado animado
  const geometria = new THREE.PlaneGeometry(6, 3);
  const texturaTicket = new THREE.TextureLoader().load('/assets/textures/ticket-dorado.jpg');
  const materialTicket = new THREE.MeshBasicMaterial({ map: texturaTicket, transparent: true });
  const ticket = new THREE.Mesh(geometria, materialTicket);
  ticket.position.set(0, 5, camera.position.z - 10);
  ticket.rotation.y = Math.PI;

  scene.add(ticket);

  const tiempoInicio = Date.now();
  const animarTicket = () => {
    const tiempo = (Date.now() - tiempoInicio) / 1000;
    ticket.position.y = 5 + Math.sin(tiempo * 2) * 0.2;
    ticket.rotation.y += 0.01;
    if (tiempo < 6) requestAnimationFrame(animarTicket);
    else scene.remove(ticket);
  };
  animarTicket();

  const ui = document.getElementById("ticket-ui");
  if (ui) {
    ui.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <img src="/assets/textures/ticket-icon.png" alt="Ticket" style="width: 40px; height: 40px; animation: pulse 1s infinite;">
        <div>
          <h2 style="margin: 0; font-size: 1.2em">🎫 ¡Ticket Dorado Activado!</h2>
          <p style="margin: 0">Entra al Zoológico Nacional de Nicaragua</p>
        </div>
      </div>
    `;
    ui.style.background = '#fff3cd';
    ui.style.border = '2px solid #ffc107';
    ui.style.color = '#856404';
    ui.style.opacity = '1';
    ui.style.transition = 'opacity 1s';
    setTimeout(() => (ui.style.opacity = "0"), 7000);
  }
}

// Escuchar tecla "s" para simular compra del ticket
window.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 's') {
    abrirPortonDesdeHTML();
  }
});



// Animación
function animate() {
  requestAnimationFrame(animate);

  if (persona && avanzar) {
    if (persona.position.x > -1.5) {
      persona.position.x -= 0.02;
      persona.position.z -= 0.01;
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