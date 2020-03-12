attribute vec2 aPos;
uniform float uAngle;
varying float vQuad;
varying float vAngle;

void main(void) {
  const float scale = 5.;
  vQuad = scale * aPos.x;
  vAngle = uAngle - 2.*(1. - aPos.y);
  gl_Position = vec4(aPos, 0.0, 1.0);
}
