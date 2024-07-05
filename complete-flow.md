The Complete Flow:

User clicks on the model.
Raycasting determines the 3D point of contact.
This 3D point is converted to a 2D UV coordinate.
A shader program is run on the render target (your UV map):

It calculates which pixels to affect based on the brush size and UV position.
It determines the color and opacity of each affected pixel.
It blends new colors with existing ones.


The updated render target (UV map) is applied as a texture to your 3D model.
The model is re-rendered, showing the new paint.