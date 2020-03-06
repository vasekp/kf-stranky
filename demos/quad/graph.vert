attribute vec2 aPos;
varying float vQuad;
varying float vVal;

void main(void) {
  const float scale = 5.;
  vQuad = scale * aPos.x;
  vVal = 1. + aPos.y;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
