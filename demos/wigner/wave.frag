precision highp float;

//uniform float uSepar;
varying float vQuad;
varying float vQuadTrf;
varying float vAlpha;
varying float vBeta;
varying float vGoBS;
varying vec2 vRShift;

void main(void) {
  float phase = vGoBS * vQuadTrf*vQuadTrf / 2. // for exp(I gamma X^2/2)
    + vRShift.y * vQuad - vRShift.x * vRShift.y / 2. // for displacement operator
    - 0.5 * vAlpha; // for exp(-I alpha (X^2+P^2)/2)
  vec2 val = sqrt(vBeta) * exp(-vQuadTrf*vQuadTrf/2.) // for exp(I ln(beta) (XP+PX)/2.)
    * vec2(cos(phase), sin(phase));
  gl_FragColor = vec4(color(val), 1.);
}
