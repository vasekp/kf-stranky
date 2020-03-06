precision highp float;

uniform float uSepar;
varying float vQuad;
varying float vAngle;

float cosh(float x) {
  return (exp(x) + exp(-x))/2.;
}

void main(void) {
  float cc = cos(vAngle);
  float ss = sin(vAngle);
  float s = uSepar;
  float val = 1./(1.+exp(-s*s)) * exp(-(vQuad*vQuad + pow(s*cc, 2.)))
    * (cosh(2.*s*cc*vQuad) + cos(2.*s*ss*vQuad));
  gl_FragColor = vec4(vec3(1. - val), 1.);
}
