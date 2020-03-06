precision highp float;

uniform float uSepar;
uniform float uAngle;
varying float vQuad;
varying float vVal;

void main(void) {
  const vec2 shift = vec2(1.5, 0);
  const mat2 scale = mat2(1.2, 1.3, -0.2, 1.4);
  mat2 r = rot(uAngle);
  float f = faktor(scale * r);
  float q0 = vQuad - (r*shift).x;
  float val = /*f*/int_cat(f*q0, uSepar, scale*r);
  //float val = /*f*/int_gauss(f*q0);
  gl_FragColor = vec4(vec3(smoothstep(val - .02, val + .02, vVal)), 1.);
}
