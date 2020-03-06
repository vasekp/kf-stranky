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
  const mat2 scale = mat2(1.2, 1.3, -0.5, 1.4);
  //float val = w_cat(vPos.x, vPos.y, uSepar);
  float val = w_fock(vPos, scale, shift);
  gl_FragColor = vec4(color(val), 1.);
}
