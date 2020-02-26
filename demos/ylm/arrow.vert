attribute vec3 aPos;
attribute vec3 aNormal;
varying vec3 vNormal;
uniform vec4 uQView;
uniform vec4 uQModel;

vec4 mulq(vec4 a, vec4 b) {
  return vec4(a.w*b.xyz + b.w*a.xyz + cross(a.xyz, b.xyz), a.w * b.w - dot(a.xyz, b.xyz));
}

vec3 rotate(vec3 v, vec4 q) {
  vec3 t = cross(q.xyz, v) + q.w * v;
  return v + 2.0*cross(q.xyz, t);
}

void main(void) {
  vec4 qVM = mulq(uQView, uQModel);
  gl_Position = vec4(rotate(aPos, qVM) / 1.8, 1.0);
  gl_Position.z *= -0.5;
  vNormal = rotate(aNormal, qVM);
}
