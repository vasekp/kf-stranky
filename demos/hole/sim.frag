#version 300 es

precision highp float;
uniform samplerCube cubemap;
in vec3 dir_l;
out vec4 color;

struct GRVec {
  float r;
  float t;
  vec3 n;
};

uniform Context {
  GRVec pos;
  GRVec spd;
  GRVec tri[3];
} ctx;

const float pi = 3.14159265;

// Real solutions of 4z^3 - 3z + q = 0
// For 0 ≤ q ≤ 1, the roots v.xyz are:
// 0 ≤ v.x ≤ 1/2,
// v.y ≥ 1/2,
// v.z ≤ 0
vec3 cubic_real(float q) {
  float a = asin(q) / 3.0;
  return vec3(sin(a), sin(a + pi * 2.0 / 3.0), sin(a - pi * 2.0 / 3.0));
}

// Complex solutions of the same cubic, packed in three reals
// Applicable for q > 1
// The roots are: v.x < 0, v.y ± i v.z
vec3 cubic_complex(float q) {
  float a = pow(q + sqrt(q * q - 1.0), 1.0 / 3.0);
  float b = 1.0 / a;
  return vec3(-(a + b), (a + b) / 2.0, (a - b) * 0.8660254) / 2.0;
}

// Square root
vec2 cx_sqrt(vec2 a) {
  float d = length(a);
  float s = a.y < 0.0 ? -1.0 : 1.0;
  return vec2(s * sqrt((d + a.x) / 2.0), sqrt((d - a.x) / 2.0));
}

vec2 cx_inv(vec2 a) {
  return vec2(a.x, -a.y) / dot(a, a);
}

// Geometric mean
vec2 cx_gm(vec2 a, vec2 b) {
  float d = sqrt(dot(a, a) * dot(b, b));
  float r = a.x * b.x - a.y * b.y;
  float s = a.x * b.y + a.y * b.x < 0.0 ? -1.0 : 1.0;
  return vec2(s * sqrt(max(d + r, 0.0) / 2.0), sqrt(max(d - r, 0.0) / 2.0));
}

// The symmetric integral of the first kind R_F, after Carlson, arXiv:math/9409227v1 [math.CA]
// Arguments are 1 negative and 2 positive, so we need complex numbers.
vec2 rf_3r(vec2 x, vec2 y, vec2 z) {
  int n;
  for(n = 0; n < 10; n++) {
    vec2 l = cx_gm(x, y) + cx_gm(x, z) + cx_gm(y, z);
    x = (x + l) / 4.0;
    y = (y + l) / 4.0;
    z = (z + l) / 4.0;
  }
  return cx_inv(cx_sqrt((x + y + z) / 3.0));
}

// The same function R_F but evaluated in (x, y + i z, y - i z).
// Here the evaluation stays within real numbers.
float rf_rcc(float x, float y, float z) {
  float mu, lambda;
  int n;
  for(n = 0; n < 10; n++) {
    mu = (x + 2.0 * y) / 3.0;
    lambda = sqrt(2.0 * x * (y + sqrt(y * y + z * z))) + sqrt(y * y + z * z);
    x = (x + lambda) / 4.0;
    y = (y + lambda) / 4.0;
    z = z / 4.0;
  }
  return 1.0 / sqrt(mu);
}

float angle_3r(vec3 roots, float inv_r) {
  return 2.0 * rf_3r(
      vec2((roots.x * inv_r - 1.0) * roots.y * roots.z, 0.0),
      vec2((roots.y * inv_r - 1.0) * roots.x * roots.z, 0.0),
      vec2((roots.z * inv_r - 1.0) * roots.x * roots.y, 0.0)
    ).y;
}

float angle_rcc(vec3 roots, float inv_r) {
  return 2.0 * rf_rcc(
      (1.0 - roots.x * inv_r) * (roots.y * roots.y + roots.z * roots.z),
      roots.x * roots.y - roots.x * (roots.y * roots.y + roots.z * roots.z) * inv_r,
      roots.x * roots.z
    );
}

float angle(float p, float r, float ur) {
  float l_e = sqrt(27.0 / 4.0) / p;
  float v_r, v_inv, v_inf;
  if(p <= 1.0) {
    vec3 roots = cubic_real(p) / p * 3.0;
    float v_r = angle_3r(roots, 1.0 / r);
    float v_inf = angle_3r(roots, 0.0);
    if(ur < 0.0) {
      float v_inv = angle_3r(roots, 1.0 / roots.y);
      return l_e * (2.0 * v_inv - v_inf - v_r);
    } else {
      return l_e * (v_r - v_inf);
    }
  } else {
    vec3 roots = cubic_complex(p) / p * 3.0;
    float v_r = angle_rcc(roots, 1.0 / r);
    float v_inf = angle_rcc(roots, 0.0);
    // No inversion point. For u.r < 0 the trajectory is singular so this function is not called.
    return l_e * (v_r - v_inf);
  }
}

void main() {
  vec3 dir_ln = normalize(dir_l);
  float r = ctx.pos.r;
  float q = 1.0 - 1.0 / r;

  GRVec u;
  u.r = dot(dir_ln, vec3(ctx.tri[0].r, ctx.tri[1].r, ctx.tri[2].r)) - ctx.spd.r;
  u.t = dot(dir_ln, vec3(ctx.tri[0].t, ctx.tri[1].t, ctx.tri[2].t)) - ctx.spd.t;
  u.n.x = dot(dir_ln, vec3(ctx.tri[0].n.x, ctx.tri[1].n.x, ctx.tri[2].n.x)) - ctx.spd.n.x;
  u.n.y = dot(dir_ln, vec3(ctx.tri[0].n.y, ctx.tri[1].n.y, ctx.tri[2].n.y)) - ctx.spd.n.y;
  u.n.z = dot(dir_ln, vec3(ctx.tri[0].n.z, ctx.tri[1].n.z, ctx.tri[2].n.z)) - ctx.spd.n.z;

  float e2 = pow(u.t, 2.0);
  float l2 = pow(ctx.pos.r, 4.0) * dot(u.n, u.n);
  float p = sqrt(27.0 * e2 / 4.0 / l2);

  bool fall = p > 1.0 ? u.r < 0.0 : r < 1.5;
  if(fall || u.t > 0.0) {
    color = vec4(0.0, 0.0, 0.0, 1.0);
  } else {
    float phi = angle(p, r, u.r);
    vec3 v = cos(phi) * ctx.pos.n + sin(phi) * normalize(u.n);
    float shift = 1.0 / (-u.t);
    color = pow(texture(cubemap, v), vec4(0.65));
    if(shift > 1.0)
      color.b += log(shift);
    else
      color.r += -log(shift);
  }
}
