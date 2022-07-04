# version 300 es
precision highp float;

uniform float u_Lifetime;

in vec2 i_Position;
in vec2 i_Velocity;
// in float i_Lifetime;

out vec2 o_Position;
out vec2 o_Velocity;
// out float o_Lifetime;
out vec4 o_Color;

float rand(vec2 xy, float seed);

void main() {
  float x = i_Position.x;
  float y = i_Position.y;
  o_Velocity = vec2($$x$$, $$y$$);
  // o_Velocity = vec2(cos(y * 10.0), sin(x * 20.0));
  // o_Velocity = vec2(x*x - y*y, x*y);
  // o_Velocity = o_Velocity / length(o_Velocity);
  vec2 newPosition = i_Position + i_Velocity * 0.001;
  float newLifetime = 1.0;//i_Lifetime - 0.001;
  if (newPosition.x < -1.0 || newPosition.x > 1.0 || newPosition.y < -1.0 || newPosition.y > 1.0 || newLifetime <= 0.0) {
    newPosition.x = rand(i_Position, 2345.0) * 2.0 - 1.0;
    newPosition.y = rand(i_Position, 1234.0) * 2.0 - 1.0;
    // newLifetime = u_Lifetime + rand(newPosition, 8479.0) * u_Lifetime;
  }
  // o_Lifetime = newLifetime;
  o_Position = newPosition;
  gl_PointSize = 4.0;
  gl_Position = vec4(i_Position, 0.0, 1.0);
  vec4 color2 = vec4(0.4, 0.4, 1.0, 1.0);
  vec4 color1 = vec4(1.0, 1.0, 1.0, 1.0);
  float t = length(i_Velocity) * 0.7;
  o_Color = clamp(color1 * t + (1.0 - t) * color2, 0.0, 1.0);
}

float rand(vec2 xy, float seed) {
  return fract(tan(distance(xy*1.6180339887, xy)*seed)*xy.x);
}
