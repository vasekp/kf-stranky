precision highp float;

uniform vec2 uK;
uniform float uN2N1;
uniform float uSpread;
varying vec2 vPos;

vec2 cmul(vec2 a, vec2 b) {
  return vec2(a.x*b.x - a.y*b.y, a.x*b.y + a.y*b.x);
}

void main(void) {
  vec2 val = vec2(0.0);
  float div = 0.0;
  for(float p = -1.0; p < 1.0; p += 0.005) {
    div += 1.0;
    float kx = uK.x - p*uSpread*uK.y, ky = uK.y + p*uSpread*uK.x;
    float ky2s = uN2N1 * (kx*kx + ky*ky) - kx*kx;
    float ky2 = sqrt(abs(ky2s));
    vec2 r;
    if(ky2s > 0.0)
      r = vec2((ky - ky2)/(ky + ky2), 0.0);
    else
      r = vec2(ky*ky - ky2*ky2, -2.0*ky*ky2)/(ky*ky + ky2*ky2);
    float phase1 = kx*vPos.x + ky*vPos.y;
    float phase2 = kx*vPos.x - ky*vPos.y;
    vec2 c1 = vec2(cos(phase1), sin(phase1));
    vec2 c2 = vec2(cos(phase2), sin(phase2));
    val += (c1 + cmul(r, c2)) * exp(-p*p*3.0);
  }
  val /= div;
  gl_FragColor = vec4((vec2(1.0) + val)/2.0, 0.0, 1.0);
}
