const c1 = 1; // 1/tau/a^3
const c2 = 1; // tau a^2 g

function h(a, b, pa, pb) {
  let s2 = Math.sin(a - b)/2;
  let z = 1 - Math.pow(s2, 2);
  let T = (pa*pa/3 + pb*pb*3 - 2*s2*pa*pb)/2/c1/z;
  let U = -c2 * (Math.cos(a) + Math.cos(b))/2;
  return T+U;
}

function State(a, b, pa, pb) {
  this.alpha = a;
  this.beta = b;
  this.pa = pa;
  this.pb = pb;

  this.energy = function() {
    return h(this.alpha, this.beta, this.pa, this.pb);
  }

  this.evolve = function(dt) {
    let a = this.alpha, b = this.beta, pa = this.pa, pb = this.pb;
    const eps = 0.001;
    let da = (h(a, b, pa+eps, pb) - h(a, b, pa, pb))/eps * dt;
    let db = (h(a, b, pa, pb+eps) - h(a, b, pa, pb))/eps * dt;
    let dpa = -(h(a+eps, b, pa, pb) - h(a, b, pa, pb))/eps * dt;
    let dpb = -(h(a, b+eps, pa, pb) - h(a, b, pa, pb))/eps * dt;
    a += da/2;
    b += db/2;
    pa += dpa/2;
    pb += dpb/2;
    da = (h(a, b, pa+eps, pb) - h(a, b, pa, pb))/eps * dt;
    db = (h(a, b, pa, pb+eps) - h(a, b, pa, pb))/eps * dt;
    dpa = -(h(a+eps, b, pa, pb) - h(a, b, pa, pb))/eps * dt;
    dpb = -(h(a, b+eps, pa, pb) - h(a, b, pa, pb))/eps * dt;
    this.alpha += da;
    this.beta += db;
    this.pa += dpa;
    this.pb += dpb;
    console.log(this.energy());
  }
}

function radToDeg(rad) {
  return rad * 180 / Math.PI;
}

function draw(svg, state) {
  state.evolve(0.1);
  svg.getElementById('alpha').setAttribute('transform', 'rotate(' + radToDeg(state.alpha) + ')');
  svg.getElementById('beta-alpha').setAttribute('transform', 'rotate(' + radToDeg(state.beta - state.alpha) + ')');
  requestAnimationFrame(function() { draw(svg, state); });
}

window.addEventListener('DOMContentLoaded', function() {
  let svg = document.getElementById('svg');
  let state = new State(0, 0, 2.6, 0);

  requestAnimationFrame(function() { draw(svg, state); });
});
