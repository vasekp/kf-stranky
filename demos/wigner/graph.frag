precision highp float;

uniform float uSepar;
varying float vQuadTransformed;
varying mat2 vRSInv;
varying float vVal;

void main(void) {
  float val = /*f*/int_cat(vQuadTransformed, uSepar, vRSInv);
  //float val = /*f*/int_gauss(vQuadTransformed);
  gl_FragColor = vec4(vec3(smoothstep(val - .02, val + .02, vVal)), 1.);
}
