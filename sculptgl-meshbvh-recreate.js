import * as dat from 'lil-gui'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
    acceleratedRaycast,
    computeBoundsTree,
    disposeBoundsTree,
    CONTAINED,
    INTERSECTED,
    NOT_INTERSECTED,
    MeshBVHHelper,
} from 'three-mesh-bvh';
import { BufferGeometryUtils } from 'three/examples/jsm/Addons.js';


// Set the BVH to global threejs object
THREE.Mesh.prototype.raycast = acceleratedRaycast;
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;

// Declare variables 
let scene, camera, renderer, controls;

let targetMesh, brush, bvhHelper;
let brushActive = false;

let mouse = new THREE.Vector2(), lastMouse = new THREE.Vector2();
let mouseState = false, lastMouseState = false;
let lastCastPose = new THREE.Vector3();
let material;

// Function call to initialize things
init();
render();


// Function to initialize everything.
function init() {
    // Setup the Renderer.
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x060609, 1);
    renderer.outputEncoding = THREE.sRGBEncoding;
    document.body.appendChild(renderer.domElement);
    renderer.domElement.style.touchAction = 'none';

    // Setup Scene.
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x263238 / 2, 20, 60);

    // Add light to the scene.
    const light = new THREE.DirectionalLight(0xffffff, 0.5);
    light.position.set(1, 1, 1);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));

    // Setup Camera.
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 50);
    camera.position.set(0, 0, 3);
    camera.far = 100;
    camera.updateProjectionMatrix();

    // Add orbitalcontrols
    controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 1.5;

    // Addd brush. Only visible when over the object.
	const brushSegments = [ new THREE.Vector3(), new THREE.Vector3( 0, 0, 1 ) ];
	for ( let i = 0; i < 50; i ++ ) {
        // These 50 iterations will create 50 segmets which together will create a circle.

		const nexti = i + 1;
		const x1 = Math.sin( 2 * Math.PI * i / 50 );
		const y1 = Math.cos( 2 * Math.PI * i / 50 );

		const x2 = Math.sin( 2 * Math.PI * nexti / 50 );
		const y2 = Math.cos( 2 * Math.PI * nexti / 50 );

		brushSegments.push(
			new THREE.Vector3( x1, y1, 0 ),
			new THREE.Vector3( x2, y2, 0 )
		);
	}
	brush = new THREE.LineSegments();
	brush.geometry.setFromPoints( brushSegments );
	brush.material.color.set( 0xfb8c00 );
    // brush.position.set(3,1,0)
	scene.add( brush );


    // Add Grid Controls.
    const grid = new THREE.GridHelper(10)
    scene.add(grid)

    // Add a basic geometry on the screen to work upon.
    // merge the vertices because they're not already merged
    let geometry = new THREE.IcosahedronGeometry(1, 100);
    geometry.deleteAttribute('uv');
    geometry = BufferGeometryUtils.mergeVertices(geometry);
    geometry.attributes.position.setUsage(THREE.DynamicDrawUsage);
    geometry.attributes.normal.setUsage(THREE.DynamicDrawUsage);
    geometry.computeBoundsTree({ setBoundingBox: false });

    // disable frustum culling because the verts will be updated
    targetMesh = new THREE.Mesh(
        geometry,
        material,
    );
    targetMesh.frustumCulled = false;
    scene.add(targetMesh);

    // Add event listeners.
    document.addEventListener('pointermove', (e) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = - (e.clientY / window.innerHeight) * 2 + 1;
        brushActive = true;
    })
    document.addEventListener('pointerdown', (e) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = - (e.clientY / window.innerHeight) * 2 + 1;
        mouseState = Boolean(e.buttons & 3); // Will be true
        brushActive = true;

        // Cast a ray an if intersection happens from that point then stop orobitalcontrols
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        raycaster.firstHitOnly = true;
        const res = raycaster.intersectObject(targetMesh);
        controls.enabled = res.length === 0;
    })

    document.addEventListener('pointerup', (e) => {
        mouseState = Boolean( e.buttons & 3 ); // Mouse state will be false
    })
}

function render() {
    mainRenderLogic();
    lastMouseState = mouseState;
    requestAnimationFrame( render );
    renderer.render( scene, camera );
}

function brushStroke(point,brushObject,brushOnly = false, accumulatedFields = {}) {
    console.log("Brush Object: ", brushObject);
    console.log("Point: ", point)

    // Create the bvh    
}

function mainRenderLogic() {
    // If the controls are being used then don't perform the strokes
    if ( controls.active || ! brushActive ) {
		// brush.visible = false;
		lastCastPose.setScalar( Infinity );
	}else{
        // Cast a ray on each render call.
        const raycaster = new THREE.Raycaster();
		raycaster.setFromCamera( mouse, camera );
		raycaster.firstHitOnly = true;
		const hit = raycaster.intersectObject( targetMesh, true )[ 0 ];
        // console.log("Last mouse: ", lastMouse)
        // console.log("Last mouseState: ", lastMouseState)
        // console.log("Lastcast pos: ", lastCastPose)

        if(hit){
            brush.visible= true
            brush.position.copy(hit.point)
            brush.scale.set(0.1,0.1,0.1)

            if ( lastCastPose.x === Infinity ) {
				lastCastPose.copy( hit.point );
			}

            brushStroke(hit.point,brush)
        }else{
            console.log("No hit")
        }
        // If no object then 

        // Calculate on every render how much mouse has moved(for 2d)
        // ALso check how much mouse has moved in 3d using raycasting diff
        // Skip the smoothing part for now!
        // Goto the brush part.
        
    }
}