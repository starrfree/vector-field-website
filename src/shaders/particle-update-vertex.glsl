# version 300 es
precision highp float;

uniform float t;
uniform float dt;
uniform vec2 u_xRange;
uniform vec2 u_yRange;
uniform float u_Lifetime;
uniform int u_Step;
uniform int u_Normalize;
uniform float u_Speed;
uniform vec4 u_Color1;
uniform vec4 u_Color2;
uniform float u_Size;

in float i_Index;
in vec2 i_Position;
in vec2 i_Velocity;
in float i_Lifetime;

out float o_Index;
out vec2 o_Position;
out vec2 o_Velocity;
out float o_Lifetime;

out vec4 o_Color;

uint hash(uint ste);
float random(uint seed);
// float rand(vec2 xy, float seed);

void main() {
  float x = (i_Position.x + 1.0) / 2.0 * (u_xRange.y - u_xRange.x) + u_xRange.x;
  float y = (i_Position.y + 1.0) / 2.0 * (u_yRange.y - u_yRange.x) + u_yRange.x;
  vec2 vect = vec2($$x$$, $$y$$);
  // o_Velocity = vec2(cos(y * 10.0), sin(x * 20.0));
  // o_Velocity = vec2(x*x - y*y, x*y);
  o_Velocity = vect;
  if (u_Normalize == 1 && length(o_Velocity) != 0.0) {
    o_Velocity = o_Velocity / length(o_Velocity);
  }
  vec2 newPosition = i_Position + i_Velocity * dt * u_Speed / 5000.0;
  float newLifetime = i_Lifetime - 1.0;
  if (newPosition.x < -1.0 || newPosition.x > 1.0 || newPosition.y < -1.0 || newPosition.y > 1.0 || i_Lifetime <= 0.0) {
    newPosition.x = random(uint(uint(i_Index) + hash(uint(u_Step))) * uint(3)) * 2.0 - 1.0; // rand(i_Position + 2.0 * i_Velocity, 1234.0)
    newPosition.y = random(uint(uint(i_Index) + hash(uint(u_Step))) * uint(3) + uint(1)) * 2.0 - 1.0; // rand(i_Position - i_Lifetime, 3456.0)
    newLifetime = u_Lifetime + random(uint(uint(i_Index) + hash(uint(u_Step))) * uint(3) + uint(2)) * u_Lifetime; // rand(newPosition * i_Velocity, 2431.0)
  }
  o_Lifetime = newLifetime;
  o_Position = newPosition;
  o_Index = i_Index;

  float t = clamp(length(vect) * 0.7, 0.0, 1.0);
  vec4 color = u_Color1 * t + (1.0 - t) * u_Color2;
  if (t == 0.0) {
    color = vec4(0.0, 0.0, 1.0, 1.0);
  }
  o_Color = clamp(color, 0.0, 1.0);
  gl_PointSize = u_Size * 4.0;
  gl_Position = vec4(i_Position, 0.0, 1.0);
}

// float rand(vec2 xy, float seed) {
//   return fract(tan(distance(xy*1.6180339887, xy)*seed)*xy.x);
// }

uint hash(uint ste) {
    ste ^= 2747636419u;
    ste *= 2654435769u;
    ste ^= ste >> 16;
    ste *= 2654435769u;
    ste ^= ste >> 16;
    ste *= 2654435769u;
    return ste;
}

float random(uint seed) {
  return float(hash(seed)) / 4294967295.0;
}
