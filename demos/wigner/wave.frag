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
  float alpha, beta, gamma;
  mat2 r = rot(-uAngle);
  decompose(uScale, r, uAngle, alpha, beta, gamma);
  vec2 rShift = r * uShift;
  float quadShifted = vQuad - rShift.x;
  float phase = gamma * pow(quadShifted, 2.) / 2. // for exp(I gamma X^2/2)
    + rShift.y * quadShifted + rShift.x * rShift.y / 2. // for displacement operator
    - 0.5 * alpha; // for exp(-I alpha (X^2+P^2)/2)
  vec2 val = sqrt(beta) * exp(-pow(beta * quadShifted, 2.)/2.) // for exp(I ln(beta) (XP+PX)/2.)
    * vec2(cos(phase), sin(phase));
  gl_FragColor = vec4(color(val), 1.);
}
