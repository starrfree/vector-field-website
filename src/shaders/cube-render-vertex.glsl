# version 300 es
precision highp float;

uniform mat4 u_ModelViewMatrix;
uniform mat4 u_ProjectionMatrix;
uniform sampler2D u_Texture;

in vec4 i_VertexPosition;
out vec4 o_VertexPosition;

void main() {
  vec4 pos = u_ProjectionMatrix * u_ModelViewMatrix * i_VertexPosition;
  gl_Position = pos;
  o_VertexPosition = i_VertexPosition;
}
