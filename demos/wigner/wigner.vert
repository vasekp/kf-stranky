attribute vec2 aPos;
uniform mat3 uMatrix;
uniform float uAngle;
varying vec2 vTrf;

void main(void) {
  const float scale = 5.;
  mat3 rs = rot(uAngle) * uMatrix;
  vTrf = trans(inv(rs), scale * aPos);
  gl_Position = vec4(aPos, 0.0, 1.0);
}

