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
  for(float p = -1.0; p < 1.0; p += 0.003) {
    div += 1.0;
    float kx = uK.x - p*uSpread*uK.y, ky = uK.y + p*uSpread*uK.x;
    float ky2s = uN2N1 * (kx*kx + ky*ky) - kx*kx;
    float ky2 = sqrt(abs(ky2s));
    vec2 r;
    if(ky2s > 0.0)
      r = vec2((ky - ky2)/(ky + ky2), 0.0);
    else
      r = vec2(ky*ky - ky2*ky2, -2.0*ky*ky2)/(ky*ky + ky2*ky2);
    vec2 t = r + vec2(1.0, 0.0);
    vec2 contrib;
    if(ky2s > 0.0) {
      float phase = kx*vPos.x + ky2*vPos.y;
      contrib = vec2(cos(phase), sin(phase));
    } else {
      float phase = kx*vPos.x;
      contrib = vec2(cos(phase), sin(phase)) * exp(-ky2*vPos.y);
    }
    val += cmul(contrib, t) * exp(-p*p*3.0);
  }
  val /= div;
  gl_FragColor = vec4((vec2(1.0) + val)/2.0, 0.0, 1.0);
}
