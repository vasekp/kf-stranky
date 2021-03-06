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

// This calculates the disance of mx^(-1) (x=const, y) line from the origin. */
float udistance(mat3 mx, float q) {
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
  float twopi = 4.*asin(1.);
  // Adding alpha(0) again, the only jumps that remain are -2π every 2π in time,
  // we know how to fix that.
  alpha = alpha1 + alpha0 + floor(time/twopi) * twopi;
}

// Alpha sometimes needed without the full decomposition, here also for mat3 for convenience
float alpha(mat3 mx) {
  return atan(mx[1][0], mx[0][0]);
}

float w_gauss(vec2 xy) {
  return exp(-dot(xy, xy));
}

float int_gauss(float q) {
  return exp(-q*q);
}

float psi_gauss(float q) {
  return exp(-q*q/2.);
}

float w_fock(vec2 xy) {
  return (2.*dot(xy, xy) - 1.) * exp(-dot(xy, xy));
}

float int_fock(float q) {
  return 2.*q*q * exp(-q*q);
}

float psi_fock(float q) {
  return sqrt(2.) * q * exp(-q*q/2.);
}

float cosh(float x) {
  return (exp(x) + exp(-x))/2.;
}

float w_cat(vec2 xy, float s) {
  float xs1 = xy.x + s, xs2 = xy.s - s;
  return exp(-xy.y*xy.y) * (exp(-xs1*xs1) + exp(-xs2*xs2) + exp(-xy.x*xy.x) * cos(2.*xy.y*s)) / 2.;
}

float int_cat(float q, float s, float alpha) {
  float qs1 = q + s*cos(alpha), qs2 = q - s*cos(alpha);
  return 1./(1.+exp(-s*s)) * ((exp(-qs1*qs1) + exp(-qs2*qs2))/2. + exp(-(qs1*qs1 + qs2*qs2)/2.) * cos(2.*q*s*sin(alpha)));
}

vec2 cx_unit(float a) {
  return vec2(cos(a), sin(a));
}

vec2 cx_mul(vec2 a, vec2 b) {
  return vec2(a.x*b.x - a.y*b.y, a.x*b.y + a.y*b.x);
}

vec2 cx_conj(vec2 cx) {
  return vec2(cx.x, -cx.y);
}

vec2 psi_cat_cx(float q, float s, float alpha) {
  vec2 separ = s*vec2(cos(alpha), -sin(alpha));
  vec2 cx1 = cx_unit(q*separ.y);
  vec2 temp = psi_gauss(q - separ.x) * cx1
    + psi_gauss(q + separ.x) * cx_conj(cx1);
  float xphase = -separ.x * separ.y / 2.;
  return cx_mul(temp, cx_unit(xphase)) / 2.;
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
