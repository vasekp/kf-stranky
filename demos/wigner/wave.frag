precision highp float;

uniform int uFunc;
uniform float uSepar;
varying float vQuad;
varying float vQuadTrf;
varying float vAlpha;
varying float vBeta;
varying float vGoBS;
varying vec2 vRShift;
varying float vY;

void main(void) {
  float phase = vGoBS * vQuadTrf*vQuadTrf / 2. // for exp(I gamma X^2/2)
    + vRShift.y * vQuad - vRShift.x * vRShift.y / 2. // for displacement operator
    - 0.5 * vAlpha; // for exp(-I alpha (X^2+P^2)/2)

  vec2 temp;
  if(uFunc == 0)
    temp = vec2(psi_gauss(vQuadTrf), 0.);
  else if(uFunc == 1)
    temp = psi_fock(vQuadTrf) * cx_unit(-vAlpha);
  else if(uFunc == 2)
    temp = psi_cat_cx(vQuadTrf, uSepar, vAlpha);
  vec2 val = sqrt(vBeta) // for exp(I ln(beta) (XP+PX)/2)
    * cx_mul(temp, cx_unit(phase));

  float aval = length(val);
  vec3 clr = aval == 0. ? vec3(.5) : color(val / aval);
  gl_FragColor = vec4(mix(clr, vec3(1.), smoothstep(aval - .02, aval + .02, vY)), 1.);
}
