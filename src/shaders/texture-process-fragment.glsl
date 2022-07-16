# version 300 es
precision highp float;

uniform float u_Width;
uniform float u_Height;
uniform bool u_NoTrail;
uniform sampler2D u_Texture;

out vec4 o_FragColor;

float colorProcess(float color);

void main() {
  vec4 color = texture(u_Texture, gl_FragCoord.xy / vec2(u_Width, u_Height));
  o_FragColor = vec4(colorProcess(color.r), colorProcess(color.g), colorProcess(color.b), color.a);
}

float colorProcess(float color) {
  if (u_NoTrail) {
    if (color > 250.0) {
      return color;
    } else {
      return 0.0;
    }
  } else {
    return color - 0.01;
  }
}