precision highp float;

uniform float uSepar;
uniform float uAngle;
varying float vQuad;
varying float vVal;

float cosh(float x) {
  return (exp(x) + exp(-x))/2.;
}

void main(void) {
  float cc = cos(uAngle);
  float ss = sin(uAngle);
  float s = uSepar;
  float val = 1./(1.+exp(-s*s)) * exp(-(vQuad*vQuad + pow(s*cc, 2.)))
    * (cosh(2.*s*cc*vQuad) + cos(2.*s*ss*vQuad));
  gl_FragColor = vec4(vec3(smoothstep(val - .02, val + .02, vVal)), 1.);
}
