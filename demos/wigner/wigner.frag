precision highp float;

uniform int uFunc;
uniform float uSepar;
varying vec2 vTrf;

vec3 color(float f) {
  float e = exp(-2.*abs(f));
  if(f > 0.)
    return vec3(e, e, 1.);
  else
    return vec3(1., e, e);
}

void main(void) {
  float val;
  if(uFunc == 0)
    val = w_gauss(vTrf);
  else if(uFunc == 1)
    val = w_fock(vTrf);
  else
    val = w_cat(vTrf, uSepar);
  gl_FragColor = vec4(color(val), 1.);
}
