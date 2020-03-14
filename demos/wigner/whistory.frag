precision highp float;

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
  vec2 val = sqrt(beta) * exp(-trf*trf/2.) // for exp(I ln(beta) (XP+PX)/2.)
    * vec2(cos(phase), sin(phase));
  gl_FragColor = vec4(color(val), 1.);
}
