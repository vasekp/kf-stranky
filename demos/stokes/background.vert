attribute vec2 aPos;
varying vec2 vPos;

void main(void) {
  vPos = aPos;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
