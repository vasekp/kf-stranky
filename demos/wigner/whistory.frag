precision highp float;

uniform int uFunc;
uniform mat3 uMatrix;
uniform float uSepar;
uniform float uAngle;
varying float vQuad;
varying float vAngle;

void main(void) {
  float alpha, beta, gamma, gobs;
  mat3 rs = rot(vAngle) * uMatrix;
  decompose(uMatrix, rs, vAngle, alpha, beta, gamma, gobs);
  vec2 rShift = vec2(rs[2]);
  float trf = udistance(rs, vQuad);
  float phase = gobs * trf*trf / 2. // for exp(I gamma X^2/2)
    + rShift.y * vQuad - rShift.x * rShift.y / 2. // for displacement operator
    - 0.5 * alpha; // for exp(-I alpha (X^2+P^2)/2)

  vec2 temp;
  if(uFunc == 0)
    temp = vec2(psi_gauss(trf), 0.);
  else if(uFunc == 1)
    temp = psi_fock(trf) * cx_unit(-alpha);
  else if(uFunc == 2)
    temp = psi_cat_cx(trf, uSepar, alpha);
  vec2 val = sqrt(beta) // for exp(I ln(beta) (XP+PX)/2)
    * cx_mul(temp, cx_unit(phase));
  gl_FragColor = vec4(color(val), 1.);
}
