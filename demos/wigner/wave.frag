precision highp float;

uniform mat2 uScale;
uniform mat2 uScaleInv;
uniform vec2 uShift;
uniform float uSepar;
uniform float uAngle;
varying float vQuad;
varying float vVal;

vec3 color(vec2 val) {
  const mat3 clrM = mat3(0.0, 0.433, -0.433, 0.5, -0.25, -0.25, 0.5, 0.5, 0.5);
  vec3 clr = clrM * vec3(val, 1.0);
  float norm = dot(val, val);
  if(norm < 1.0)
    return mix(vec3(0.0), clr, 2. * norm / (norm + 1.));
  else if(norm > 1.0)
    return mix(vec3(1.0), clr, 2. / (norm + 1.));
}

void main(void) {
  mat2 r = rot(-uAngle);
  vec2 rShift = r * uShift;
  mat2 rs = r * uScale;
  float th0 = atan(-uScale[1][0], -uScale[0][0]);
  float th = atan(-sin(uAngle), -(uScale[0][0]*rs[0][0] + uScale[1][0]*rs[1][0]))
    + floor(uAngle / 6.28)*6.28;
  float v = length(vec2(rs[0][0], rs[1][0]));
  float u = (rs[0][0]*rs[0][1] + rs[1][0]*rs[1][1]) / (v*v);
  float phase = u*pow(vQuad - rShift.x, 2.)/2. + rShift.y*vQuad - th/2.;
  float tq = (vQuad - rShift.x) / v;
  vec2 val = 1./sqrt(v) * exp(-tq*tq/2.) * vec2(cos(phase), sin(phase));
  gl_FragColor = vec4(color(val), 1.);
}
