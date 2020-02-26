#define SIZE 4
#define MODEL_SPHERE 1
#define MODEL_TRAD 2

attribute vec3 aPos;
varying vec3 vPos;
varying vec3 vNormal;
varying vec2 vVal;
uniform vec4 uQView;
uniform vec2 uPoly[SIZE * SIZE * SIZE];
uniform int uModel;

vec3 rotate(vec3 v, vec4 q) {
  vec3 t = cross(q.xyz, v) + q.w * v;
  return v + 2.0*cross(q.xyz, t);
}

void main(void) {
  vPos = aPos;
  vVal = vec2(0.);
  vec2 dx = vec2(0.), dy = vec2(0.), dz = vec2(0.), dr = vec2(0.);
  float termX = 1.0;
  int ix = 0;
  vNormal = vec3(0.);
  for(int i = 0; i < SIZE; i++) {
    float termXY = termX;
    termX *= aPos.x;
    for(int j = 0; j < SIZE; j++) {
      float termXYZ = termXY;
      termXY *= aPos.y;
      for(int k = 0; k < SIZE; k++) {
        vVal += uPoly[ix] * termXYZ;
        if(uModel == MODEL_TRAD) {
          dx += float(i) * uPoly[ix] * termXYZ / aPos.x;
          dy += float(j) * uPoly[ix] * termXYZ / aPos.y;
          dz += float(k) * uPoly[ix] * termXYZ / aPos.z;
          dr += float(i+j+k) * uPoly[ix] * termXYZ;
        }
        termXYZ *= aPos.z;
        ix++;
      }
    }
  }
  vec3 pos, normal;
  if(uModel == MODEL_SPHERE) {
    const float r = 1.25;
    pos = r * aPos;
    normal = aPos;
  } else {
    float r = length(vVal);
    vVal = normalize(vVal);
    pos = r * aPos;
    normal = r * aPos + dot(dr, vVal)/r * aPos - vec3(dot(dx, vVal), dot(dy, vVal), dot(dz, vVal)) / r;
  }
  vNormal = rotate(normalize(normal), uQView);
  gl_Position = vec4(rotate(pos, uQView) / 1.8, 1.0);
  gl_Position.z *= -0.5;
}
