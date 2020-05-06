attribute vec3 aPos;
varying vec3 vNormal;
uniform vec4 uQView;
uniform int uModel;

vec3 rotate(vec3 v, vec4 q) {
  vec3 t = cross(q.xyz, v) + q.w * v;
  return v + 2.0*cross(q.xyz, t);
}

void main(void) {
  vec3 pos = rotate(aPos, uQView);
  vNormal = pos;
  gl_Position = vec4(pos / 1.5, 1.0);
  gl_Position.z *= -0.5;
}
