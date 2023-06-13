import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import * as dat from 'lil-gui'
import * as CANNON from 'cannon-es'
import gsap from 'gsap'

const textureLoader = new THREE.TextureLoader()
const fbxLoader = new FBXLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()
/**
 * Debug
 */
// const gui = new dat.GUI()

/**
 * Physics
 */
// const world = new CANNON.World()
// world.gravity.set(0, - 9.82, 0)



/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
const sky = textureLoader.load('textures/mario.png');

/**
 * Environment Maps
 */
const env2 = cubeTextureLoader.load([
    '/textures/env2Maps/3/px.jpg',
    '/textures/env2Maps/3/nx.jpg',
    '/textures/env2Maps/3/py.jpg',
    '/textures/env2Maps/3/ny.jpg',
    '/textures/env2Maps/3/pz.jpg',
    '/textures/env2Maps/3/nz.jpg'
])

scene.background = env2


/**
 * Textures
 */

const environmentMapTexture = cubeTextureLoader.load([
    '/textures/environmentMaps/0/px.png',
    '/textures/environmentMaps/0/nx.png',
    '/textures/environmentMaps/0/py.png',
    '/textures/environmentMaps/0/ny.png',
    '/textures/environmentMaps/0/pz.png',
    '/textures/environmentMaps/0/nz.png'
])

/**
 * Test sphere
 */
const sphereGeo = new THREE.SphereGeometry(0.5, 32, 32)


// Random targets
const targets = []
// for(let i = 0; i < 100; i++){
//     const sphereMat = new THREE.MeshStandardMaterial({
//         metalness: 0.3,
//         roughness: 0.4,
//         envMap: environmentMapTexture,
//         envMapIntensity: 0.5
//     })
//     const randomness = 100
//     const randomX = (Math.random() - 0.5) * randomness
//     const randomZ = (Math.random() - 0.5) * randomness
//     const randomY = (Math.random() +  0.5) * 2

//     const sphere = new THREE.Mesh(
//         sphereGeo,
//         sphereMat
//     )
//     sphere.castShadow = true
//     sphere.position.y = randomY
//     sphere.position.x = randomX
//     sphere.position.z = randomZ

//     scene.add(sphere)
//     targets.push(sphere)
// }


/**
 * Koopa
 */
fbxLoader.load('./models/koopa-red.fbx', (object) => {
    const originalObject = object;
  
    const numInstances = 100; // Nombre d'instances à générer
  
    for (let i = 0; i < numInstances; i++) {
      const koopa = originalObject.clone();
      koopa.scale.set(0.01, 0.01, 0.01);
      koopa.castShadow = true;
  
      const randomness = 300;
      const randomX = (Math.random() - 0.5) * randomness;
      const randomZ = (Math.random() - 0.5) * randomness;
      const randomY = (Math.random() + 0.5) * 2;
  
      koopa.position.set(randomX, randomY, randomZ);
      koopa.rotation.y = Math.random() * 8
    // koopa.lookAt(camera.position)
      scene.add(koopa);
      targets.push(koopa)
      setVitesseTarget()
    }
  });

  // vitesse et amplitudes aléatoires
function setVitesseTarget(){
    for (const target of targets) {
        const amplitude = Math.random() * 555 + 1; // Amplitude aléatoire entre 1 et 6
        const speed = Math.random() * 0.5 + 1; // Vitesse aléatoire entre 1 et 3
        
        target.userData.amplitude = amplitude;
        target.userData.speed = speed;
    
        // console.log(target.userData)
      }
}


/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(1000, 1000),
    new THREE.MeshStandardMaterial({
        color: '#777777',
        metalness: 0.3,
        roughness: 0.8,
        envMap: environmentMapTexture,
        envMapIntensity: 0.5
    })
)

// Charger l'image de texture
const grassTexture = textureLoader.load('/textures/grass.jpg', () => {
    // Lorsque l'image est chargée, mettez à jour le matériau du sol
    floor.material.map = grassTexture;
    floor.material.needsUpdate = true;
});
grassTexture.wrapS = THREE.RepeatWrapping;
grassTexture.wrapT = THREE.RepeatWrapping;
grassTexture.repeat.set(10, 10);
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)


  


/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 3)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

/**
 *  Raycaster
 */
const raycaster = new THREE.Raycaster();
const raycasterViseur = new THREE.Raycaster();
// raycasterViseur.far = 500
const mouse = new THREE.Vector2();

function updateRaycaster(ray) {
  // Positionne le point de départ du rayon au centre de l'écran (0, 0 étant le coin supérieur gauche)
  mouse.x = 0;
  mouse.y = 0;
  ray.setFromCamera(mouse, camera);
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(40, sizes.width / sizes.height, 0.1, 1000)
camera.position.y = 2
camera.position.z = 2
scene.add(camera)

/**
 * Controls
 */
const appScreen = document.documentElement; 
const controls = new PointerLockControls(camera, canvas)
controls.pointerSpeed = 0.3
console.log(controls)
// Lancer le lock
document.addEventListener('click', function () {
    controls.lock();
    document.querySelector('.startscreen').style.display = 'none';
    appScreen.requestFullscreen();
  });
  // -- Quitter les controles

    // Empecher menu contextuel
    document.addEventListener('contextmenu', function(event) {
        event.preventDefault();
    });
    // Quitter au clic droit
    document.addEventListener('mousedown', function (e) {
        e.preventDefault(); 
        if(e.button === 2){
        controls.unlock();
        document.querySelector('.startscreen').style.display = 'flex'; 
        document.exitFullscreen();
        }
    
  });

  /**
   * FPS Controls
   */
  const vitesse = 0.5
  let isJumping = false;
let isMovingForward = false;

document.addEventListener('keydown', function(event) {
    if (event.key === 'w') {
        isMovingForward = true;
        controls.moveForward(vitesse);
    } else if (event.key === ' ') {
        if (!isJumping) {
            isJumping = true;
            jump();
        }
    }
});

document.addEventListener('keyup', function(event) {
    if (event.key === 'w') {
        isMovingForward = false;
    }
});

function jump() {
    gsap.to(camera.position, {
        y: 8,
        duration: 0.3,
        onComplete: function() {
            gsap.to(camera.position, {
                y: 1,
                duration: 0.3,
                onComplete: function() {
                    isJumping = false;
                }
            });
        }
    });
}
  
  
  

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Shooter
 */
const hitTargets = []
function shooter(){
    console.log('touché')
    updateRaycaster(raycaster)
    const intersects = raycaster.intersectObjects(targets)

    for (const object of targets) {
        if (hitTargets.includes(object)) {
            // La cible est déjà colorée, ne rien faire
        } else {
            //object.material.color.set('#ffffff');
        }
    }
    
    if (intersects.length > 0) {
        const intersect = intersects[0];
        if (!hitTargets.includes(intersect.object)) {
            // intersect.object.material.color.set('red');
            hitTargets.push(intersect.object);
            hitTargetsValue()
            
            scene.remove(intersect.object.parent.parent);
            shootAnim()
        }
    }
}


let isShaking = false;
function shakeGun(){
    isShaking = true;
    const image = document.querySelector('.gun');
    gsap.to(image, {
        rotateY: 30,
        rotateX: 10,
        duration: 0.2,
        onComplete: () => {
          // Animation terminée, réinitialisation de la rotation
          gsap.to(image, {
            rotateY: 0,
            rotateX: 0,
            duration: 0.2,
            onComplete: () => {
              isShaking = false; // Réinitialiser la variable isShaking après réinitialisation de la rotation
            }
          });
        }
      });
}

function shootAnim(){
    // Animation shaking
    // + 1
    const scoreAdd = document.querySelector('.score-add')
    scoreAdd.classList.add('score-add-active')
    setTimeout(() => {
        scoreAdd.classList.remove('score-add-active')
    }, 300)

       // Effet de recul
  const recoilAngle = Math.PI / 180 * 5; // Angle de recul en radians
  const recoilOffset = new THREE.Vector3(0, 0.1, -0.2); // Décalage de la position de la caméra après le tir

  // Créer les valeurs cibles de la transition
  const targetQuaternion = camera.quaternion.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), recoilAngle));
  const targetPosition = camera.position.clone().add(recoilOffset);

  // Animer la transition
  gsap.to(camera.quaternion, { duration: 0.2, ...targetQuaternion, ease: 'power1.out' });
  gsap.to(camera.position, { duration: 0.2, ...targetPosition, ease: 'power1.out' });

  // ...

}

document.addEventListener('click', () => {
    shooter()
    if(!isShaking){
        shakeGun()
    }
})


/**
 * Animate
 */
const clock = new THREE.Clock()


function hitTargetsValue(){
    document.querySelector('.compteur p').innerHTML = hitTargets.length
}

document.addEventListener('keydown', (e) => {
    if(e.key === 'e'){
        for (const target of targets) {
            console.log(target)
          }
    }
})

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()


    // Jump
    if (isMovingForward) {
        controls.moveForward(vitesse);
    }

    // targets move
    
    for (const target of targets) {
        const { amplitude, speed } = target.userData;
        target.children[1].children[0].position.z = Math.sin(elapsedTime * speed) * amplitude + (amplitude + 1);
      }

    for (const target of targets) {
        const { amplitude, speed } = target.userData;
        target.children[1].children[0].position.x = Math.sin(elapsedTime * speed) * amplitude + (amplitude + 1);
      }
    for (const target of targets) {
        const { amplitude, speed } = target.userData;
        target.children[1].children[0].position.y = Math.sin(elapsedTime * speed) * amplitude + (amplitude + 1);
      }
    for (const target of targets) {
        const { amplitude, speed } = target.userData;
        target.children[1].children[0].rotation.z = Math.sin(elapsedTime * 0.001) * amplitude + (amplitude + 1);
      }

    // Update raycaster
    updateRaycaster(raycasterViseur)
    const viseurUnactive = document.querySelector('.viseur-unactive')
    const viseurActive = document.querySelector('.viseur-active')
    const intersects = raycasterViseur.intersectObjects(targets)
    
    if (intersects.length > 0) {
        const intersect = intersects[0];
        if (!hitTargets.includes(intersect.object)) {
            viseurUnactive.classList.add('hidden')
            viseurActive.classList.remove('hidden')
        }
    }else{
        viseurUnactive.classList.remove('hidden')
        viseurActive.classList.add('hidden')
    }

    

    // Render
    renderer.physicallyCorrectLights = true
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()