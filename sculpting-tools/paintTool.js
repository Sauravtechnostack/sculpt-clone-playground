import * as THREE from 'three';

export const paintTool = (colorAttr, index) => {
    const vertexVectorTochange = new THREE.Vector3().fromBufferAttribute(colorAttr,index);
    vertexVectorTochange.set(1,1,1);
    colorAttr.setXYZ(index,vertexVectorTochange.x, vertexVectorTochange.y, vertexVectorTochange.z)
    colorAttr.needsUpdate= true
}