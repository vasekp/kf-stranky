precision highp float;

float cosh(float x) {
  return (exp(x) + exp(-x))/2.;
}


float w_cat(float x, float y, float s) {
  return exp(-(x*x + y*y)) * (exp(-s*s)*cosh(2.*x*s) + cos(2.*y*s))/2.;
}


float q_cat(float q, float angle, float s) {
  float cc = cos(angle);
  float ss = sin(angle);
  return 1./(1.+exp(-s*s)) * exp(-(q*q + pow(s*cc, 2.))) * (cosh(2.*s*cc*q) + cos(2.*s*ss*q));
}

float w_gauss(vec2 xy, mat2 scale, vec2 shift) {
  vec2 q = scale * (xy - shift);
  return exp(-dot(q, q));
}

float q_gauss(float q, float angle, mat2 scale, vec2 shift) {
  float cc = cos(angle);
  float ss = sin(angle);
  float det = scale[0][0]*scale[1][1] - scale[0][1]*scale[1][0];
  mat2 rot = mat2(cc, ss, -ss, cc);
  vec2 tv = vec2(1., -1.) * (scale * rot)[1].yx;
  float q0 = (det * q - dot(tv, scale * shift)) / length(tv);
  return exp(-q0*q0) / length(tv);
}

float w_fock(vec2 xy, mat2 scale, vec2 shift) {
  vec2 q = scale * (xy - shift);
  return (2.*dot(q, q) - 1.) * exp(-dot(q, q));
}

float q_fock(float q, float angle, mat2 scale, vec2 shift) {
  float cc = cos(angle);
  float ss = sin(angle);
  float det = scale[0][0]*scale[1][1] - scale[0][1]*scale[1][0];
  mat2 rot = mat2(cc, ss, -ss, cc);
  vec2 tv = vec2(1., -1.) * (scale * rot)[1].yx;
  float q0 = (det * q - dot(tv, scale * shift)) / length(tv);
  return 2.*q0*q0 * exp(-q0*q0) / length(tv);
}
