precision highp float;

mat2 rot(float angle) {
  float cc = cos(angle);
  float ss = sin(angle);
  return mat2(cc, ss, -ss, cc);
}

/* Decomposition of a SL(2,R) matrix into:
     exp(I gamma X^2/2) exp(I log(beta) (XP+PX)/2) exp(-I alpha (X^2+P^2)/2)
  X^2, P^2, (XP+PX)/2 represented in sl(2,R) as generators of vertical skew (right side
  upward), horizontal skew (top leftward), and squeeze in x */
void decompose(in mat2 mx, out float alpha, out float beta, out float gamma) {
  alpha = atan(mx[1][0], mx[0][0]);
  beta = 1./length(vec2(mx[1][0], mx[0][0]));
  gamma = (mx[0][0] * mx[0][1] + mx[1][0] * mx[1][1]) * beta*beta;
}

/* More precise calculation of alpha which monotonically and continuously increases in time.
   Contract: rot = mat2(cos(time), sin(time), -sin(time), cos(time)). */
void decompose(in mat2 scale, in mat2 rot, in float time, out float alpha, out float beta, out float gamma) {
  mat2 rs = rot * scale;
  beta = 1./length(vec2(rs[1][0], rs[0][0]));
  gamma = (rs[0][0] * rs[0][1] + rs[1][0] * rs[1][1]) * beta*beta;
  // Value of alpha (+ π) if time = 0
  float alpha0 = atan(-scale[1][0], -scale[0][0]);
  // This would give alpha-alpha(0) with usual jumps between -π and +π, thus the jump
  // is now shifted to time = 0 (and multiples of 2π)
  float alpha1 = atan(-rot[1][0], -(scale[0][0]*rs[0][0] + scale[1][0]*rs[1][0]));
  const float twopi = 4.*asin(1.);
  // Adding alpha(0) again, the only jumps that remain are -2π every 2π in time,
  // we know how to fix that.
  alpha = alpha1 + alpha0 + floor(time/twopi) * twopi;
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

float int_cat(float q, float s, float alpha) {
  return 1./(1.+exp(-s*s)) * exp(-q*q - pow(s*cos(alpha), 2.)) * (cosh(2.*cos(alpha)*s*q) + cos(2.*sin(alpha)*s*q));
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
