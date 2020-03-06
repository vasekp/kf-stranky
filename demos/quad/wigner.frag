precision mediump float;

uniform float uSepar;
varying vec2 vPos;

vec3 color(float f) {
  float e = exp(-2.*abs(f));
  if(f > 0.)
    return vec3(e, e, 1.);
  else
    return vec3(1., e, e);
}

float cosh(float x) {
  return (exp(x) + exp(-x))/2.;
}

void main(void) {
  /*const vec2 shift = vec2(.5, 0);
  const mat2 scale = mat2(6., 8., -2., 7.);
  vec2 q = scale * (vPos - shift);
  float val = 2.*(dot(q, q) - 1.) * exp(-dot(q, q));*/
  float s = uSepar;
  float val = exp(-(dot(vPos, vPos) + s*s)) * (cosh(2.*vPos.x*s) + exp(s*s)*cos(2.*vPos.y*s))/2.;
  gl_FragColor = vec4(color(val), 1.);
}
