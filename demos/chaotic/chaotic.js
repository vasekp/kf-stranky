const c1 = 1; // 1/tau/a^3
const c2 = 1; // tau a^2 g

var svg1, svg2, graph, state1, state2;
var interaction, playing;

window.addEventListener('DOMContentLoaded', function() {
  state1 = new State(0, 0, 2.6, 0);
  state2 = new State(0.1, 0, 2.6, 0);

  interaction = {};
  playing = true;

  graph = document.getElementById('graph');
  graph.width = graph.clientWidth;
  graph.height = graph.clientHeight;

  loadFiles(filesReady);
});

function filesReady(files) {
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

function draw() {
  var lastState = [state1.alpha, state1.beta, state2.alpha, state2.beta];
  state1.evolve(0.1);
  state2.evolve(0.1);
  var newState = [state1.alpha, state1.beta, state2.alpha, state2.beta];
  displayState(svg1, state1);
  displayState(svg2, state2);
  updateGraph(lastState, newState);

  if(playing)
    requestAnimationFrame(draw);
}

function State(a, b, pa, pb) {
  // ***** Hamiltonian *****
  function h(a, b, pa, pb) {
    var s2 = Math.sin(a - b)/2;
    var z = 1 - Math.pow(s2, 2);
    var T = (pa*pa/3 + pb*pb*3 - 2*s2*pa*pb)/2/c1/z;
    var U = -c2 * (Math.cos(a) + Math.cos(b))/2;
    return T+U;
  }

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

function displayState(svg, state) {
  function radToDeg(rad) {
    return rad * 180 / Math.PI;
  }

  svg.getElementById('alpha').setAttribute('transform', 'rotate(' + radToDeg(state.alpha) + ')');
  svg.getElementById('beta-alpha').setAttribute('transform', 'rotate(' + radToDeg(state.beta - state.alpha) + ')');
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

function rotStart(elm, x, y, rect) {
  var state = window[elm.getAttribute('data-state')];
  var dx = x - rect.width / 2;
  var dy = -(y - rect.height / 2);
  var dot = dx * Math.cos(state.alpha) + dy * Math.sin(state.alpha);
  interaction.which = dot > 0 ? 'a' : 'b';
  var pivot = elm.getElementById(dot > 0 ? 'pivot-red' : 'pivot-blue');
  var r2 = pivot.getBoundingClientRect();
  interaction.pivot = {
    x: r2.left - rect.left + r2.width / 2,
    y: r2.top - rect.top + r2.height / 2
  };
  interaction.rx = x - interaction.pivot.x;
  interaction.ry = y - interaction.pivot.y;
  interaction.rr = interaction.rx * interaction.rx + interaction.ry * interaction.ry;
  state1.pa = state1.pb = 0;
  state2.pa = state2.pb = 0;
  document.getElementById('pause').click();
}

function rotMove(elm, x, y, rect) {
  var state = window[elm.getAttribute('data-state')];
  var dx = x - interaction.pivot.x;
  var dy = y - interaction.pivot.y;
  var cross = (dx * interaction.ry - dy * interaction.rx) / interaction.rr;
  if(interaction.which === 'a') {
    state.alpha += cross;
    state.beta += cross;
  } else
    state.beta += cross;
  interaction.rx = x - interaction.pivot.x;
  interaction.ry = y - interaction.pivot.y;
  interaction.rr = interaction.rx * interaction.rx + interaction.ry * interaction.ry;
  displayState(elm, state);
}

function playControl(elm) {
  if(elm.id == 'play')
    play();
  else
    pause();
}

function play() {
  if(!playing) {
    playing = true;
    clearGraph();
    requestAnimationFrame(draw);
  }
}

function pause() {
  playing = false;
}

