precision mediump float;

uniform vec2 uMatrix[4];
uniform vec4 uPlanes[3];
varying vec3 vPos;

vec2 cmul(vec2 a, vec2 b) {
  return vec2(a.x*b.x - a.y*b.y, a.x*b.y + a.y*b.x);
}

vec2 cdiv(vec2 a, vec2 b) {
  return cmul(a, vec2(1.0, -1.0) * b) / dot(b, b);
}

vec2 moeb(vec2 zeta) {
  return cdiv(cmul(uMatrix[3], zeta) - uMatrix[1], -cmul(uMatrix[2], zeta) + uMatrix[0]);
}

void main(void) {
  const vec3 baseClr = vec3(1., 1., 1.);

  vec3 source = normalize(vec3(0.5, -2.0, 2.0));
  float diff = max(0.0, dot(normalize(vPos), source));
  float spec = pow(diff, 30.0) / 1.5;
  float ambient = 0.7;
  float s = mix(diff, 1.0, ambient);

  vec2 z0 = vPos.xy / (1.0 - vPos.z);
  vec2 zeta = moeb(z0);
  float sens = 25.0 * (1.0 - vPos.z);
  vec3 d;
  d.x = min(20. * abs(dot(uPlanes[0], vec4(vPos, -1.0))), 1.0);
  d.y = min(20. * abs(dot(uPlanes[1], vec4(vPos, -1.0))), 1.0);
  d.z = min(20. * abs(dot(uPlanes[2], vec4(vPos, -1.0))), 1.0);
  vec3 ownClr = vec3(d.x*d.y, d.y*d.z, d.x*d.z);

  s *= smoothstep(-1.0, -0.99, -abs(vPos.z));

  gl_FragColor = vec4(mix(s * ownClr * baseClr, vec3(1.0), spec), 0.7);
}
