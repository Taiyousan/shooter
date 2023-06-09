import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import * as dat from 'lil-gui'
// MainStuff:Setup
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, .1, 1000);
let renderer = new THREE.WebGLRenderer();

let controls = {};
let player = {
  height: .5,
  turnSpeed: .1,
  speed: .1,
  jumpHeight: .2,
  gravity: .01,
  velocity: 0,
  
  playerJumps: false
};
let mouseX = 0

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
scene.background = new THREE.Color("black");
document.body.appendChild(renderer.domElement);

// BrowserWindow->Renderer:ResizeRe-Render
window.addEventListener('resize', () => {
  let w = window.innerWidth,
      h = window.innerHeight;
  
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
});

// Camera:Setup
camera.position.set(0, player.height, -5);
camera.lookAt(new THREE.Vector3(0, player.height, 0));

// Object:Box1
let BoxGeometry1 = new THREE.BoxGeometry(1, 1, 1);
let BoxMaterial1 = new THREE.MeshBasicMaterial({ color: "white", wireframe: false });
let Box1 = new THREE.Mesh(BoxGeometry1, BoxMaterial1);

Box1.position.y = 3;
Box1.scale.x = Box1.scale.y = Box1.scale.z = .25;
scene.add(Box1);

// Object:Box2
let BoxGeometry2 = new THREE.BoxGeometry(1, 1, 1);
let BoxMaterial2 = new THREE.MeshPhongMaterial({ color: "white", wireframe: false });
let Box2 = new THREE.Mesh(BoxGeometry2, BoxMaterial2);

Box2.position.y = .75;
Box2.position.x = 0;
Box2.receiveShadow = true;
Box2.castShadow = true;

scene.add(Box2);


// Object:Plane
let PlaneGeometry1 = new THREE.PlaneGeometry(10, 10);
let PlaneMaterial1 = new THREE.MeshPhongMaterial({ color: "white", wireframe: false });
let Plane1 = new THREE.Mesh(PlaneGeometry1, PlaneMaterial1);

Plane1.rotation.x -= Math.PI / 2;
Plane1.scale.x = 3;
Plane1.scale.y = 3;
Plane1.receiveShadow = true;
scene.add(Plane1);

// Object:Light:1
let light1 = new THREE.PointLight("white", .8);
light1.position.set(0, 3, 0);
light1.castShadow = true;
light1.shadow.camera.near = 2.5;
scene.add(light1);

// Object:Light:2
let light2 = new THREE.AmbientLight("white", .15);
light2.position.set(10, 2, 0);
scene.add(light2);

// Controls:Listeners
document.addEventListener('keydown', ({ keyCode }) => { controls[keyCode] = true });
document.addEventListener('keyup', ({ keyCode }) => { controls[keyCode] = false });
document.addEventListener('mousemove', (e) => {
    if(e.clientX > mouseX){
        // Vers la droite
         mouseX = e.clientX
        console.log('droite')
        camera.rotation.y += player.turnSpeed * 0.1;
    }else if (e.clientX < mouseX){
        mouseX = e.clientX
        console.log('gauche')
        camera.rotation.y -= player.turnSpeed * 0.1;
    }
   centerMouse()
})

// ...
function control() {
  // Controls:Engine 
  if(controls[87]){ // w
    camera.position.x -= Math.sin(camera.rotation.y) * player.speed;
    camera.position.z -= -Math.cos(camera.rotation.y) * player.speed;
  }
  if(controls[83]){ // s
    camera.position.x += Math.sin(camera.rotation.y) * player.speed;
    camera.position.z += -Math.cos(camera.rotation.y) * player.speed;
  }
  if(controls[65]){ // a
    camera.position.x += Math.sin(camera.rotation.y + Math.PI / 2) * player.speed;
    camera.position.z += -Math.cos(camera.rotation.y + Math.PI / 2) * player.speed;
  }
  if(controls[68]){ // d
    camera.position.x += Math.sin(camera.rotation.y - Math.PI / 2) * player.speed;
    camera.position.z += -Math.cos(camera.rotation.y - Math.PI / 2) * player.speed;
  }
  if(controls[37]){ // la
    camera.rotation.y -= player.turnSpeed;
  }
  if(controls[39]){ // ra
    camera.rotation.y += player.turnSpeed;
  }
  if(controls[32]) { // space
    if(player.jumps) return false;
    player.jumps = true;
    player.velocity = -player.jumpHeight;
  }
}

function ixMovementUpdate() {
  player.velocity += player.gravity;
  camera.position.y -= player.velocity;
  
  if(camera.position.y < player.height) {
    camera.position.y = player.height;
    player.jumps = false;
  }
}

function ixLightcubeAnimation() {
  let a = .01;
  Box1.rotation.x += a;
  Box1.rotation.y += a;
}

function update() {
  control();
  ixMovementUpdate();
//   ixLightcubeAnimation();w
}

function centerMouse() {
    const screenWidth = window.innerWidth || document.documentElement.clientWidth;
    const screenHeight = window.innerHeight || document.documentElement.clientHeight;
    const centerX = Math.floor(screenWidth / 2);
    const centerY = Math.floor(screenHeight / 2);
    
    window.moveTo(centerX, centerY);
    console.log('centerMouse')
  }

function render() {
  renderer.render(scene, camera);
}

function loop() {
  requestAnimationFrame(loop);
  update();
  render();
}

loop();