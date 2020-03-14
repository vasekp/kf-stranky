precision highp float;

uniform int uFunc;
uniform float uSepar;
varying float vQuadTransformed;
varying float vVal;
varying float vAlpha;

void main(void) {
  float val;
  if(uFunc == 0)
    val = int_gauss(vQuadTransformed);
  else if(uFunc == 1)
    val = int_fock(vQuadTransformed);
  else
    val = int_cat(vQuadTransformed, uSepar, vAlpha);
  gl_FragColor = vec4(vec3(smoothstep(val - .02, val + .02, vVal)), 1.);
}
