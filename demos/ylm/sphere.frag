precision mediump float;

varying vec3 vPos;
varying vec3 vNormal;
varying vec2 vVal;

void main(void) {
  mat3 clrM = mat3(0.0, 0.433, -0.433, 0.5, -0.25, -0.25, 0.5, 0.5, 0.5);
  vec3 clr = clrM * vec3(vVal, 1.0);
  float norm = dot(vVal, vVal);
  if(norm < 1.0)
    clr = mix(vec3(0.0), clr, 2. * norm / (norm + 1.));
  else if(norm > 1.0)
    clr = mix(vec3(1.0), clr, 2. / (norm + 1.));

  const vec3 source = normalize(vec3(0.5, 0.5, 2.0));
  float diff = max(0.0, dot(normalize(vNormal), source));
  float spec = pow(diff, 30.0) / 1.5;
  float ambient = 0.5;
  float s = mix(diff, 1.0, ambient);

  gl_FragColor = vec4(mix(s * clr, vec3(1.0), spec), 1.0);
}
