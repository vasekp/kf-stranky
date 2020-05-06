attribute vec3 aFactor;
uniform vec3 uPos;
uniform vec4 uQView;

vec3 rotate(vec3 v, vec4 q) {
  vec3 t = cross(q.xyz, v) + q.w * v;
  return v + 2.0*cross(q.xyz, t);
}

void main(void) {
  gl_Position = vec4(rotate(aFactor * uPos, uQView) / 1.5, 1.0);
  gl_Position.z *= -0.5;
}
