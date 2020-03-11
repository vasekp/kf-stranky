precision highp float;

uniform mat2 uScaleInv;
uniform vec2 uShift;
uniform float uSepar;
uniform float uAngle;
varying float vQuad;
varying float vVal;

void main(void) {
  mat2 r = rot(uAngle);
  mat2 rInv = rot(-uAngle);
  float f = faktor(uScaleInv * rInv);
  float q0 = vQuad - (r*uShift).x;
  float val = /*f*/int_cat(f*q0, uSepar, uScaleInv*rInv);
  //float val = /*f*/int_gauss(f*q0);
  gl_FragColor = vec4(vec3(smoothstep(val - .02, val + .02, vVal)), 1.);
}
