# version 300 es
precision highp float;

uniform mat4 u_ModelViewMatrix;
uniform mat4 u_ProjectionMatrix;
uniform float t;
uniform float dt;
uniform float u_Lifetime;
uniform int u_Step;
uniform int u_Normalize;
uniform float u_Speed;
uniform vec4 u_Color1;
uniform vec4 u_Color2;
uniform float u_Size;

in float i_Index;
in vec3 i_Position;
in vec3 i_Velocity;
in float i_Lifetime;

out float o_Index;
out vec3 o_Position;
out vec3 o_Velocity;
out float o_Lifetime;

out vec4 o_Color;

uint hash(uint ste);
float random(uint seed);
vec2 PhiN(vec3 p);
vec3 inv_PhiN(vec2 p);
mat3x2 dinv_PhiN(vec2 p);
mat3x2 inv_dPhiN(vec3 p);

void main() {
  vec2 xy = PhiN(i_Position);
  float x = xy.x;
  float y = xy.y;
  vec2 uv = vec2($$x$$, $$y$$);
  vec3 vect = uv * inv_dPhiN(i_Position);
  
  o_Velocity = vect;
  if (u_Normalize == 1 && length(o_Velocity) != 0.0) {
    o_Velocity = o_Velocity / length(o_Velocity);
  }
  vec3 newPosition = i_Position + i_Velocity * dt * u_Speed / 5000.0;
  newPosition = normalize(newPosition);
  float newLifetime = i_Lifetime - 1.0;
  if (newPosition.x < -1.0 || newPosition.x > 1.0 || newPosition.y < -1.0 || newPosition.y > 1.0  || newPosition.z < -1.0 || newPosition.z > 1.0 || i_Lifetime <= 0.0) {
    newPosition.x = random(uint(uint(i_Index) + hash(uint(u_Step))) * uint(4)) * 2.0 - 1.0; // rand(i_Position + 2.0 * i_Velocity, 1234.0)
    newPosition.y = random(uint(uint(i_Index) + hash(uint(u_Step))) * uint(4) + uint(1)) * 2.0 - 1.0; // rand(i_Position - i_Lifetime, 3456.0)
    newPosition.z = random(uint(uint(i_Index) + hash(uint(u_Step))) * uint(4) + uint(2)) * 2.0 - 1.0;
    newPosition = normalize(newPosition);
    newLifetime = u_Lifetime + random(uint(uint(i_Index) + hash(uint(u_Step))) * uint(4) + uint(3)) * u_Lifetime; // rand(newPosition * i_Velocity, 2431.0)
  }
  o_Lifetime = newLifetime;
  o_Position = newPosition;
  o_Index = i_Index;

  float t = clamp(length(vect) * 0.7, 0.0, 1.0);
  vec4 color = u_Color1 * t + (1.0 - t) * u_Color2;
  // if (t == 0.0) {
  //   color = vec4(0.0, 0.0, 1.0, 1.0);
  // }
  o_Color = clamp(color, 0.0, 1.0);
  gl_Position = u_ProjectionMatrix * u_ModelViewMatrix * vec4(i_Position, 1.0);
  float camz = (u_ModelViewMatrix * vec4(i_Position, 1.0)).z;
  gl_PointSize = clamp(u_Size * 3.0 * (camz + 5.0), 0.0, 3.0);
  if (camz < -3.7) {
    gl_PointSize = 0.0;
  }
}

vec2 PhiN(vec3 p) {
  float x = p.x;
  float y = p.y;
  float z = p.z;
  return vec2(x, y) / (1.0 - z);
}

vec3 inv_PhiN(vec2 p) {
  float u = p.x;
  float v = p.y;
  return vec3(2.0 * u, 2.0 * v, u*u + v*v - 1.0) / (u*u + v*v + 1.0);
}

mat3x2 dinv_PhiN(vec2 p) {
  float u = p.x;
  float v = p.y;
  float denom = pow(u*u + v*v + 1.0, 2.0);
  return 2.0 / denom * mat3x2(
    1.0 - u*u + v*v, -2.0 * u * v,
    -2.0 * u * v, 1.0 + u*u - v*v,
    2.0 * u, 2.0 * v
  );
}

mat3x2 inv_dPhiN(vec3 p) {
  return dinv_PhiN(PhiN(p));
}

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
