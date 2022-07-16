# version 300 es
precision highp float;

uniform mat4 u_ModelViewMatrix;
uniform mat4 u_ProjectionMatrix;
uniform sampler2D u_Texture;

in vec4 i_VertexPosition;

void main() {
  gl_Position = u_ProjectionMatrix * u_ModelViewMatrix * i_VertexPosition;
}
