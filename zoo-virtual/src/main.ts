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

let persona: THREE.Object3D | null = null;
let avanzar = false;
let portonAbierto = false;
let sonidoPuerta: THREE.Audio;
let portonMixer: AnimationMixer | null = null;

const clock = new THREE.Clock();

export function inicializar() {
  // Escena
  scene = new THREE.Scene();

  // Cámara posicionada justo frente al portón
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
  cargarPersona();
  cargarSonido();

  // Resize
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

    if (gltf.animations.length > 0) {
      portonMixer = new AnimationMixer(porton);
      const action = portonMixer.clipAction(gltf.animations[0]);
      action.play();
    }
  });
}

function cargarPersona() {
  const loader = new GLTFLoader();
loader.load('/assets/models/scene.gltf', (gltf) => {
  persona = gltf.scene;
  persona.scale.set(1, 1, 1);
  persona.position.set(0, 0, 2);
  persona.rotation.y = Math.PI;

  // Prueba materiales simples para visibilidad
  persona.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      (child as THREE.Mesh).material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  scene.add(persona);

  const btn = document.getElementById("buy-ticket-btn") as HTMLButtonElement;
  if (btn) btn.removeAttribute("disabled");
});

controls.target.set(0, 1, 0);
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
  if (portonAbierto) return;
  portonAbierto = true;

  sonidoPuerta?.play();

  const duracion = 1.5; // segundos
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

  avanzar = true;

  // Ajustar cámara para seguir la acción
  controls.target.set(3, 4, -5);
  camera.position.set(15, 5, 5);
  controls.update();

  // Mostrar ticket animado después de abrir portón
  mostrarTicket();
}

function crearTextoSobreTicket(texto: string): THREE.Mesh {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;
  canvas.width = 1024;  // más ancho para más espacio
  canvas.height = 256;  // más alto

  // Fondo semi-transparente y con borde para resaltar
  context.fillStyle = 'rgba(30, 30, 30, 0.85)';
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Borde dorado para el ticket
  context.strokeStyle = '#FFD700';
  context.lineWidth = 12;
  context.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);

  // Texto con sombra para mejor visibilidad
  context.font = 'bold 48px Arial';
  context.textAlign = 'center';
  context.fillStyle = '#FFD700'; // dorado
  context.shadowColor = 'black';
  context.shadowBlur = 8;
  
  // Dividir texto en varias líneas (separar por "!" o por puntos)
  const lines = texto.split('!');
  lines.forEach((line, i) => {
    const textoLimpio = line.trim();
    if (textoLimpio.length > 0) {
      context.fillText(textoLimpio + (i < lines.length - 1 ? '!' : ''), canvas.width / 2, 70 + i * 60);
    }
  });

  const textura = new THREE.CanvasTexture(canvas);
  textura.minFilter = THREE.LinearFilter;
  const material = new THREE.MeshBasicMaterial({ map: textura, transparent: true });
  const plano = new THREE.Mesh(new THREE.PlaneGeometry(6, 1.5), material);  // plano más grande
  return plano;
}

function mostrarTicket() {
  const geometria = new THREE.PlaneGeometry(6, 1.5);  // ticket más grande
  const texturaTicket = new THREE.TextureLoader().load('/assets/textures/ticket-dorado.jpg');
  const materialTicket = new THREE.MeshBasicMaterial({ map: texturaTicket, transparent: true, opacity: 0.95 });
  const ticket = new THREE.Mesh(geometria, materialTicket);

  ticket.position.set(camera.position.x - 4, camera.position.y + 2, camera.position.z - 6);
  ticket.rotation.y = Math.PI / 8;
  ticket.castShadow = true;
  scene.add(ticket);

  const textoPlano = crearTextoSobreTicket("🎫 ¡Bienvenido al Zoológico Nacional de Nicaragua!");
  textoPlano.position.set(ticket.position.x, ticket.position.y + 0.8, ticket.position.z + 0.1);
  textoPlano.rotation.y = ticket.rotation.y;
  scene.add(textoPlano);

  const tiempoInicio = Date.now();
  const duracionAnimacion = 6;
  function animarTicket() {
    const tiempo = (Date.now() - tiempoInicio) / 1000;
    if (tiempo < duracionAnimacion) {
      ticket.position.y = (camera.position.y + 2) + Math.sin(tiempo * 3) * 0.15;
      textoPlano.position.y = ticket.position.y + 0.8;

      ticket.rotation.y = Math.PI / 8 + Math.sin(tiempo * 2) * 0.1;
      textoPlano.rotation.y = ticket.rotation.y;

      requestAnimationFrame(animarTicket);
    } else {
      scene.remove(ticket);
      scene.remove(textoPlano);
    }
  }
  animarTicket();
}


// Tecla "s" para abrir portón (para testing)
window.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 's') {
    abrirPortonDesdeHTML();
  }
});

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
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
