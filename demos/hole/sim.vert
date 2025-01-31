#version 300 es

uniform mat4 mProj;
uniform vec4 qView;
uniform vec4 qView2;
out vec3 dir_l;

const vec2 corners[] = vec2[](
  vec2(1, 1),
  vec2(1, -1),
  vec2(-1, 1),
  vec2(-1, -1)
);

vec4 qmul(vec4 a, vec4 b) {
  return vec4(a.w * b.xyz + b.w * a.xyz + cross(a.xyz, b.xyz), a.w * b.w - dot(a.xyz, b.xyz));
}

vec4 qconj(vec4 q) {
  return vec4(-q.xyz, q.w);
}

vec3 qrot(vec3 v, vec4 q) {
  return qmul(qmul(q, vec4(v, 0.0)), qconj(q)).xyz;
}

void main() {
  gl_Position = vec4(corners[gl_VertexID], 1, 1);
  vec3 dir0 = inverse(mat3(mProj)) * gl_Position.xyz;
  dir_l = qrot(qrot(dir0, qView2), qView);
}
