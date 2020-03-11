precision highp float;

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
  float val = w_cat(trf, uSepar);
  //float val = w_gauss(trf);
  gl_FragColor = vec4(color(val), 1.);
}
