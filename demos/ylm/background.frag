precision mediump float;

varying vec2 vPos;

void main(void) {
  const mat3 clrM = mat3(0.0, 0.0, 0.05, 0.0, -0.05, 0.0, 0.3, 0.3, 0.3);
  gl_FragColor = vec4(clrM * vec3(vPos, 1.0), 1.0);
}
