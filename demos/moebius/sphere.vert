attribute vec3 aPos;
varying vec3 vPos;
uniform mat4 uMProj;

void main(void) {
  vPos = aPos;
  gl_Position = uMProj * vec4(aPos, 1.0);
}
