# version 300 es
precision highp float;

uniform float u_Width;
uniform float u_Height;
uniform sampler2D u_Texture;

out vec4 o_FragColor;

void main() {
  o_FragColor = texture(u_Texture, gl_FragCoord.xy / vec2(u_Width, u_Height));
}