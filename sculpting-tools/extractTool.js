import * as THREE from 'three';

export const extractTool = (positionAttr, normalAttr, index) => {
    // Find the direction in which we need to extract the surface to. It must be perpendicular to the surface thus we need to fund the normal to the given vertex.
    const positionVector = new THREE.Vector3().fromBufferAttribute(positionAttr, index); // Vector that we need to scale.
    const normalVector = new THREE.Vector3().fromBufferAttribute(normalAttr, index); // Direction in which we need to scale the given vector.

    // Calculate the dot product of position wrt normal.
    const updatedPositionVector = positionVector.dot(normalVector); // find the dot product.
    // Calculate the projection of A onto B.
    const projection = normalVector.multiplyScalar(updatedPositionVector); // Get the projection vector.

    // New scaled vector 
    const scaledVector = projection.multiplyScalar(0.1) // Scale the projection vector by a given number(intencity)

    // Add the scaled vector back to the original vector, this will magnify the original vectors in the scaled vector direction
    const finalUpdatedVector = positionVector.add(scaledVector);

    // Update the position attribute
    positionAttr.setXYZ(index, finalUpdatedVector.x, finalUpdatedVector.y, finalUpdatedVector.z)

    // Let three js know to update the geometry.
    positionAttr.needsUpdate = true
}



/**
 * We want to scale a given vector A by a factor x in the direction of another vector B (the normal).

Step-by-Step Explanation
Understand the Vectors:

Vector A: This is the vector we want to scale.
Vector B: This is the direction in which we want to scale vector A. We will refer to this as the "normal vector".
Normalize the Normal Vector:
To make sure that the scaling happens correctly in the direction of B, we first need to normalize B. Normalizing a vector means converting it to a unit vector (a vector with a length of 1).

To normalize B, we divide it by its magnitude (length). The magnitude of B is calculated as:

∥𝐵∥=𝐵𝑥2+𝐵𝑦2+𝐵𝑧2∥B∥= B x2​ +B y2​ +B z2​ ​
 
Then, the normalized vector B (let's call it B_norm) is:

𝐵norm=𝐵∥𝐵∥=(𝐵𝑥∥𝐵∥,𝐵𝑦∥𝐵∥,𝐵𝑧∥𝐵∥)B norm​ =∥B∥B​ =( ∥B∥B x​ ​ , ∥B∥B y​ ​ , ∥B∥B z​ ​ )

Project Vector A onto Vector B_norm:
To find the component of A that is in the direction of B, we project A onto B_norm. This is done using the dot product. The projection (let's call it A_proj) is calculated as:

𝐴proj=(𝐴⋅𝐵norm)𝐵normA proj​ =(A⋅B norm​ )B norm​ 

Where:𝐴⋅𝐵norm=𝐴𝑥𝐵norm𝑥+𝐴𝑦𝐵norm𝑦+𝐴𝑧𝐵norm𝑧A⋅B norm​ =A x​ B norm x​ ​ +A y​ B norm y​ ​ +A z​ B norm z​ 
​

Scale the Projection:
Now, we scale the projected vector A_proj by the factor x:

𝐴scaled=𝑥⋅𝐴projA scaled​ =x⋅A proj​
 
Add the Scaled Vector Back to the Original Vector:
To get the final scaled vector in the direction of B, we add the scaled projection back to A:

𝐴final=𝐴+(𝑥−1)⋅𝐴projA final​ =A+(x−1)⋅A proj
​
This accounts for scaling the vector A in the direction of B by a factor of x.
 */