# version 300 es
precision highp float;

uniform mat4 u_ModelViewMatrix;
uniform mat4 u_ProjectionMatrix;
uniform float u_Width;
uniform float u_Height;
uniform sampler2D u_Texture;

in vec4 o_VertexPosition;
out vec4 o_FragColor;

void main() {
  vec4 camz = u_ProjectionMatrix * u_ModelViewMatrix * vec4(o_VertexPosition.xyz, 1.0);
  if (camz.z > 3.55) {
    discard;
  }
  vec2 coords = gl_FragCoord.xy / vec2(u_Width, u_Height);
  o_FragColor = (texture(u_Texture, coords) + vec4(1.0, 1.0, 1.0, 1.0)) / 2.7;
}