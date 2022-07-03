# version 300 es
precision highp float;

in vec2 i_Position;

void main() {
  gl_PointSize = 0.1;
  gl_Position = vec4(i_Position, 0.0, 1.0);
}
