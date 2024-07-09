Let's imagine the Bounding Volume Hierarchy (BVH) as a huge library with many books, where the goal is to quickly find a specific book without having to look through every single one.

The Library Analogy
1. Nodes as Bookshelves
Description: In our library, nodes are like bookshelves. Each bookshelf (node) contains several books or smaller sections of bookshelves.
Why Needed: Instead of searching through every single book in the entire library, we first decide which bookshelf to look at based on the category of books.
2. Bounding Volumes as Book Sections
Description: Bounding volumes are like sections within a bookshelf labeled with a category. For instance, a bookshelf might have sections labeled "Fantasy," "Science," "History," etc.
Why Needed: These sections help us quickly eliminate entire categories that we're not interested in. If we're looking for a science book, we can ignore all sections labeled "Fantasy" or "History."
3. Leaf Nodes as Individual Books
Description: Leaf nodes are like the actual books in the sections. When we finally get to a specific section, we look at the individual books to find the one we're searching for.
Why Needed: Once we've narrowed down our search to a specific section, we need to check the individual books (leaf nodes) to find the exact one we need.
4. Intermediate Nodes as Category Dividers
Description: Intermediate nodes are like the dividers or labels that split the bookshelf into sections. These dividers might say, "Books starting with A-M" and "Books starting with N-Z."
Why Needed: These dividers help us decide which part of the bookshelf to look at first, further narrowing down our search quickly.





The Process of Finding a Book (Spatial Query)
1. Entering the Library (Starting the Query):
Imagine you enter a huge library looking for a specific science fiction book. Without a system, you'd have to look at every book on every shelf.

2. Looking at the Bookshelves (Nodes):
You first decide which bookshelf to check based on the general category of books. The BVH helps here by organizing the bookshelves into manageable sections.

3. Checking the Book Sections (Bounding Volumes):
Once you're at the right bookshelf, you look at the labeled sections. If you're looking for a science fiction book, you skip all sections that are labeled "History," "Cooking," etc.

4. Reading the Dividers (Intermediate Nodes):
Within the science section, dividers might further split books into "Physics," "Chemistry," "Astronomy," etc. You focus on the "Astronomy" section.

5. Finding the Specific Book (Leaf Nodes):
Finally, you look at the individual books in the "Astronomy" section to find the specific one you need.



Nodes->Bounding Volume-> Intermediate Nodes-> Leaf Nodes



// Workdflow:
1. Prepare the Geometry:
Compute the BVH for your geometry.
geometry.computeBoundsTree();

2. Perform Raycasting:
Use the accelerated raycasting method.
mesh.raycast = acceleratedRaycast;

3. Check for Intersections:
Use methods like intersectRay(), intersectSphere(), intersectBox(), or raycastFirst() to perform your queries.
const intersections = raycaster.intersectObject(mesh);

4. Dispose of BVH:
When done, dispose of the BVH to free resources.
geometry.disposeBoundsTree();


// Components:
Components of BVH
1. Node:
Description: In the context of BVH, a node represents a region of space or a subset of geometry. Nodes can be either internal (non-leaf) or leaf nodes.
Internal Node: Contains references to child nodes or other subdivisions of space.
Leaf Node: Contains actual geometry primitives (such as triangles) or references to them.

2. Bounding Volume:
Description: A bounding volume (often an AABB - Axis-Aligned Bounding Box) is a geometric shape that encloses a set of objects or a region of space.
Purpose: Bounding volumes are used to quickly determine spatial relationships (like intersection) without needing to check individual primitives.

3. Triangles:
Description: Triangles are fundamental geometric primitives used to construct meshes. They consist of three vertices and form the surface of 3D objects.
Purpose: In BVH, triangles are often stored within leaf nodes and are checked for intersections during raycasting or collision detection.


Structure of BVH in a Mesh
1. Nodes in a Mesh:
A mesh typically consists of a hierarchy of BVH nodes that organize its geometry spatially.
Root Node: At the top of the hierarchy is the root node, which encompasses the entire mesh.
Internal Nodes: These nodes recursively divide space or geometry into smaller regions or subsets.
Leaf Nodes: These nodes contain actual geometry primitives (such as triangles) or references to them.

2. Hierarchy Breakdown:
Construction: BVH construction starts with a large bounding volume (often covering the entire mesh) at the root node.
Recursive Subdivision: The mesh is recursively divided into smaller regions or groups of triangles until a desired level of granularity or a termination condition (like a maximum depth or number of triangles per node) is met.
Leaf Nodes: When further subdivision is not possible or beneficial, leaf nodes are created that contain actual geometry primitives.

Bounding Volumes ?? : Bounding volumes (often AABBs - Axis-Aligned Bounding Boxes) are geometric shapes that encapsulate portions of the mesh or groups of primitives.
They are the shapes that we use to create the bvh.



// shapeCast:
-> intersectsBounds takes the axis aligned bounding box representing an internal node local to the bvh, whether or not the node is a leaf, the score calculated by boundsTraverseOrder, the node depth, and the node index (for use with the refit function) and returns a constant indicating whether or not the bounds is intersected or contained meaning traversal should continue. If CONTAINED is returned (meaning the bounds is entirely encapsulated by the shape) then an optimization is triggered allowing the range and / or triangle intersection callbacks to be run immediately rather than traversing the rest of the child bounds.
