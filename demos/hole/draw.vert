attribute vec2 aPos;
varying vec2 vPos;
varying vec2 vEiw;
uniform vec2 uK;
uniform float uTime;
const float speed = 1./1000.;

void main(void) {
  gl_Position = vec4(aPos, 0.0, 1.0);
  float omega = length(uK) * speed;
  float phase = mod(omega * uTime, 4.*asin(1.));
  vEiw = vec2(cos(phase), sin(phase));
  vPos = aPos;
}
