precision highp float;

uniform float uSepar;
varying vec2 vPos;

vec3 color(float f) {
  float e = exp(-2.*abs(f));
  if(f > 0.)
    return vec3(e, e, 1.);
  else
    return vec3(1., e, e);
}

void main(void) {
  const vec2 shift = vec2(1.5, 0);
  const mat2 scale = mat2(1.2, 1.3, -0.2, 1.4);
  vec2 trf = scale * (vPos - shift);
  float val = w_cat(trf, uSepar);
  //float val = w_gauss(trf);
  gl_FragColor = vec4(color(val), 1.);
}
