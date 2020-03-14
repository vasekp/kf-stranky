precision highp float;

uniform int uFunc;
uniform float uSepar;
varying float vTrf;
varying float vVal;
varying float vAlpha;

void main(void) {
  float val;
  if(uFunc == 0)
    val = int_gauss(vTrf);
  else if(uFunc == 1)
    val = int_fock(vTrf);
  else
    val = int_cat(vTrf, uSepar, vAlpha);
  gl_FragColor = vec4(vec3(smoothstep(val - .02, val + .02, vVal)), 1.);
}
