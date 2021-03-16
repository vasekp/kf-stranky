precision highp float;

varying vec2 vPos;
uniform float uTime;
uniform vec2 uMatrix[4];

vec2 cmul(vec2 a, vec2 b) {
  return vec2(a.x*b.x - a.y*b.y, a.x*b.y + a.y*b.x);
}

vec2 cdiv(vec2 a, vec2 b) {
  return cmul(a, vec2(1.0, -1.0) * b) / dot(b, b);
}

vec2 moeb(vec2 zeta) {
  return cdiv(cmul(uMatrix[3], zeta) - uMatrix[1], -cmul(uMatrix[2], zeta) + uMatrix[0]);
}

vec2 inf() {
  return length(uMatrix[2]) == 0.0 ? vec2(10.0, 0) : cdiv(uMatrix[0], uMatrix[2]);
}

void main(void) {
  vec2 zeta = moeb(vPos);
  vec2 zeta2 = moeb(vPos + vec2(0.01, 0.0));
  float rad = distance(zeta, zeta2);
  vec2 diffUnits = abs(fract(zeta) - vec2(0.5, 0.5));
  float distUnits = 0.5 - max(diffUnits.x, diffUnits.y);
  float cUnits = clamp(distUnits / rad / 1.5, 0.0, 1.0);
  vec2 diffFrac = abs(fract(10.0 * zeta) - vec2(0.5, 0.5));
  float distFrac = 0.5 - max(diffFrac.x, diffFrac.y);
  float cFrac = clamp(distFrac / rad / 9.0, 0.9, 1.0);
  float distX = abs(zeta.y);
  float cX = clamp(distX / rad / 2.0, 0.0, 1.0);
  float distY = abs(zeta.x);
  float cY = clamp(distY / rad / 2.0, 0.0, 1.0);
  float distR = abs(length(zeta) - 1.0);
  float cR = clamp(distR / rad / 2.0, 0.0, 1.0);
  float distInf = length(vPos - inf()) * 50.0;
  float cInf = clamp(distInf / rad / 2.0, 0.0, 1.0);
  float c = min(min(min(cUnits, cFrac), cX), min(cY, cR));
  gl_FragColor = vec4(
      step(-0.9, -cR)*0.9*cInf,
      step(-0.9, -cY)*0.8*cInf,
      step(-0.9, -cX)*0.9*cInf,
      1.0 - c);
}
