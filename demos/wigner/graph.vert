attribute vec2 aPos;
uniform mat2 uScale;
uniform float uAngle;
uniform vec2 uShift;
varying float vQuadTransformed;
varying float vVal;
varying float vAlpha;
varying mat2 vRSInv;

void main(void) {
  const float scale = 5.;
  float quad = scale * aPos.x;
  float alpha, beta, gamma;
  decompose(rot(-uAngle) * uScale, alpha, beta, gamma);
  vQuadTransformed = beta*(quad - (rot(-uAngle)*uShift).x);
  vVal = 1. + aPos.y;
  vAlpha = alpha;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
