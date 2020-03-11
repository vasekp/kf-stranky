precision highp float;

uniform int uFunc;
uniform mat2 uScaleInv;
uniform vec2 uShift;
uniform float uSepar;
uniform float uAngle;
varying vec2 vPos;

vec3 color(float f) {
  float e = exp(-2.*abs(f));
  if(f > 0.)
    return vec3(e, e, 1.);
  else
    return vec3(1., e, e);
}

void main(void) {
  mat2 rInv = rot(uAngle);
  vec2 trf = uScaleInv * (rInv * vPos - uShift);
  float val;
  if(uFunc == 0)
    val = w_gauss(trf);
  else if(uFunc == 1)
    val = w_fock(trf);
  else
    val = w_cat(trf, uSepar);
  gl_FragColor = vec4(color(val), 1.);
}
