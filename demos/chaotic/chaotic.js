const c1 = 1; // 1/tau/a^3
const c2 = 1; // tau a^2 g

let svg1, svg2, state1, state2, graph;

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
    //console.log(this.energy());
  }
}

function radToDeg(rad) {
  return rad * 180 / Math.PI;
}

function displayState(svg, state) {
  svg.getElementById('alpha').setAttribute('transform', 'rotate(' + radToDeg(state.alpha) + ')');
  svg.getElementById('beta-alpha').setAttribute('transform', 'rotate(' + radToDeg(state.beta - state.alpha) + ')');
}

function draw() {
  var lastState = [state1.alpha, state1.beta, state2.alpha, state2.beta];
  state1.evolve(0.1);
  state2.evolve(0.1);
  var newState = [state1.alpha, state1.beta, state2.alpha, state2.beta];
  displayState(svg1, state1);
  displayState(svg2, state2);
  updateGraph(lastState, newState);
  requestAnimationFrame(draw);
}

function updateGraph(s1, s2) {
  let w = graph.width, h = graph.height;
  let dw = Math.ceil(w / 200);
  let lt = Math.ceil(h / 50);
  const pi = Math.PI;
  let ctx = graph.getContext('2d');
  const colors = ['#f00f', '#00ff', '#f008', '#00f8'];
  ctx.lineWidth = lt;
  ctx.putImageData(ctx.getImageData(dw, 0, w-dw, h), 0, 0);
  ctx.fillStyle = '#fff';
  ctx.fillRect(w-dw, 0, dw, h);
  for(let i = 0; i < 4; i++) {
    ctx.strokeStyle = colors[i];
    ctx.beginPath();
    ctx.moveTo(w - dw - lt, lt + (h-2*lt)*(1+Math.sin(s1[i]))/2);
    ctx.lineTo(w - lt, lt + (h-2*lt)*(1+Math.sin(s2[i]))/2);
    ctx.stroke();
  }
}

window.addEventListener('DOMContentLoaded', function() {
  svg1 = document.getElementById('svg1');
  svg2 = document.getElementById('svg2');
  state1 = new State(0, 0, 2.6, 0);
  state2 = new State(0.1, 0, 2.6, 0);

  graph = document.getElementById('graph');
  graph.width = graph.clientWidth;
  graph.height = graph.clientHeight;

  requestAnimationFrame(draw);
});
