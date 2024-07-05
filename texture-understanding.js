import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { degToRad } from 'three/src/math/MathUtils.js';

// CReatinga a scene and a camera.
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Creating a renderer.
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);


// Create a geometry
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
cube.position.set(0, 1, 0)
// scene.add(cube);
camera.position.z = 5;

// Setting up orbital controls.
const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

// Adding grid
// const size = 10;
// const divisions = 10;
// const gridHelper = new THREE.GridHelper(size, divisions);
// scene.add(gridHelper);


// Adding ambient light
const light = new THREE.AmbientLight(0x404040); // soft white light
light.intensity = 300
scene.add(light);

// main code for textures:
// Load the textures here first in order to use them.
// const colorTexture = new THREE.TextureLoader().load('forest-floor-bl/forest_floor_albedo.png');
// const heightTexture = new THREE.TextureLoader().load('forest-floor-bl/forest_floor_Height.png');
// const normalTexture = new THREE.TextureLoader().load('forest-floor-bl/forest_floor_Normal-ogl.png',() => console.log("Texureamsdkm"));
// const aoTexture = new THREE.TextureLoader().load('forest-floor-bl/forest_floor-ao.png');
// const roughnessTexture = new THREE.TextureLoader().load('forest-floor-bl/forest_floor_Roughness.png')
// const metallicTexture = new THREE.TextureLoader().load('forest-floor-bl/forest_floor_Metallic.png')

const colorTexture = new THREE.TextureLoader().load('tidal-pool2-bl/tidalpool2_albedo.png');
colorTexture.colorSpace = THREE.SRGBColorSpace
const heightTexture = new THREE.TextureLoader().load('tidal-pool2-bl/tidalpool2_height.png');
const normalTexture = new THREE.TextureLoader().load('tidal-pool2-bl/tidalpool2_normal-ogl.png');
const aoTexture = new THREE.TextureLoader().load('tidal-pool2-bl/tidalpool2_ao.png');
const roughnessTexture = new THREE.TextureLoader().load('tidal-pool2-bl/tidalpool2_roughness.png')
const metallicTexture = new THREE.TextureLoader().load('tidal-pool2-bl/tidalpool2_metallic.png')

const planeGeometry = new THREE.PlaneGeometry(40, 40, 500, 500);
const planeMaterial = new THREE.MeshPhysicalMaterial({
    color: 'gray',
    side: THREE.DoubleSide,
    wireframe: true,
    map: colorTexture, // adds the basic color the the palne
    transparent: false,
    displacementMap: heightTexture, // Adds the height to the mesh, chages the geometry of the mesh.
    normalMap: normalTexture, // Provides normal information to create the illusion of surface detail without changing the geometry.
    aoMap: aoTexture, // Adds shadow detail to the model, making it appear more realistic by simulating the way light is naturally blocked in tight spaces.
    aoMapIntensity: 1,
    roughnessMap: roughnessTexture,
    roughness: 1,
    metalnessMap: metallicTexture,
});
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
planeMesh.rotateX(degToRad(90));
scene.add(planeMesh);


// // Step - 1 Create a plane geometry to lay textures over it
// const planeGeometry = new THREE.PlaneGeometry(10, 10, 20, 20)
// const planeMaterial = new THREE.MeshStandardMaterial({
//     color: 'white',
//     side: THREE.DoubleSide,
//     wireframe: true,
//     map: colorTexture,
//     transparent: false
// })
// const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial)
// planeMesh.rotateX(degToRad(90))
// scene.add(planeMesh)


// const spotLight = new THREE.SpotLight('white')
// spotLight.position.set(40, 20, 0)
// spotLight.intensity = 1000

// const spotLight2 = new THREE.SpotLight('white')
// spotLight2.position.set(-40, 20, 0)
// spotLight2.intensity = 10000

// const spotLight3 = new THREE.SpotLight('white')
// spotLight3.position.set(0, 20, 40)
// spotLight3.intensity = 1000

// const spotLight4 = new THREE.SpotLight('white')
// spotLight4.position.set(0, 20, -40)
// spotLight4.intensity = 10000


// const spotLightHelper = new THREE.SpotLightHelper(spotLight);
// const spotLightHelper2 = new THREE.SpotLightHelper(spotLight2);
// const spotLightHelper3 = new THREE.SpotLightHelper(spotLight3);
// const spotLightHelper4 = new THREE.SpotLightHelper(spotLight4);
// scene.add(spotLight, spotLight2, spotLight3, spotLight4)


// Render the scene with the camera
function animate() {
    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);