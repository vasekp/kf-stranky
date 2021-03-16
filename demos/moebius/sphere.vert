attribute vec3 aPos;
varying vec3 vPos;
varying vec3 vNormal;
uniform vec4 uQuat;
uniform mat4 uMProj;

vec3 rotate(vec3 v, vec4 q) {
  vec3 t = cross(q.xyz, v) + q.w * v;
  return v + 2.0*cross(q.xyz, t);
}

void main(void) {
  vec3 pos = rotate(aPos, uQuat);
  vPos = pos;
  vNormal = aPos;
  gl_Position = uMProj * vec4(aPos, 1.0);
}
