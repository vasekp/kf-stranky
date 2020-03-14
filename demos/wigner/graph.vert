attribute vec2 aPos;
uniform mat3 uMatrix;
uniform float uAngle;
varying float vTrf;
varying float vY;
varying float vAlpha;
varying mat2 vRSInv;

void main(void) {
  const float scale = 5.;
  float quad = scale * aPos.x;
  mat3 rs = rot(uAngle) * uMatrix;
  vTrf = trans(rs, quad);
  vY = 1. + aPos.y;
  vAlpha = alpha(rs);
  gl_Position = vec4(aPos, 0.0, 1.0);
}
