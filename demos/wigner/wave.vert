attribute vec2 aPos;
varying float vQuad;

void main(void) {
  const float scale = 5.;
  vQuad = scale * aPos.x;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
