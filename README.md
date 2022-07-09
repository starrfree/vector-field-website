# Welcome to Vector Field
Simulate thousands of particles to visualize vector fields.
The particles move along the vector field: at every time step `dt` the particles move by `dx` on the x-axis and `dy` on the y-axis.
They are simulated using __WebGL__ therefore the simulation runs on the GPU.

## dx, dy
Functions of `x`, `y` and `t`.
Define the elementary movement of a particle given its `x, y` coordinates and time `t`.
These are set by the user using the corresponding fields.
One can use basic operations like `+`, `-`, `*`, `/` as well as elementary functions such as `cos`, `sin`, `tan`, `exp`, `pow(_, _)`, `sqrt`, etc.

## Time
Variable: `t`.
Changes every frame by `dt` (time interval since last frame). Ranges by default from _min_ `0` to _max_ `10`.
When its value reaches _max_, it goes back to _min_.

## x
Variable: `x`.
Ranges from left to right. The default left value is `-1`. The default right value is `1`.

## y
Variable: `y`.
Ranges from bottom to top. The default bottom value is `-1`. The default top value is `1`.

## Particles
Slider that controls the number of particles in the simulation.

## Speed
Slider that controls the particle speed multiplier.

## Lifetime
Slider that controls the time (number of frames) that particles live.

## Normalize
Checkbox controlling whether all particles move at the same speed, by normalizing their velocity.

## Slow
Color picker that controls the color of slower particles. Default is #6666ff

## Fast
Color picker that controls the color of faster particles. Default is #ffffff

## Menu
On the top left hand corner of the simulation canvas there is a button that toggles the parameters menu to display the canvas in fullscreen.

## FPS
On the bottom right hand corner of the simulation canvas there is an indicator of the simulation speed (in frames per second).

## URL
Any change to the parameters will update the website URL. Therefore to undo an action users can use their browser back button.
This also allows users to share or save a simulation and its parameters.