precision mediump float;

varying vec3 vNormal;
uniform vec3 uColor;

void main(void) {
  vec3 source = normalize(vec3(0.5, 0.5, 2.0));
  float diff = max(0.0, dot(normalize(vNormal), source));
  float spec = pow(diff, 30.0) / 1.5;
  float ambient = 0.5;
  float s = mix(diff, 1.0, ambient);

  gl_FragColor = vec4(mix(s * uColor, vec3(1.0), spec), 1.0);
}
