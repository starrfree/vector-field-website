# version 300 es
precision highp float;


uniform sampler2D u_Texture;
in vec4 i_VertexPosition;

void main() {
  gl_Position = i_VertexPosition;
  // gl_PointSize = 0.1;
  // vec4(i_Position, 0.0, 1.0);
}
