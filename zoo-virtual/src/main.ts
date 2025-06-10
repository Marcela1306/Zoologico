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

let portonPivot = new THREE.Group();
let porton: THREE.Object3D | null = null;
let persona: THREE.Object3D | null = null;
let avanzar = false;
let portonAbierto = false;
let sonidoPuerta: THREE.Audio;
let portonMixer: THREE.AnimationMixer | null = null;

const clock = new THREE.Clock();

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

  // Agregar portonPivot al escenario
  portonPivot.position.set(0, 0, -5);
  scene.add(portonPivot);

  // Cargar modelos y sonidos
  cargarPorton();
  cargarPersona();
  cargarSonido();

  // Resize
  window.addEventListener('resize', ajustarPantalla);

  // Animar
  animate();
}

let hojaIzquierda: THREE.Object3D | null = null;
let hojaDerecha: THREE.Object3D | null = null;
const pivoteIzquierda = new THREE.Group();
const pivoteDerecha = new THREE.Group();

function cargarPorton() {
  const loader = new GLTFLoader();
  loader.load('/assets/models/porton.gltf', (gltf) => {
    const modelo = gltf.scene;
    modelo.scale.set(0.15, 0.15, 0.15);

    modelo.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }

      if (child.name.toLowerCase().includes('izquierda')) hojaIzquierda = child;
      if (child.name.toLowerCase().includes('derecha')) hojaDerecha = child;
    });

    if (hojaIzquierda && hojaDerecha) {
      hojaIzquierda.position.set(0, 0, 0);
      hojaDerecha.position.set(0, 0, 0);

      pivoteIzquierda.add(hojaIzquierda);
      pivoteDerecha.add(hojaDerecha);

      pivoteIzquierda.position.set(-1, 0, 0);
      pivoteDerecha.position.set(1, 0, 0);

      portonPivot.add(pivoteIzquierda);
      portonPivot.add(pivoteDerecha);
    }

    portonPivot.position.set(0, 0, -5);
    scene.add(portonPivot);
  });
}


function cargarPersona() {
  const loader = new GLTFLoader();
  loader.load('/assets/models/scene.gltf', (gltf) => {
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
    let abiertoIzq = pivoteIzquierda.rotation.y > -Math.PI / 2;
    let abiertoDer = pivoteDerecha.rotation.y < Math.PI / 2;

    if (abiertoIzq || abiertoDer) {
      if (abiertoIzq) pivoteIzquierda.rotation.y -= velocidad;
      if (abiertoDer) pivoteDerecha.rotation.y += velocidad;
      requestAnimationFrame(animarApertura);
    }
  }
  animarApertura();

  avanzar = true;

  controls.target.set(0, 1, -5);
  camera.position.set(8, 5, 14);
  controls.update();

  // Ticket animación igual que antes...
  const geometria = new THREE.PlaneGeometry(6, 3);
  const texturaTicket = new THREE.TextureLoader().load('/assets/textures/ticket-dorado.jpg');
  const materialTicket = new THREE.MeshBasicMaterial({ map: texturaTicket, transparent: true });
  const ticket = new THREE.Mesh(geometria, materialTicket);
  ticket.position.set(0, 5, camera.position.z - 10);
  ticket.rotation.y = Math.PI;
  scene.add(ticket);

  const textoPlano = crearTextoSobreTicket("🎫 Welcome to Nicaragua's National Zoo!");
  textoPlano.position.set(0, 5, camera.position.z - 9.9);
  scene.add(textoPlano);

  const tiempoInicio = Date.now();
  const animarTicket = () => {
    const tiempo = (Date.now() - tiempoInicio) / 1000;
    ticket.position.y = 5 + Math.sin(tiempo * 2) * 0.2;
    textoPlano.position.y = ticket.position.y + 0.2;
    ticket.rotation.y += 0.01;
    textoPlano.rotation.y = ticket.rotation.y;
    if (tiempo < 6) requestAnimationFrame(animarTicket);
    else {
      scene.remove(ticket);
      scene.remove(textoPlano);
    }
  };
  animarTicket();
}


function crearTextoSobreTicket(texto: string): THREE.Mesh {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;
  canvas.width = 512;
  canvas.height = 110;
  context.fillStyle = '#fff';
  context.font = '28px Arial';
  context.textAlign = 'center';
  context.fillText(texto, canvas.width / 2, 80);

  const textura = new THREE.CanvasTexture(canvas);
  const material = new THREE.MeshBasicMaterial({ map: textura, transparent: true });
  const plano = new THREE.Mesh(new THREE.PlaneGeometry(6, 1.5), material);
  return plano;
}

// Tecla "s"
window.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 's') {
    abrirPortonDesdeHTML();
  }
});

// Animación general
function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta(); // Agrega un reloj
  if (portonMixer) portonMixer.update(delta);

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
