precision highp float;

varying lowp vec4 vColor;

uniform vec2 uSourcePositions[2];

void main() {
  vec2 position;
  position.x = gl_FragCoord.x;
  position.y = gl_FragCoord.y;
  float v = 0.0;
  for(int i = 0; i < 2; ++i) {
    float d = length(uSourcePositions[i] - position);
    if (d < 5.0) {
      gl_FragColor = vec4(1.0, 0.3, 0.3, 1.0);
      return;
    }
    v += cos(d / 7.0) * 0.5 + 0.5;
  }
  v /= 2.0;
  gl_FragColor = vec4(v, v, v, 1.0);
}
