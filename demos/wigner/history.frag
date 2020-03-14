precision highp float;

uniform int uFunc;
uniform mat3 uMatrix;
uniform float uSepar;
varying float vQuad;
varying float vAngle;

void main(void) {
  mat3 rs = rot(vAngle) * uMatrix;
  float trf = trans(rs, vQuad);
  float val;
  if(uFunc == 0)
    val = int_gauss(trf);
  else if(uFunc == 1)
    val = int_fock(trf);
  else
    val = int_cat(trf, uSepar, alpha(rs));
  gl_FragColor = vec4(vec3(1. - val), 1.);
}
