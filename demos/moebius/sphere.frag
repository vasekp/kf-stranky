precision mediump float;

varying vec3 vPos;
varying vec3 vNormal;

void main(void) {
  const vec3 baseClr = vec3(1., 1., 1.);

  vec3 source = normalize(vec3(0.5, -2.0, 2.0));
  float diff = max(0.0, dot(normalize(vNormal), source));
  float spec = pow(diff, 30.0) / 1.5;
  float ambient = 0.7;
  float s = mix(diff, 1.0, ambient);

  float d1 = min(25.0*abs(vPos.x), 1.0);
  float d2 = min(25.0*abs(vPos.y), 1.0);
  float d3 = min(25.0*abs(vPos.z), 1.0);
  vec3 ownClr = vec3(d1*d2, d2*d3, d1*d3);

  s *= smoothstep(-1.0, -0.99, -abs(vNormal.z));

  gl_FragColor = vec4(mix(s * ownClr * baseClr, vec3(1.0), spec), 0.7);
}
