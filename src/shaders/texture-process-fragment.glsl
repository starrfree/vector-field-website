# version 300 es
precision highp float;

uniform float u_Width;
uniform float u_Height;
uniform sampler2D u_Texture;

out vec4 o_FragColor;

void main() {
  vec4 color = texture(u_Texture, gl_FragCoord.xy / vec2(u_Width, u_Height));
  float disolve = 0.01;
  o_FragColor = vec4(color.r - disolve, color.g - disolve, color.b - disolve, color.a);//vec4(1.0, 0.1, 0.5, 1.0);//
}