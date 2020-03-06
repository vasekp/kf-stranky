precision highp float;

uniform float uSepar;
varying float vQuad;
varying float vAngle;

void main(void) {
  const vec2 shift = vec2(1.5, 0);
  const mat2 scale = mat2(1.2, 1.3, -0.5, 1.4);
  //float val = q_cat(vQuad, vAngle, uSepar);
  float val = q_fock(vQuad, vAngle, scale, shift);
  gl_FragColor = vec4(vec3(1. - val), 1.);
}
