precision highp float;

uniform int uFunc;
uniform mat2 uScaleInv;
uniform vec2 uShift;
uniform float uSepar;
varying float vQuad;
varying float vAngle;

void main(void) {
  mat2 r = rot(-vAngle);
  mat2 rInv = rot(vAngle);
  float f = faktor(uScaleInv * rInv);
  float q0 = vQuad - (r*uShift).x;
  float val;
  if(uFunc == 0)
    val = int_gauss(f*q0);
  else if(uFunc == 1)
    val = int_fock(f*q0);
  else
    val = int_cat(f*q0, uSepar, uScaleInv*rInv);
  gl_FragColor = vec4(vec3(1. - val), 1.);
}
