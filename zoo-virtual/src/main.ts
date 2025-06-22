import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
//import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


// Scene
const scene = new THREE.Scene();

//model of the cages
const gltfLoader = new GLTFLoader();

//cages and internal structure (in position)
gltfLoader.load('public/assets/models/modelozoo.glb', (gltf) => {
    const model = gltf.scene;
    console.log('Loaded Model:', model); 
    model.scale.set(1.5, 1.5, 1.5); 
    model.position.set(120, -3, 120); 

    scene.add(model); 
}, undefined, (error) => {
    console.error("Error loading model modification.glb:", error);
});


// Camera
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(10, 7, 25);
camera.lookAt(0, 1, -5);

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas') as HTMLCanvasElement, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x87ceeb);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1, -5);
controls.update();

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 0.8));
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
directionalLight.position.set(5, 10, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

// floor
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(500, 500),
  new THREE.MeshStandardMaterial({ color: 0x75a33f })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.01;
ground.receiveShadow = true;
scene.add(ground);



// Variables
let persona: THREE.Object3D | null = null;
let avanzar = true;
const objetosInteractivos: THREE.Object3D[] = []; //to click and see information
const mixers: THREE.AnimationMixer[] = []; //to see the movement of 3D models 


// Load GLTF lion (already in position)
gltfLoader.load(
  '/assets/models/lionesmom/scene.gltf',
  (gltf) => {
    const leon = gltf.scene;
    leon.scale.set(6, 6, 6);
    leon.position.set(-70, 4, 30); 
    leon.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "leon";
        objetosInteractivos.push(mesh);
      }
    });
    //  model animation 
    if (gltf.animations && gltf.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(leon);
      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.play();
      });
      mixers.push(mixer); //mixer to save the animation
    }
    scene.add(leon);
  },
  undefined,
  (error) => console.error("Error loading lion:", error)
);

gltfLoader.load(
  '/assets/models/lionesmom/scene.gltf',
  (gltf) => {
    const leon1 = gltf.scene;
    leon1.scale.set(6, 6, 6);
    leon1.position.set(-90, 4, 45); 
    leon1.rotation.y = Math.PI / 2; // Rotate 90 degrees on the Y axis
    leon1.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "leon";
        objetosInteractivos.push(mesh);
      }
    });
    if (gltf.animations && gltf.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(leon1);
      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.play();
      });
      mixers.push(mixer); 
    }
    
    scene.add(leon1);
  },
  undefined,
  (error) => console.error("Error loading lion:", error)
);



// Load GLTF Hippo (already in position)
gltfLoader.load(
  '/assets/models/hipposs/scene.gltf',
  (gltf) => {
    const hippo = gltf.scene;
    hippo.scale.set(0.2, 0.2, 0.2);
    hippo.position.set(100, 8, -150);
    hippo.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "hipopotamo";
        objetosInteractivos.push(mesh);
      }
    });
    if (gltf.animations && gltf.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(hippo);
      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.play();
      });
      mixers.push(mixer); 
    }
    scene.add(hippo);
  },
  undefined,
  (error) => console.error("Error loading hippopotamus:", error)
);

// Load GLTF gazzela (already in position)
gltfLoader.load(
  '/assets/models/gazella/scene.gltf',
  (gltf) => {
    const gazella = gltf.scene;
    gazella.scale.set(2, 2, 2);
    gazella.position.set(90, 4, -40);
    gazella.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "gazella";
        objetosInteractivos.push(mesh);
      }
    });
    if (gltf.animations && gltf.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(gazella);
      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.play();
      });
      mixers.push(mixer); 
    }
    scene.add(gazella);
  },
  undefined,
  (error) => console.error("Error loading hippopotamus:", error)
);

// Load GLTF gazzela (already in position)
gltfLoader.load(
  '/assets/models/gazella/scene.gltf',
  (gltf) => {
    const gazella = gltf.scene;
    gazella.scale.set(2, 2, 2);
    gazella.position.set(110, 4, -40);
    gazella.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "gazella";
        objetosInteractivos.push(mesh);
      }
    });
    if (gltf.animations && gltf.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(gazella);
      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.play();
      });
      mixers.push(mixer); 
    }
    scene.add(gazella);
  },
  undefined,
  (error) => console.error("Error loading hippopotamus:", error)
);

// Load GLTF zebra (already in position)
gltfLoader.load(
  '/assets/models/zebra/scene.gltf',
  (gltf) => {
    const zebra = gltf.scene;
    zebra.scale.set(5, 5, 5);
    zebra.position.set(30, 3, -150);
    zebra.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "zebra";
        objetosInteractivos.push(mesh);
      }
    });
    if (gltf.animations && gltf.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(zebra);
      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.play();
      });
      mixers.push(mixer); 
    }
    scene.add(zebra);
  },
  undefined,
  (error) => console.error("Error loading hippopotamus:", error)
);

// Load GLTF zebra (already in position)
gltfLoader.load(
  '/assets/models/zebra/scene.gltf',
  (gltf) => {
    const zebra = gltf.scene;
    zebra.scale.set(5, 5, 5);
    zebra.position.set(10, 3, -150);
    zebra.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "zebra";
        objetosInteractivos.push(mesh);
      }
    });
    if (gltf.animations && gltf.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(zebra);
      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.play();
      });
      mixers.push(mixer); 
    }
    scene.add(zebra);
  },
  undefined,
  (error) => console.error("Error loading hippopotamus:", error)
);

// Load GLTF tiger (already in position)
gltfLoader.load(
  '/assets/models/tiger/scene.gltf',
  (gltf) => {
    const tiger = gltf.scene;
    tiger.scale.set(7, 7, 7);
    tiger.position.set(-70, 4, 100);
    tiger.rotation.y = Math.PI / 2; 
    tiger.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "tigre";
        objetosInteractivos.push(mesh);
      }
    });
    scene.add(tiger);
  },
  undefined,
  (error) => console.error("Error loading tiger:", error)
);

// Load GLTF antelope (already in position)
gltfLoader.load(
  '/assets/models/antelope/scene.gltf',
  (gltf) => {
    const antelope = gltf.scene;
    antelope.scale.set(7, 7, 7);
    antelope.position.set(15, 4, 50);
    antelope.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "antelope";
        objetosInteractivos.push(mesh);
      }
    });

    if (gltf.animations && gltf.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(antelope);
      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.play();
      });
      mixers.push(mixer); 
    }
    scene.add(antelope);
  },
  undefined,
  (error) => console.error("Error loading antelope:", error)
);

gltfLoader.load(
  '/assets/models/antelope/scene.gltf',
  (gltf) => {
    const antelope = gltf.scene;
    antelope.scale.set(7, 7, 7);
    antelope.position.set(25, 4, 70);
    antelope.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "antelope";
        objetosInteractivos.push(mesh);
      }
    });

    if (gltf.animations && gltf.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(antelope);
      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.play();
      });
      mixers.push(mixer); 
    }
    scene.add(antelope);
  },
  undefined,
  (error) => console.error("Error loading antelope:", error)
);


// Load GLTF deer (already in position)
gltfLoader.load(
  '/assets/models/little_buck_2.0/scene.gltf',
  (gltf) => {
    const venado = gltf.scene;
    venado.scale.set(1, 1, 1);
    venado.position.set(-80, 2, -40);
    venado.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "Venado";
        objetosInteractivos.push(mesh);
      }
    });
    scene.add(venado);
  },
  undefined,
  (error) => console.error("Error loading deer:", error)
);

// Load GLTF baby deer (already in position)
gltfLoader.load(
  '/assets/models/kitzreh_4.0/scene.gltf',
  (gltf) => {
    const venadob = gltf.scene;
    venadob.scale.set(9, 9, 9);
    venadob.position.set(-70, 2, -40);
    venadob.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "Venadobebe";
        objetosInteractivos.push(mesh);
      }
    });
    scene.add(venadob);
  },
  undefined,
  (error) => console.error("Error loading deer:", error)
);

gltfLoader.load(
  '/assets/models/kitzreh_4.0/scene.gltf',
  (gltf) => {
    const venadob1 = gltf.scene;
    venadob1.scale.set(9, 9, 9);
    venadob1.position.set(-75, 2, -20);
    venadob1.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "Venadobebe";
        objetosInteractivos.push(mesh);
      }
    });
    scene.add(venadob1);
  },
  undefined,
  (error) => console.error("Error loading deer:", error)
);


// Load GLTF goat (already in position)
gltfLoader.load(
  '/assets/models/goat/scene.gltf',
  (gltf) => {
    const goat = gltf.scene;
    goat.scale.set(4, 4, 4);
    goat.position.set(25, 2, -70);
    goat.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "Cabra";
        objetosInteractivos.push(mesh);
      }
    });
    scene.add(goat);
  },
  undefined,
  (error) => console.error("Error loading goat:", error)
);

// sheep model
gltfLoader.load(
  '/assets/models/sheep/scene.gltf',
  (gltf) => {
    const sheep = gltf.scene;
    sheep.scale.set(8, 8, 8);
    sheep.position.set(10, 2, -60); 
    sheep.rotation.y = Math.PI / 2; 
    sheep.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "sheep";
        objetosInteractivos.push(mesh);
      }
    });

    if (gltf.animations && gltf.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(sheep);
      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.play();
      });
      mixers.push(mixer); 
    }
    
    scene.add(sheep);
  },
  undefined,
  (error) => console.error("Error loading sheep:", error)
);


gltfLoader.load(
  '/assets/models/sheep/scene.gltf',
  (gltf) => {
    const sheep1 = gltf.scene;
    sheep1.scale.set(8, 8, 8);
    sheep1.position.set(20, 2, -80); 
    sheep1.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "sheep";
        objetosInteractivos.push(mesh);
      }
    });

    if (gltf.animations && gltf.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(sheep1);
      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.play();
      });
      mixers.push(mixer); 
    }
    
    scene.add(sheep1);
  },
  undefined,
  (error) => console.error("Error loading sheep", error)
);


// Load GLTF turtle (already in position)
gltfLoader.load(
  '/assets/models/turtle/scene.gltf',
  (gltf) => {
    const turtle = gltf.scene;
    turtle.scale.set(2, 2, 2);
    turtle.position.set(110, 4, 120);
    turtle.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "turtle";
        objetosInteractivos.push(mesh);
      }
    });
     
    if (gltf.animations && gltf.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(turtle);
      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.play();
      });
      mixers.push(mixer); 
    }
    scene.add(turtle);
  },
  undefined,
  (error) => console.error("Error loading bird", error)
);

gltfLoader.load(
  '/assets/models/turtle/scene.gltf',
  (gltf) => {
    const turtle = gltf.scene;
    turtle.scale.set(2, 2, 2);
    turtle.position.set(100, 4, 130);
    turtle.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "turtle";
        objetosInteractivos.push(mesh);
      }
    });
    
    if (gltf.animations && gltf.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(turtle);
      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.play();
      });
      mixers.push(mixer); 
    }
    scene.add(turtle);
  },
  undefined,
  (error) => console.error("Error loading turtle", error)
);

// Model iguana
gltfLoader.load(
  '/assets/models/iguana/scene.gltf',
  (gltf) => {
    const iguana = gltf.scene;
    iguana.scale.set(0.5, 0.5, 0.5);
    iguana.position.set(130, 4, 135);
    iguana.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "iguana";
        objetosInteractivos.push(mesh);
      }
    });
    
    if (gltf.animations && gltf.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(iguana);
      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.play();
      });
      mixers.push(mixer); 
    }
    scene.add(iguana);
  },
  undefined,
  (error) => console.error("Error loading bird", error)
);

// Model iguana
gltfLoader.load(
  '/assets/models/iguana3d/scene.gltf',
  (gltf) => {
    const iguana = gltf.scene;
    iguana.scale.set(0.5, 0.5, 0.5);
    iguana.position.set(125, 4, 120);
    iguana.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "iguana";
        objetosInteractivos.push(mesh);
      }
    });
    
    if (gltf.animations && gltf.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(iguana);
      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.play();
      });
      mixers.push(mixer); 
    }
    scene.add(iguana);
  },
  undefined,
  (error) => console.error("Error loading iguana", error)
);

//model ducks
gltfLoader.load(
  '/assets/models/duck/scene.gltf',
  (gltf) => {
    const duck = gltf.scene;
    duck.scale.set(11, 11, 11);
    duck.position.set(70, 4, 120);
    duck.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "duck";
        objetosInteractivos.push(mesh);
      }
    });
    
    if (gltf.animations && gltf.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(duck);
      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.play();
      });
      mixers.push(mixer); 
    }
    scene.add(duck);
  },
  undefined,
  (error) => console.error("Error loading bird", error)
);

//model ducks
gltfLoader.load(
  '/assets/models/duck/scene.gltf',
  (gltf) => {
    const duck = gltf.scene;
    duck.scale.set(11, 11, 11);
    duck.position.set(80, 4, 130);
    duck.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "duck";
        objetosInteractivos.push(mesh);
      }
    });
    
    if (gltf.animations && gltf.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(duck);
      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.play();
      });
      mixers.push(mixer); 
    }
    scene.add(duck);
  },
  undefined,
  (error) => console.error("Error loading bird", error)
);

//model ducks
gltfLoader.load(
  '/assets/models/duck/scene.gltf',
  (gltf) => {
    const duck = gltf.scene;
    duck.scale.set(11, 11, 11);
    duck.position.set(80, 4, 118);
    duck.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "duck";
        objetosInteractivos.push(mesh);
      }
    });
    
    if (gltf.animations && gltf.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(duck);
      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.play();
      });
      mixers.push(mixer); 
    }
    scene.add(duck);
  },
  undefined,
  (error) => console.error("Error loading bird", error)
);

//Model gorilla GLTF
gltfLoader.load(
  '/assets/models/gorilla/scene.gltf',
  (gltf) => {
    const gorilla = gltf.scene;
    gorilla.scale.set(9, 9, 9);
    gorilla.position.set(-90, 3, -150);
    gorilla.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "gorilla";
        objetosInteractivos.push(mesh);
      }
    });
    
    if (gltf.animations && gltf.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(gorilla);
      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.play();
      });
      mixers.push(mixer); 
    }
    scene.add(gorilla);
  },
  undefined,
  (error) => console.error("Error loading gorilla", error)
);

//Model monkey GLTF
gltfLoader.load(
  '/assets/models/monkey/scene.gltf',
  (gltf) => {
    const monkey = gltf.scene;
    monkey.scale.set(0.1, 0.1, 0.1);
    monkey.position.set(-90, 11, -100);
    monkey.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "monkey";
        objetosInteractivos.push(mesh);
      }
    });
    
    if (gltf.animations && gltf.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(monkey);
      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.play();
      });
      mixers.push(mixer); 
    }
    scene.add(monkey);
  },
  undefined,
  (error) => console.error("Error loading bird", error)
);

//Model monkey GLTF
gltfLoader.load(
  '/assets/models/monkey/scene.gltf',
  (gltf) => {
    const monkey = gltf.scene;
    monkey.scale.set(0.1, 0.1, 0.1);
    monkey.position.set(-75, 6, -100);
    monkey.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "monkey";
        objetosInteractivos.push(mesh);
      }
    });
    
    if (gltf.animations && gltf.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(monkey);
      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.play();
      });
      mixers.push(mixer); 
    }
    scene.add(monkey);
  },
  undefined,
  (error) => console.error("Error loading bird", error)
);

// Load GLTF coffeshop (already in position)
gltfLoader.load(
  '/assets/models/cafeteria_salle/scene.gltf',
  (gltf) => {
    const cafeteria = gltf.scene;
    cafeteria.scale.set(1.7, 1.7, 1.7);
    cafeteria.position.set(110, 8, 70);
    
    cafeteria.rotation.y = Math.PI / -2; 


    cafeteria.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "Cafe";
        objetosInteractivos.push(mesh);
      }
    });
    scene.add(cafeteria);
  },
  undefined,
  (error) => console.error("Error loading coffeshop:", error)
);

// Load GLTF bathrooms
gltfLoader.load(
  '/assets/models/bathroom/scene.gltf',
  (gltf) => {
    const bathroom = gltf.scene;
    bathroom.scale.set(1.5, 1.5, 1.5);
    bathroom.position.set(108, 2, 2);
    
    bathroom.rotation.y = Math.PI / 2; 


    bathroom.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "bathroom";
        objetosInteractivos.push(mesh);
      }
    });
    scene.add(bathroom);
  },
  undefined,
  (error) => console.error("Error loading bathrooms:", error)
);

//banking
gltfLoader.load(
  '/assets/models/bancacir/scene.gltf',
  (gltf) => {
    const banca = gltf.scene;
    banca.scale.set(1, 1, 1);
    banca.position.set(60, 3, 20);
    banca.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "banking";
        objetosInteractivos.push(mesh);
      }
    });
    scene.add(banca);
  },
  undefined,
  (error) => console.error("Error loading banking:", error)
);

gltfLoader.load(
  '/assets/models/bancacir/scene.gltf',
  (gltf) => {
    const banca1 = gltf.scene;
    banca1.scale.set(1, 1, 1);
    banca1.position.set(-70, 4, 140);
    banca1.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "banca1";
        objetosInteractivos.push(mesh);
      }
    });
    scene.add(banca1);
  },
  undefined,
  (error) => console.error("Error loading banking:", error)
);

gltfLoader.load(
  '/assets/models/tables/scene.gltf',
  (gltf) => {
    const tables = gltf.scene;
    tables.scale.set(18, 18, 18);
    tables.position.set(-70, 2, -100);
    tables.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "bancas";
        objetosInteractivos.push(mesh);
      }
    });
    scene.add(tables);
  },
  undefined,
  (error) => console.error("Error loading banking:", error)
);

gltfLoader.load(
  '/assets/models/tables/scene.gltf',
  (gltf) => {
    const tables1 = gltf.scene;
    tables1.scale.set(18, 18, 18);
    tables1.position.set(-70, 2, -40);
    tables1.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "bancas";
        objetosInteractivos.push(mesh);
      }
    });
    scene.add(tables1);
  },
  undefined,
  (error) => console.error("Error loading banking:", error)
);

// Nature Decoration
gltfLoader.load(
  '/assets/models/afrutal/scene.gltf',
  (gltf) => {
    const afrutal = gltf.scene;
    afrutal.scale.set(5, 5, 5);
    afrutal.position.set(-100, 4, 140);
    afrutal.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "afrutal";
        objetosInteractivos.push(mesh);
      }
    });
    scene.add(afrutal);
  },
  undefined,
  (error) => console.error("Error loading tree:", error)
);

gltfLoader.load(
  '/assets/models/afrutal/scene.gltf',
  (gltf) => {
    const afrutal1 = gltf.scene;
    afrutal1.scale.set(5, 5, 5);
    afrutal1.position.set(60, 4, -105);
    afrutal1.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "afrutal1";
        objetosInteractivos.push(mesh);
      }
    });
    scene.add(afrutal1);
  },
  undefined,
  (error) => console.error("Error loading tree:", error)
);

gltfLoader.load(
  '/assets/models/arbol/scene.gltf',
  (gltf) => {
    const arbol = gltf.scene;
    arbol.scale.set(5, 5, 5);
    arbol.position.set(-100, 3, -40);
    arbol.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "arbol";
        objetosInteractivos.push(mesh);
      }
    });
    scene.add(arbol);
  },
  undefined,
  (error) => console.error("Error loading tree:", error)
);

gltfLoader.load(
  '/assets/models/arbole/scene.gltf',
  (gltf) => {
    const arbole = gltf.scene;
    arbole.scale.set(0.5, 0.5, 0.5);
    arbole.position.set(135, 5, 135);
    arbole.rotation.y = Math.PI / 2; 

    arbole.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "arbole";
        objetosInteractivos.push(mesh);
      }
    });
    scene.add(arbole);
  },
  undefined,
  (error) => console.error("Error loading tree:", error)
);

gltfLoader.load(
  '/assets/models/arbole/scene.gltf',
  (gltf) => {
    const arboles = gltf.scene;
    arboles.scale.set(0.5, 0.5, 0.5);
    arboles.position.set(10, 6, -200);
    arboles.rotation.y = Math.PI / 2; 

    arboles.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "arboles";
        objetosInteractivos.push(mesh);
      }
    });
    scene.add(arboles);
  },
  undefined,
  (error) => console.error("Error loading tree:", error)
);

gltfLoader.load(
  '/assets/models/rocas/scene.gltf',
  (gltf) => {
    const rocas = gltf.scene;
    rocas.scale.set(5, 5, 5);
    rocas.position.set(-90, 4, 100);
    rocas.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "rocks";
        objetosInteractivos.push(mesh);
      }
    });
    scene.add(rocas);
  },
  undefined,
  (error) => console.error("Error loading rocks:", error)
);



gltfLoader.load(
  '/assets/models/rocas/scene.gltf',
  (gltf) => {
    const rocas1 = gltf.scene;
    rocas1.scale.set(5, 5, 5);
    rocas1.position.set(-90, 4, 30);
    rocas1.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "roca1";
        objetosInteractivos.push(mesh);
      }
    });
    scene.add(rocas1);
  },
  undefined,
  (error) => console.error("Error loading rocks", error)
);

//model lagun
gltfLoader.load(
  '/assets/models/laguna/scene.gltf',
  (gltf) => {
    const cat = gltf.scene;
    cat.scale.set(0.7, 0.7, 0.7);
    cat.position.set(100, 3, 120);
    cat.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "cat";
        objetosInteractivos.push(mesh);
      }
    });
    
    if (gltf.animations && gltf.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(cat);
      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.play();
      });
      mixers.push(mixer); 
    }
    scene.add(cat);
  },
  undefined,
  (error) => console.error("Error loading bengal:", error)
);

//bridge
gltfLoader.load(
  '/assets/models/puente/scene.gltf',
  (gltf) => {
    const rocas1 = gltf.scene;
    rocas1.scale.set(0.2, 0.2, 0.2);
    rocas1.position.set(5, 3, 5);
    rocas1.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "roca1";
        objetosInteractivos.push(mesh);
      }
    });
    scene.add(rocas1);
  },
  undefined,
  (error) => console.error("Error loading rocks", error)
);


//cages gorilla
gltfLoader.load(
  '/assets/models/jail_cage.glb',
  (gltf) => {
    const cage = gltf.scene;
    cage.scale.set(9, 9, 9);
    cage.position.set(-90, 4, -160);
    cage.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "cage";
        objetosInteractivos.push(mesh);
      }
    });
    scene.add(cage);
  },
  undefined,
  (error) => console.error("Error loading rocks", error)
);


//cages gorilla
gltfLoader.load(
  '/assets/models/jail_cage.glb',
  (gltf) => {
    const cage = gltf.scene;
    cage.scale.set(9, 9, 9);
    cage.position.set(-90, 4, -100);
    cage.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "cage";
        objetosInteractivos.push(mesh);
      }
    });
    scene.add(cage);
  },
  undefined,
  (error) => console.error("Error loading rocks", error)
);

//repisa alligator
gltfLoader.load(
  '/assets/models/repisalarga/scene.gltf',
  (gltf) => {
    const repisa = gltf.scene;
    repisa.scale.set(0.1, 0.1, 0.1);
    repisa.position.set(55, 3, 130);
    repisa.rotation.y = Math.PI / 2; 
    repisa.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "roca1";
        objetosInteractivos.push(mesh);
      }
    });
    scene.add(repisa);
  },
  undefined,
  (error) => console.error("Error loading repisa", error)
);

//estatua alligator
gltfLoader.load(
  '/assets/models/alligator/scene.gltf',
  (gltf) => {
    const cocodrile = gltf.scene;
    cocodrile.scale.set(27, 27, 27);
    cocodrile.position.set(53, 13, 120);
    cocodrile.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "alligator";
        objetosInteractivos.push(mesh);
      }
    });
    scene.add(cocodrile);
  },
  undefined,
  (error) => console.error("Error loading repise cocodrilo", error)
);


const clock = new THREE.Clock(); //constant for movement

// Animation
function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta(); // deltaTime for animation

  // Update all animal animations
  mixers.forEach((mixer) => mixer.update(delta));

// Automatic movement of the person
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

// Raycasting for interactions
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener("click", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(objetosInteractivos, true);

  if (intersects.length > 0) {
    const object = intersects[0].object;
    console.log("Click on:", object.name);

    if (object.name === "duck") {
      mostrarInfo("Duck", "Its physical characteristics define it as an aquatic bird with a short neck, a flattened and wide beak with horny plates on the edges.", "https://www.eurekando.org/wp-content/uploads/2024/07/por-que-los-patos-tienen-una-distribucion-global-amplia.jpg");
    }
    if (object.name === "leon") {
      mostrarInfo("African Lion", "The lion is the king of the African savannah. It lives in prides and roars to communicate.", "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Lion_waiting_in_Namibia.jpg/640px-Lion_waiting_in_Namibia.jpg");
    }
    if (object.name === "gazella") {
      mostrarInfo("Gazella", "They are medium-sized, agile antelopes. They have cinnamon or light brown fur and long, lyre-shaped horns.", "https://upload.wikimedia.org/wikipedia/commons/7/79/Gazella_gazella.jpg");
    }
    if (object.name === "monkey") {
      mostrarInfo("Monkey", "They are mammalian animals, equipped with four prehensile limbs and a tail, with a body covered with various fur.", "https://concepto.de/wp-content/uploads/2021/07/mono-e1626908813287.jpg");
    }
    if (object.name == "hipopotamo") {
      mostrarInfo("Hippopotamus", "A large herbivorous mammal native to sub-Saharan Africa.", "https://concepto.de/wp-content/uploads/2021/07/hipopotamo-e1626653651667-800x400.jpg");
    }
    if (object.name === "tigre") {
      mostrarInfo("Tiger", "The largest cat species, known for its orange coat with black stripes that are unique to each individual.", "https://www.medioambiente.net/wp-content/uploads/tigre3.jpg");
    }
    if (object.name == "gorilla") {
      mostrarInfo("Gorilla", "They are herbivorous primates that inhabit the forests of Africa. They are the largest living primates.", "https://files.worldwildlife.org/wwfcmsprod/images/Gorilla_WWwinter2023/story_full_width/8rwq82enph_Gorilla_WWwinter2023.jpg");
    }
    if (object.name == "Cabra") {
      mostrarInfo("Goat", "A herbivorous mammal known for its agility, climbing ability, and adaptability to various environments.", "https://s3.animalia.bio/animals/photos/full/original/chc3a8vre-naine-rouan.webp");
    }
    if (object.name == "Venado") {
      mostrarInfo("Deer", "Herbivorous animals with slender yet robust bodies, varying in size and coloration depending on the species.", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7eLyTg7mTPuwBVCfF2Xy224bPCBmfajHwwQ&s");
    }
    if (object.name == "Venadobebe") {
      mostrarInfo("Young Deer", "Deer are slim and well-proportioned animals with long, thin legs that allow them to move swiftly.", "https://www.zoobioparqueamaru.com/nos-animaux/mamiferos/56-zoo-cuenca.jpg");
    }
    if (object.name == "sheep") {
      mostrarInfo("Sheep", "A quadruped hoofed domestic mammal commonly raised for wool, meat, and milk.", "https://lh5.googleusercontent.com/proxy/K-vsF07ys880KPc994WBBCCm8zTK8eP0Zj3RTU0QW7Zt1XLTQwgm0UpbclTA7qB4dAFpyj_sRIcW1ccsOi6M-tRY6ffsI-7DOsVuJoi511Bz");
    }
    if (object.name == "antelope") {
      mostrarInfo("Antelope", "Hoofed mammals with hollow horns, often confused with deer.", "https://www.fao.org/4/v8300s/v8300s10.jpg");
    }
    if (object.name == "zebra") {
      mostrarInfo("zebra", "They are quadruped mammals native to Africa, belonging to the genus Equus. They are characterized by their distinctive black and white striped fur.", "https://upload.wikimedia.org/wikipedia/commons/f/f2/Beautiful_Zebra_in_South_Africa.JPG");
    }
    if (object.name == "iguana") {
      mostrarInfo("Iguana", "It is a medium-sized reptile that is native to tropical areas of the American continent such as Central America.", "https://upload.wikimedia.org/wikipedia/commons/2/23/Polish_20230102_131307806_%281%29.jpg");
    }
    if (object.name == "alligator") {
      mostrarInfo("Statue Alligator", "They are large semi-aquatic reptiles that live in the tropical regions of Africa, Asia, America and Australia.", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTWY_igXbeNxLDLOdkC_4YSLP7aa3G9GY96KA&s");
    }
    if (object.name == "turtle") {
      mostrarInfo("Turtle", "Turtles or chelonians form an order of reptiles characterized by having a wide and short trunk, and a shell that protects the internal organs.", "https://media.cnn.com/api/v1/images/stellar/prod/cnne-1144237-jonathan-tortuga.jpg?c=original");
    }
  }
});


// show information
function mostrarInfo(titulo: string, descripcion: string, imagenURL?: string) {
  const panel = document.getElementById("info-panel")!;
  const title = document.getElementById("info-title")!;
  const desc = document.getElementById("info-description")!;
  const img = document.getElementById("info-image") as HTMLImageElement;

  title.textContent = titulo;
  desc.textContent = descripcion;

  if (imagenURL) {
    img.src = imagenURL;
    img.style.display = "block";
  } else {
    img.style.display = "none";
  }

  panel.style.display = "block";
}

document.getElementById("close-panel")!.addEventListener("click", () => {
  const panel = document.getElementById("info-panel")!;
  panel.style.display = "none";
});

// Adjust when resizing
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
