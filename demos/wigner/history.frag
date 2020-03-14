precision highp float;

uniform int uFunc;
uniform mat2 uScale;
uniform vec2 uShift;
uniform float uSepar;
varying float vQuad;
varying float vAngle;

void main(void) {
  float alpha, beta, gamma;
  decompose(rot(-vAngle) * uScale, alpha, beta, gamma);
  float q0 = vQuad - (rot(-vAngle)*uShift).x;
  float val;
  if(uFunc == 0)
    val = int_gauss(beta*q0);
  else if(uFunc == 1)
    val = int_fock(beta*q0);
  else
    val = int_cat(beta*q0, uSepar, alpha);
  gl_FragColor = vec4(vec3(1. - val), 1.);
}
