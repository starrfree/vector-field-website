# version 300 es
precision highp float;

in vec2 i_Position;
in vec2 i_Velocity;

out vec2 o_Position;
out vec2 o_Velocity;

void main() {
  // float d = length(i_Position);
  // vec2 force = -(i_Position / d) / (d * d);
  // o_Velocity = i_Velocity + force * 0.001;
  float x = i_Position.x;
  float y = i_Position.y;
  o_Velocity = vec2(cos(y * 10.0), sin(x * 20.0));
  // o_Velocity = vec2(x*x - y*y, x*y);
  o_Velocity = o_Velocity / length(o_Velocity);
  o_Position = i_Position + i_Velocity * 0.001;
}
