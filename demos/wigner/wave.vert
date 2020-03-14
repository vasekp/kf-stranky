attribute vec2 aPos;
uniform mat3 uMatrix;
uniform float uAngle;
varying float vQuad;
varying float vQuadTrf;
varying float vAlpha;
varying float vBeta;
varying float vGoBS;
varying vec2 vRShift;
varying float vY;

void main(void) {
  const float scale = 5.;
  float gamma; // dummy
  mat3 rs = rot(uAngle) * uMatrix;
  decompose(uMatrix, rs, uAngle, vAlpha, vBeta, gamma, vGoBS);
  vRShift = vec2(rs[2]);
  vQuad = scale * aPos.x;
  vQuadTrf = udistance(rs, vQuad);
  vY = 1. + aPos.y;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
