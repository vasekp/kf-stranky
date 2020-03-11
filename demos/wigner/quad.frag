precision highp float;

uniform mat2 uScaleInv;
uniform vec2 uShift;
uniform float uSepar;
varying float vQuad;
varying float vAngle;

void main(void) {
  mat2 r = rot(vAngle);
  mat2 rInv = rot(-vAngle);
  float f = faktor(uScaleInv * rInv);
  float q0 = vQuad - (r*uShift).x;
  float val = /*f*/int_cat(f*q0, uSepar, uScaleInv*rInv);
  //float val = /*f*/int_gauss(f*q0);
  gl_FragColor = vec4(vec3(1. - val), 1.);
}
