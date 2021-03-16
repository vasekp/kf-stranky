precision mediump float;

uniform mat4 uMProj;
uniform mat4 uMInv;
uniform float uDx;
uniform vec4 uQuat;
varying vec2 vPos;
varying float vLight;
varying vec3 vSource;

vec3 unproj(vec2 v) {
  return vec3(2.0*v.x, 2.0*v.y, dot(v, v) - 1.0) / (dot(v, v) + 1.0);
}

vec3 rotate(vec3 v, vec4 q) {
  vec3 t = cross(q.xyz, v) + q.w * v;
  return v + 2.0*cross(q.xyz, t);
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
  vec3 uPos = rotate(unproj(vPos / 2.0), uQuat);
  vec3 uRight = rotate(unproj(vRight / 2.0), uQuat);
  vec3 uUp = rotate(unproj(vUp / 2.0), uQuat);
  vec3 d = 1.0 - min(min(abs(uPos / (uRight - uPos) / 1.7), abs(uPos / (uUp - uPos) / 1.7)), 1.0);
  vec3 ownClr = 0.9 * d.zxy;

  gl_FragColor = vec4(mix(vLight * c * baseClr, ownClr, length(ownClr)), 1.0);
}
