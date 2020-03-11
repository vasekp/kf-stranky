precision highp float;

mat2 rot(float angle) {
  float cc = cos(angle);
  float ss = sin(angle);
  return mat2(cc, ss, -ss, cc);
}

float faktor(mat2 mx) {
  float det = mx[0][0]*mx[1][1] - mx[0][1]*mx[1][0];
  return det/length(mx[1]);
}

float cosh(float x) {
  return (exp(x) + exp(-x))/2.;
}

float w_cat(vec2 xy, float s) {
  return exp(-dot(xy, xy)) * (exp(-s*s)*cosh(2.*xy.x*s) + cos(2.*xy.y*s))/2.;
}

float int_cat(float q, float s, mat2 mx) {
  vec2 col = normalize(mx[1]);
  return 1./(1.+exp(-s*s)) * exp(-q*q - pow(s*col[1], 2.)) * (cosh(2.*col[1]*s*q) + cos(2.*col[0]*s*q));
}

float w_gauss(vec2 xy) {
  return exp(-dot(xy, xy));
}

float int_gauss(float q) {
  return exp(-q*q);
}

float w_fock(vec2 xy) {
  return (2.*dot(xy, xy) - 1.) * exp(-dot(xy, xy));
}

float int_fock(float q) {
  return 2.*q*q * exp(-q*q);
}
