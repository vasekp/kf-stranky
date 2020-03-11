attribute vec2 aPos;
varying vec2 vPos;

void main(void) {
  const float scale = 5.;
  vPos = scale * aPos;
  gl_Position = vec4(vec2(1., -1.) * aPos, 0.0, 1.0);
}

