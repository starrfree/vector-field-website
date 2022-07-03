# version 300 es
precision highp float;

uniform sampler2D u_Texture;

out vec4 o_FragColor;

void main() {
  o_FragColor = texture(u_Texture, gl_FragCoord.xy / vec2(1500.0, 1000.0));//vec4(length(gl_FragCoord.xy) / 1500.0, 0.0, 0.0, 1.0);
}