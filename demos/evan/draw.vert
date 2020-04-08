attribute vec2 aPos;
varying vec2 vPos;
varying vec2 vEiw;
uniform vec2 uK;
uniform float uTime;

void main(void) {
  gl_Position = vec4(aPos, 0.0, 1.0);
  float phase = length(uK) * uTime;
  vEiw = vec2(cos(phase), sin(phase));
  vPos = aPos;
}
