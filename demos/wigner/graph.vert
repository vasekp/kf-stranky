attribute vec2 aPos;
uniform mat2 uScaleInv;
uniform float uAngle;
uniform vec2 uShift;
varying float vQuadTransformed;
varying float vVal;
varying mat2 vRSInv;

void main(void) {
  const float scale = 5.;
  float quad = scale * aPos.x;
  mat2 r = rot(-uAngle);
  mat2 rInv = rot(uAngle);
  float f = faktor(uScaleInv * rInv);
  vQuadTransformed = f*(quad - (r*uShift).x);
  vRSInv = uScaleInv*rInv;
  vVal = 1. + aPos.y;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
