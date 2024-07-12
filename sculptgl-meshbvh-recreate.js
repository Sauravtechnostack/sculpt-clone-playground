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
import { paintTool } from './sculpting-tools/paintTool';
import { extractTool } from './sculpting-tools/extractTool';


// Set the BVH to global threejs object
THREE.Mesh.prototype.raycast = acceleratedRaycast;
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;

// Declare variables 
let scene, camera, renderer, controls;

let geometry, targetMesh, brush, bvhHelper;
let brushActive = false;
let normalZ = new THREE.Vector3(0, 0, 1);
let mouse = new THREE.Vector2(), lastMouse = new THREE.Vector2();
let mouseState = false, lastMouseState = false;
let lastCastPose = new THREE.Vector3();
const colorTexture = new THREE.TextureLoader().load('forest-floor-bl/forest_floor_albedo.png')
colorTexture.colorSpace = THREE.SRGBColorSpace
let material = new THREE.MeshStandardMaterial({ vertexColors: true, map: colorTexture });

let currentState = 'pain'


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
    const light = new THREE.DirectionalLight(0xffffff, 5);
    light.position.set(1, 1, 1);
    const light2 = new THREE.DirectionalLight(0xffffff, 5);
    light2.position.set(-1, 1, 1);
    // scene.add(light);
    // scene.add(light2);
    scene.add(new THREE.AmbientLight(0xffffff, 4));

    // Setup Camera.
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 50);
    camera.position.set(0, 0, 3);
    camera.far = 100;
    camera.updateProjectionMatrix();

    // Add orbitalcontrols
    controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 1.5;

    // Addd brush. Only visible when over the object.
    const brushSegments = [new THREE.Vector3(), new THREE.Vector3(0, 0, 1)];
    for (let i = 0; i < 50; i++) {
        // These 50 iterations will create 50 segmets which together will create a circle.

        const nexti = i + 1;
        const x1 = Math.sin(2 * Math.PI * i / 50);
        const y1 = Math.cos(2 * Math.PI * i / 50);

        const x2 = Math.sin(2 * Math.PI * nexti / 50);
        const y2 = Math.cos(2 * Math.PI * nexti / 50);

        brushSegments.push(
            new THREE.Vector3(x1, y1, 0),
            new THREE.Vector3(x2, y2, 0)
        );
    }
    brush = new THREE.LineSegments();
    brush.geometry.setFromPoints(brushSegments);
    brush.material.color.set(0xfb8c00);
    scene.add(brush);


    // Add Grid Controls.
    const grid = new THREE.GridHelper(10)
    scene.add(grid)

    // Add a basic geometry on the screen to work upon.
    // merge the vertices because they're not already merged
    // let geometry = new THREE.IcosahedronGeometry(1, 65);
    // let geometry = new THREE.SphereGeometry(1,40,40)
    // let geometry = new THREE.TorusKnotGeometry(1)
    geometry = new THREE.BoxGeometry(undefined, undefined, undefined, 2, 2, 2)
    geometry.deleteAttribute('uv');
    geometry = BufferGeometryUtils.mergeVertices(geometry);
    geometry.attributes.position.setUsage(THREE.DynamicDrawUsage);
    geometry.attributes.normal.setUsage(THREE.DynamicDrawUsage);
    geometry.computeBoundsTree({ setBoundingBox: false });
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(geometry.attributes.position.count * 3).fill(0.1), 3))

    // Ensure the geometry is indexed
    if (!geometry.getIndex()) {
        geometry = BufferGeometryUtils.mergeVertices(geometry);
    }


    // disable frustum culling because the verts will be updated
    targetMesh = new THREE.Mesh(
        geometry,
        material,
    );
    targetMesh.frustumCulled = false;
    material.wireframe = false;
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
        mouseState = Boolean(e.buttons & 3); // Mouse state will be false
    })
}

function render() {
    mainRenderLogic();
    lastMouseState = mouseState;
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}

function brushStroke(point, brushObject, brushOnly = false, accumulatedFields = {}) {
    const {
        accumulatedTriangles = new Set(),
        accumulatedIndices = new Set(),
        accumulatedTraversedNodeIndices = new Set(),
    } = accumulatedFields;
    // Get the inverse matrix of the world space 
    // const inverseMatrix = new THREE.Matrix4();
    // inverseMatrix.copy( targetMesh.matrixWorld ).invert();


    // Create a sphere where my mouse is and make sure it can use the local space of the target mesh instead of global space as inorder to manipulate the object we need objects local space.
    const sphere = new THREE.Sphere(point);
    sphere.radius = 0.1
    // sphere.center.copy( point ).applyMatrix4( inverseMatrix );

    // Create the bvh
    const bvh = targetMesh.geometry.boundsTree
    const indices = new Set(); // Store indices that are intersecting (index is a value given to the set of three vertices).
    const tempVec = new THREE.Vector3(); // A temperory vector.
    const normal = new THREE.Vector3(); // Vetor that will have all the vectors that will be used to calculate the normals.
    const indexAttr = targetMesh.geometry.index; // this has all the indexes of the mesh that we need to update.
    const posAttr = targetMesh.geometry.attributes.position;
    const colorAttr = targetMesh.geometry.attributes.color;
    const normalAttr = targetMesh.geometry.attributes.normal;
    const triangles = new Set();
    bvh.shapecast({
        intersectsBounds(box, isLeaf, score, depth, nodeIndex) {
            const ifIntersect = sphere.intersectsBox(box);
            return ifIntersect ? INTERSECTED : NOT_INTERSECTED;
        },
        intersectsTriangle(triangle, triangleIndex, contained) {
            const triIndex = triangleIndex;
            triangles.add(triIndex);
            accumulatedTriangles.add(triIndex);

            const i3 = 3 * triangleIndex;
            const a = i3 + 0;
            const b = i3 + 1;
            const c = i3 + 2;
            const va = indexAttr.getX(a);
            const vb = indexAttr.getX(b);
            const vc = indexAttr.getX(c);
            if (sphere.containsPoint(triangle.a)) {
                indices.add(va);
                accumulatedIndices.add(va);
            }

            if (sphere.containsPoint(triangle.b)) {
                indices.add(vb);
                accumulatedIndices.add(vb);
            }

            if (sphere.containsPoint(triangle.c)) {
                indices.add(vc);
                accumulatedIndices.add(vc);
            }

            return false;
        }
    });

    // Go through all the indices and find the normal of all the indices that we just retrieved. This will help us placing the brush properly.
    indices.forEach((index) => {
        // Get the normals accociated with each index. (Face) This will give us the normal of the "point" that was intersected by Ray Tracer.
        tempVec.fromBufferAttribute(normalAttr, index);
        normal.add(tempVec)
    })

    // Normalize the accumlated normal.
    normal.normalize()
    brushObject.quaternion.setFromUnitVectors(normalZ, normal)

    // Above code just adjusted the brush view
    // Now lets perform the vertex transformation.
    if (brushActive && mouseState) {
        indices.forEach(index => {
            if (currentState === 'paint') {
                paintTool(colorAttr, index)
            } else {
                extractTool(posAttr, normalAttr, index)

                // Optionally, recompute bounding volumes to ensure proper rendering and raycasting
                geometry.computeBoundingBox();
                geometry.computeBoundingSphere();
            }
        })
    }

}

function mainRenderLogic() {
    // If the controls are being used then don't perform the strokes.
    if (controls.active || !brushActive) {
        brush.visible = false;
        lastCastPose.setScalar(Infinity);
    } else {
        // Cast a ray on each render call.
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        raycaster.firstHitOnly = true;
        const hit = raycaster.intersectObject(targetMesh, true)[0];

        if (hit) {
            brush.visible = true
            brush.position.copy(hit.point)
            brush.scale.set(0.1, 0.1, 0.1)

            if (lastCastPose.x === Infinity) {
                lastCastPose.copy(hit.point);
            }

            brushStroke(hit.point, brush)
        } else {
            console.log("No hit")
        }
    }
}