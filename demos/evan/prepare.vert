attribute vec2 aPos;
varying vec2 vPos;

void main(void) {
  gl_Position = vec4(aPos, 0.0, 1.0);
  vPos = 4.0 * aPos;
}
