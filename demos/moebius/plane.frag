precision mediump float;

uniform mat4 uMProj;
uniform mat4 uMInv;
uniform float uDx;
uniform vec2 uMatrix[4];
varying vec2 vPos;
varying float vLight;
varying vec3 vSource;

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
  const vec3 baseClr = vec3(.9, .9, 1.);

  vec4 proj = uMProj * vec4(vPos, -1.0, 1.0);
  vec2 screen = vec2(proj.x / proj.w, proj.y / proj.w);
  vec4 inv1 = uMInv * vec4(screen + vec2(uDx, 0.0), 0.0, 1.0);
  vec4 inv2 = uMInv * vec4(screen + vec2(0.0, uDx), 0.0, 1.0);
  vec2 vRight = vec2(inv1.x / inv1.w, inv1.y / inv1.w);
  vec2 vUp = vec2(inv2.x / inv2.w, inv2.y / inv2.w);

  // grid
  vec2 dist = vec2(0.5) - abs(fract(vPos/2.0) - vec2(0.5));
  vec2 x1 = abs(dist / (vRight - vPos) * 2.0);
  vec2 x2 = abs(dist / (vUp - vPos) * 2.0);
  float c = min(min(min(x1.x, x1.y), min(x2.x, x2.y)), 1.0);
  // sphere shadow
  c *= mix(smoothstep(0.9, 1.3, length(cross(vSource, vec3(vPos, -1.0)))), 1.0, 0.7);

  // projection lines
  vec2 mPos = moeb(vPos / 2.0);
  vec2 mRight = moeb(vRight / 2.0);
  vec2 mUp = moeb(vUp / 2.0);
  vec3 d;
  d.z = min(abs(mPos.y) / length(vec2(mRight.y - mPos.y, mUp.y - mPos.y)) / 1.7, 1.0);
  d.y = min(abs(mPos.x) / length(vec2(mRight.x - mPos.x, mUp.x - mPos.x)) / 1.7, 1.0);
  d.x = min(abs(length(mPos) - 1.0) / length(vec2(dot(mRight - mPos, mPos), dot(mUp - mPos, mPos))) * dot(mPos, mPos) / 1.7, 1.0);
  vec3 ownClr = vec3(0.9, 0.8, 0.9) * (vec3(1.0) - d);

  gl_FragColor = vec4(vLight * c * baseClr * (1.0 - length(ownClr)) + ownClr, 1.0);
}
