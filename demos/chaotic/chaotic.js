const c1 = 1; // 1/tau/a^3
const c2 = 1; // tau a^2 g

var svg1, svg2, graph, state1, state2;
var iface;

// ***** Hamiltonian *****
function h(a, b, pa, pb) {
  var s2 = Math.sin(a - b)/2;
  var z = 1 - Math.pow(s2, 2);
  var T = (pa*pa/3 + pb*pb*3 - 2*s2*pa*pb)/2/c1/z;
  var U = -c2 * (Math.cos(a) + Math.cos(b))/2;
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
    var a = this.alpha, b = this.beta, pa = this.pa, pb = this.pb;
    const eps = 0.001;
    // Direct numerical solution of Hamiltonian equations
    // We use first-order Runge-Kutta (midpoint method) and symmetric differences to improve accuracy
    var da = (h(a, b, pa+eps, pb) - h(a, b, pa-eps, pb))/2/eps * dt;
    var db = (h(a, b, pa, pb+eps) - h(a, b, pa, pb-eps))/2/eps * dt;
    var dpa = -(h(a+eps, b, pa, pb) - h(a-eps, b, pa, pb))/2/eps * dt;
    var dpb = -(h(a, b+eps, pa, pb) - h(a, b-eps, pa, pb))/2/eps * dt;
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
  var ctx = graph.getContext('2d');
  ctx.clearRect(0, 0, graph.width, graph.height);
}

function updateGraph(s1, s2) {
  var w = graph.width, h = graph.height;
  var dw = Math.ceil(w / 200);
  var lt = Math.ceil(h / 50);
  const pi = Math.PI;
  var ctx = graph.getContext('2d');
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

function rotStart(elm, x, y) {
  iface.lastX = x;
  iface.lastY = y;
  document.getElementById('pause').click();
}

function rotMove(elm, x, y) {
  var state = window[elm.getAttribute('data-state')];
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

function start(files) {
  var row = document.getElementById('c');
  var br = document.getElementById('graphBreak');
  var parser = new DOMParser();
  svg1 = parser.parseFromString(files['pendulum.svg'], 'image/svg+xml').documentElement;
  svg1.id = 'svg1';
  svg1.setAttribute('data-state', 'state1');
  row.insertBefore(svg1, br);
  svg2 = svg1.cloneNode(true);
  svg2.id = 'svg2';
  svg2.setAttribute('data-state', 'state2');
  row.insertBefore(svg2, br);

  addPointerListeners(svg1, rotStart, rotMove);
  addPointerListeners(svg2, rotStart, rotMove);

  makeSwitch('controls', playControl, 0);

  requestAnimationFrame(draw);
}

window.addEventListener('DOMContentLoaded', function() {
  state1 = new State(0, 0, 2.6, 0);
  state2 = new State(0.1, 0, 2.6, 0);

  iface = {
    playing: true
  };

  graph = document.getElementById('graph');
  graph.width = graph.clientWidth;
  graph.height = graph.clientHeight;

  loadFiles(start);
});
