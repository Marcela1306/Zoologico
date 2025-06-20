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
gltfLoader.load('public/assets/models/modelo.glb', (gltf) => {
    const model = gltf.scene;
    console.log('Loaded Model:', model); 
    model.scale.set(2, 2, 2); 
    model.position.set(90, 9, 30); 

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
    leon.position.set(-100, 2, -50); 
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
    leon1.position.set(-90, 2, -60); 
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


// Load GLTF pig (already in position)
gltfLoader.load(
  '/assets/models/pig/scene.gltf',
  (gltf) => {
    const pig = gltf.scene;
    pig.scale.set(13, 13, 13);
    pig.position.set(-120, 5, -120);
    pig.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "pig";
        objetosInteractivos.push(mesh);
      }
    });
    scene.add(pig);
  },
  undefined,
  (error) => console.error("Error when loading pork:", error)
);

gltfLoader.load(
  '/assets/models/piglet/scene.gltf',
  (gltf) => {
    const piglet = gltf.scene;
    piglet.scale.set(1, 1, 1);
    piglet.position.set(-110, 5, -110);
    piglet.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "piglet";
        objetosInteractivos.push(mesh);
      }
    });

    if (gltf.animations && gltf.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(piglet);
      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.play();
      });
      mixers.push(mixer); 
    }
    scene.add(piglet);
  },
  undefined,
  (error) => console.error("Error when loading pork:", error)
);

gltfLoader.load(
  '/assets/models/piglet/scene.gltf',
  (gltf) => {
    const piglet = gltf.scene;
    piglet.scale.set(1, 1, 1);
    piglet.position.set(-100, 5, -120);
    piglet.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "piglet";
        objetosInteractivos.push(mesh);
      }
    });

    if (gltf.animations && gltf.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(piglet);
      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.play();
      });
      mixers.push(mixer); 
    }
    scene.add(piglet);
  },
  undefined,
  (error) => console.error("Error when loading pork:", error)
);

// Load GLTF Hippo (already in position)
gltfLoader.load(
  '/assets/models/hipposs/scene.gltf',
  (gltf) => {
    const hippo = gltf.scene;
    hippo.scale.set(0.2, 0.2, 0.2);
    hippo.position.set(70, 8, -135);
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

// Load GLTF tiger (already in position)
gltfLoader.load(
  '/assets/models/tiger/scene.gltf',
  (gltf) => {
    const tiger = gltf.scene;
    tiger.scale.set(7, 7, 7);
    tiger.position.set(-100, 3, -1);
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
    antelope.position.set(40, 4, 25);
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
    antelope.position.set(35, 4, 40);
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
    venado.position.set(-20, 2, -30);
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
    venadob.position.set(-10, 2, -30);
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
    venadob1.position.set(-25, 2, -20);
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
    goat.position.set(-10, 2, -120);
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
    sheep.position.set(-10, 2, -90); 
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
    sheep1.position.set(-20, 2, -120); 
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


// Load GLTF birds (already in position)
gltfLoader.load(
  '/assets/models/bird/scene.gltf',
  (gltf) => {
    const bird = gltf.scene;
    bird.scale.set(1, 1, 1);
    bird.position.set(80, 4, 50);
    bird.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "birds";
        objetosInteractivos.push(mesh);
      }
    });
     
    if (gltf.animations && gltf.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(bird);
      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.play();
      });
      mixers.push(mixer); 
    }
    scene.add(bird);
  },
  undefined,
  (error) => console.error("Error loading bird", error)
);

gltfLoader.load(
  '/assets/models/birds/scene.gltf',
  (gltf) => {
    const birds = gltf.scene;
    birds.scale.set(2, 2, 2);
    birds.position.set(80, 10, 30);
    birds.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "bird";
        objetosInteractivos.push(mesh);
      }
    });
    
    if (gltf.animations && gltf.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(birds);
      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.play();
      });
      mixers.push(mixer); 
    }
    scene.add(birds);
  },
  undefined,
  (error) => console.error("Error loading bird", error)
);

// Load GLTF Bengal (already in position)
gltfLoader.load(
  '/assets/models/bengal_cat/scene.gltf',
  (gltf) => {
    const cat = gltf.scene;
    cat.scale.set(4, 4, 4);
    cat.position.set(100, 10, 50);
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


gltfLoader.load(
  '/assets/models/bengal_cat/scene.gltf',
  (gltf) => {
    const cat = gltf.scene;
    cat.scale.set(4, 4, 4);
    cat.position.set(100, 10, 40);
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

// Load GLTF coffeshop (already in position)
gltfLoader.load(
  '/assets/models/cafeteria_salle/scene.gltf',
  (gltf) => {
    const cafeteria = gltf.scene;
    cafeteria.scale.set(1.7, 1.7, 1.7);
    cafeteria.position.set(79, 8, -14);
    
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
    bathroom.position.set(67, 5, -80);
    
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
    banca.position.set(30, 3, -30);
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
    banca1.position.set(-100, 3, 50);
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
    afrutal.position.set(-120, 3, 50);
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
    afrutal1.position.set(40, 8, -135);
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
    arbole.position.set(100, 5, 40);
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
    arboles.position.set(10, 6, -170);
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
    rocas.position.set(-115, 3, 10);
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
    rocas1.position.set(-115, 3, -60);
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

    if (object.name === "porton") {
      mostrarInfo("Zoo Entrance Gate", "This gate opens when a valid ticket is shown.");
    }
    if (object.name === "leon") {
      mostrarInfo("African Lion", "The lion is the king of the African savannah. It lives in prides and roars to communicate.", "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Lion_waiting_in_Namibia.jpg/640px-Lion_waiting_in_Namibia.jpg");
    }
    if (object.name === "piglet") {
      mostrarInfo("Piglet", "A domestic animal commonly raised for food in many cultures.", "https://www.animanaturalis.org/img/pages/full/202005/P27-11697.jpg");
    }
    if (object.name === "pig") {
      mostrarInfo("Pig", "A domestic animal commonly raised for food in many cultures.", "https://www.animanaturalis.org/img/pages/full/202005/P27-11697.jpg");
    }
    if (object.name == "hipopotamo") {
      mostrarInfo("Hippopotamus", "A large herbivorous mammal native to sub-Saharan Africa.", "https://concepto.de/wp-content/uploads/2021/07/hipopotamo-e1626653651667-800x400.jpg");
    }
    if (object.name === "tigre") {
      mostrarInfo("Tiger", "The largest cat species, known for its orange coat with black stripes that are unique to each individual.", "https://www.medioambiente.net/wp-content/uploads/tigre3.jpg");
    }
    if (object.name == "bird") {
      mostrarInfo("Parakeet", "Also known as budgerigar, this colorful bird is the smallest member of the parrot family.", "https://www.zoobioparqueamaru.com/nos-animaux/aves/28-zoo-cuenca.jpg");
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
    if (object.name == "cat") {
      mostrarInfo("Bengal Cat", "A relatively new breed, resulting from a cross between an Asian leopard cat and a domestic cat in the U.S.", "https://cdn.shopify.com/s/files/1/0692/9586/6135/files/Imagen4_a792b44d-55f4-4306-b725-ff840ccc0b46_480x480.png?v=1703242597");
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
