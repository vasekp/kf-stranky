precision mediump float;

attribute vec2 aPos;
uniform mat4 uMProj;
uniform mat4 uMInv;
varying vec2 vPos;
varying float vLight;
varying vec3 vSource;

void main(void) {
  vec4 inv = uMInv * vec4(aPos, 0.0, 1.0);
  vPos = vec2(inv.x / inv.w, inv.y / inv.w);
  gl_Position = uMProj * vec4(vPos, -1.0, 1.0);

  const vec3 normal = vec3(0.0, 0.0, 1.0);
  vSource = normalize(vec3(0.5, -2.0, 2.0));
  float diffr = max(0.0, dot(normal, vSource));
  float ambient = 0.5;
  vLight = mix(diffr, 1.0, ambient);
}
