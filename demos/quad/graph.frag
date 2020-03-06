precision highp float;

uniform float uSepar;
uniform float uAngle;
varying float vQuad;
varying float vVal;

void main(void) {
  const vec2 shift = vec2(1.5, 0);
  const mat2 scale = mat2(1.2, 1.3, -0.5, 1.4);
  //float val = q_cat(vQuad, vAngle, uSepar);
  float val = q_fock(vQuad, uAngle, scale, shift);
  gl_FragColor = vec4(vec3(smoothstep(val - .02, val + .02, vVal)), 1.);
}
