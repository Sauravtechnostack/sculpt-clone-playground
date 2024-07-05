Imagine you're doing collision detection between a large sphere (like an explosion radius) and many objects represented by bounding boxes:

If a box is NOT_INTERSECTED, you ignore it completely.
If a box is INTERSECTED, you might need to do more detailed collision checks with the actual object geometry.
If a box is CONTAINED, you know the entire object is affected without needing any further checks.