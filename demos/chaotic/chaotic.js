const c1 = 1; // 1/tau/a^3
const c2 = 1; // tau a^2 g

let svg1, svg2, graph;
var state1, state2;
var iface;

// ***** Hamiltonian *****
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
    // Direct numerical solution of Hamiltonian equations
    // We use first-order Runge-Kutta (midpoint method) and symmetric differences to improve accuracy
    let da = (h(a, b, pa+eps, pb) - h(a, b, pa-eps, pb))/2/eps * dt;
    let db = (h(a, b, pa, pb+eps) - h(a, b, pa, pb-eps))/2/eps * dt;
    let dpa = -(h(a+eps, b, pa, pb) - h(a-eps, b, pa, pb))/2/eps * dt;
    let dpb = -(h(a, b+eps, pa, pb) - h(a, b-eps, pa, pb))/2/eps * dt;
    a += da/2;
    b += db/2;
    pa += dpa/2;
    pb += dpb/2;
    da = (h(a, b, pa+eps, pb) - h(a, b, pa-eps, pb))/2/eps * dt;
    db = (h(a, b, pa, pb+eps) - h(a, b, pa, pb-eps))/2/eps * dt;
    dpa = -(h(a+eps, b, pa, pb) - h(a-eps, b, pa, pb))/2/eps * dt;
    dpb = -(h(a, b+eps, pa, pb) - h(a, b-eps, pa, pb))/2/eps * dt;
    this.alpha += da;
    this.beta += db;
    this.pa += dpa;
    this.pb += dpb;
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

  if(iface.playing)
    requestAnimationFrame(draw);
}

function clearGraph() {
  let ctx = graph.getContext('2d');
  ctx.clearRect(0, 0, graph.width, graph.height);
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

function addEventListeners(svg) {
  svg.addEventListener('mousedown', mouseDown);
  svg.addEventListener('mousemove', mouseMove);
  svg.addEventListener('mouseup', mouseUp);
}

function mouseDown(e) {
  if(e.button != 0)
    return;
  iface.rotating = true;
  rotStart(e.offsetX, e.offsetY, e.currentTarget);
  e.currentTarget.setPointerCapture(e.pointerID);
  e.preventDefault();
}

function mouseMove(e) {
  if(iface.rotating)
    rotMove(e.offsetX, e.offsetY, e.currentTarget);
}

function mouseUp(e) {
  iface.rotating = false;
  e.currentTarget.releasePointerCapture(e.pointerID);
}

function rotStart(x, y, elm) {
  iface.lastX = x;
  iface.lastY = y;
  document.getElementById('pause').click();
}

function rotMove(x, y, elm) {
  let state = window[elm.getAttribute('data-state')];
  state.alpha += -(y - iface.lastY) / 100;
  state.beta += (x - iface.lastX) / 100;
  displayState(elm, state);
  iface.lastX = x;
  iface.lastY = y;
}

function playControl(elm) {
  if(elm.id == 'play')
    play();
  else
    pause();
}

function play() {
  if(!iface.playing) {
    iface.playing = true;
    clearGraph();
    requestAnimationFrame(draw);
  }
}

function pause() {
  iface.playing = false;
}

window.addEventListener('DOMContentLoaded', function() {
  svg1 = document.getElementById('svg1');
  svg2 = document.getElementById('svg2');
  state1 = new State(0, 0, 2.6, 0);
  state2 = new State(0.1, 0, 2.6, 0);

  iface = {
    rotating: false,
    playing: true
  };

  addEventListeners(svg1);
  addEventListeners(svg2);

  graph = document.getElementById('graph');
  graph.width = graph.clientWidth;
  graph.height = graph.clientHeight;

  makeSwitch('controls', playControl, 0);

  requestAnimationFrame(draw);
});
