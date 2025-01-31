precision highp float;

varying vec2 vPos;
varying vec2 vEiw;
uniform sampler2D uSampler;
uniform float uBackground;

void main(void) {
  vec2 smpl = texture2D(uSampler, (vPos + 1.0)/2.0).xy * 2.0 - vec2(1.0);
  float val = dot(vEiw, smpl);
  vec3 fg = val > 0. ? vec3(0., 0., 1.) : vec3(1., 0., 0.);
  gl_FragColor = vec4(mix(vec3(uBackground), fg, abs(val)), 1.0);
}
