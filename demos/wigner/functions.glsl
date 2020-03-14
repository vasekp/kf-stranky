precision highp float;

// SL(3,R) representation of exp(-I alpha (X^2+P^2)/2)
mat3 rot(float angle) {
  float cc = cos(angle);
  float ss = sin(angle);
  return mat3(
      cc, -ss, 0.,
      ss, cc, 0.,
      0., 0., 1.);
}

mat3 inv(mat3 mx) {
  mat2 sl2 = mat2(mx);
  mat2 sl2inv = mat2(sl2[1][1], -sl2[0][1], -sl2[1][0], sl2[0][0]);
  vec2 rshift = -sl2inv * vec2(mx[2]);
  return mat3(
      sl2inv[0], 0.,
      sl2inv[1], 0.,
      rshift, 1.);
}

vec2 trans(mat3 mx, vec2 v) {
  return vec2(mx * vec3(v, 1.));
}

float trans(mat3 mx, float q) {
  float beta = 1./length(vec2(mx[1][0], mx[0][0]));
  return beta*(q - mx[2][0]);
}

/* Decomposition of a SL(2,R) matrix into:
     exp(I gamma X^2/2) exp(I log(beta) (XP+PX)/2) exp(-I alpha (X^2+P^2)/2)
  X^2, P^2, (XP+PX)/2 represented in sl(3,R) as generators of vertical skew (right side
  upward), horizontal skew (top leftward), and squeeze in x */
/*void decompose(in mat2 mx, out float alpha, out float beta, out float gamma) {
  alpha = atan(mx[1][0], mx[0][0]);
  beta = 1./length(vec2(mx[1][0], mx[0][0]));
  gamma = (mx[0][0] * mx[0][1] + mx[1][0] * mx[1][1]) * beta*beta;
}*/

/* More precise calculation of alpha which monotonically and continuously increases in time.
   Contract: mx_t = mat3(cos(time), -sin(time), 0, sin(time), cos(time), 0, 0, 0, 1) * mx_0.
   gobs = gamma / (beta^2) */
void decompose(in mat3 mx_0, in mat3 mx_t, in float time, out float alpha, out float beta, out float gamma, out float gobs) {
  beta = 1./length(vec2(mx_t[1][0], mx_t[0][0]));
  gobs = mx_t[0][0] * mx_t[0][1] + mx_t[1][0] * mx_t[1][1];
  gamma = gobs*beta*beta;
  // Value of alpha (+ π) if time = 0
  float alpha0 = atan(-mx_0[1][0], -mx_0[0][0]);
  // This would give alpha-alpha(0) with usual jumps between -π and +π, thus the jump
  // is now shifted to time = 0 (and multiples of 2π)
  float alpha1 = atan(-sin(time), -(mx_0[0][0]*mx_t[0][0] + mx_0[1][0]*mx_t[1][0]));
  const float twopi = 4.*asin(1.);
  // Adding alpha(0) again, the only jumps that remain are -2π every 2π in time,
  // we know how to fix that.
  alpha = alpha1 + alpha0 + floor(time/twopi) * twopi;
}

// Alpha sometimes needed without the full decomposition, here also for mat3 for convenience
float alpha(mat3 mx) {
  return atan(mx[1][0], mx[0][0]);
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

vec3 color(vec2 val) {
  const mat3 clrM = mat3(0.0, 0.433, -0.433, 0.5, -0.25, -0.25, 0.5, 0.5, 0.5);
  vec3 clr = clrM * vec3(val, 1.0);
  float norm = dot(val, val);
  if(norm < 1.0)
    return mix(vec3(0.0), clr, 2. * norm / (norm + 1.));
  else if(norm >= 1.0)
    return mix(vec3(1.0), clr, 2. / (norm + 1.));
}
