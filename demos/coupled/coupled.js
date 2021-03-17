'use strict';

var svg, graph, state, lastTime, conf;
const tScale = 2;

window.addEventListener('DOMContentLoaded', function() {
  state = new State(1, 0, 0, 0);
  conf = {m1: 1.2, m2: 0.8, j: 0.1};

  svg = document.getElementById('arena');
  graph = document.getElementById('graph');
  graph.width = graph.clientWidth;
  graph.height = graph.clientHeight;
  let ctx = graph.getContext('2d');
  ctx.lineWidth = 2;
  ctx.fillStyle = 'none';
  ctx.translate(0, graph.height);
  ctx.scale(1, -1);

  let over = new Overlay(document.getElementById('graph-container'),
    { xMin: 0, xMax: 1, yMin: 0, yMax: 1, padding: .5 });
  over.addControl(new CoordAxes(-.1, 1, -.1, 1, 'x', 'E'));

  let over2 = new Overlay(document.getElementById('arena-container'),
    { xMin: -2, xMax: 2, yMin: -1, yMax: 0, padding: 1 },
    function(action, elm) {
      state.fixAlpha = action == 'start' && elm.extra.name == 'a';
      state.fixBeta = action == 'start' && elm.extra.name == 'b';
    });
  over2.addControl(new BaseControl(state.r1.bind(state), function() { return [-1,0]; },
    function(dx, dy) { state.alpha = Math.atan2(dx, -dy); }), {name: 'a'});
  over2.addControl(new BaseControl(state.r2.bind(state), function() { return [1,0]; },
    function(dx, dy) { state.beta = Math.atan2(dx, -dy); }), {name: 'b'});

  let over3 = new Overlay(document.getElementById('triangle'),
    { xMin: -.8, xMax: .8, yMin: 0, yMax: 1, padding: .5 });
  over3.addControl(new AbsControl(function() { return [conf.m2 - 1, conf.j]; }, 'cross', '#88F', function(dx, dy) {
    if(Math.abs(dx) > 0.7)
      dx = sign(dx) * 0.7;
    if(dy < 0) dy = 0;
    if(dy > .9) dy = .9;
    conf.m1 = 1 - dx;
    conf.m2 = 1 + dx;
    conf.j = dy;
    over3.refresh();
  }), {captureAll: true});
  over3.addControl(new CoordAxes(-.7, .7, -.1, .9, 'm₂:m₁', 'k'));

  requestAnimationFrame(draw);
});

function draw(time) {
  let dt = (lastTime && time - lastTime < 150) ? (time - lastTime)/1000. : 0.03;
  lastTime = time;
  state.evolve(dt);
  displayState(svg, state);
  updateGraph(time, state.energies());

  requestAnimationFrame(draw);
}

function State(a, b, pa, pb) {
  // ***** Hamiltonian *****
  function h(a, b, pa, pb) {
    let energies = h3(a, b, pa, pb);
    return energies[0] + energies[1] + energies[2];
  }

  function h3(a, b, pa, pb) {
    let x1 = Math.sin(a) - 1,
      y1 = -Math.cos(a),
      x2 = Math.sin(b) + 1,
      y2 = -Math.cos(b);
    return [
      (pa*pa/2/conf.m1 + (1 - Math.cos(a))*conf.m1)*tScale,
      (pb*pb/2/conf.m2 + (1 - Math.cos(b))*conf.m2)*tScale,
      Math.pow(hypot(x2-x1, y2-y1) - 2, 2)/2*conf.j*tScale
    ];
  }

  this.alpha = a;
  this.beta = b;
  this.pa = pa;
  this.pb = pb;

  this.energies = function() {
    return h3(this.alpha, this.beta, this.pa, this.pb);
  }

  this.r1 = function() {
    return [Math.sin(this.alpha) - 1, -Math.cos(this.alpha)];
  }

  this.r2 = function() {
    return [Math.sin(this.beta) + 1, -Math.cos(this.beta)];
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
    if(!this.fixAlpha) {
      this.alpha += da;
      this.pa += dpa;
    } else
      this.pa = 0;
    if(!this.fixBeta) {
      this.beta += db;
      this.pb += dpb;
    } else
      this.pb = 0;

    if(Math.abs(this.alpha) > 1.45) {
      this.alpha = sign(this.alpha) * 1.45;
      this.pa = -0.9*this.pa;
    }
    if(Math.abs(this.beta) > 1.45) {
      this.beta = sign(this.beta) * 1.45;
      this.pb = -0.9*this.pb;
    }
  }
}

function displayState(svg, state) {
  function radToDeg(rad) {
    return rad * 180 / Math.PI;
  }

  let x1 = Math.sin(state.alpha) - 1,
    y1 = -Math.cos(state.alpha),
    x2 = Math.sin(state.beta) + 1,
    y2 = -Math.cos(state.beta),
    len = hypot(x2-x1, y2-y1);
  svg.getElementById('mass1').setAttribute('transform', 'rotate(' + radToDeg(state.alpha) + ')');
  svg.getElementById('mass2').setAttribute('transform', 'rotate(' + radToDeg(state.beta) + ')');
  svg.getElementById('spring').setAttribute('transform', 'matrix(' + (x2-x1) + ' ' + (y2-y1) + ' '
    + (y2-y1)/len + ' ' + (x1-x2)/len + ' ' + x1 + ' ' + y1 + ')');
}

let updateGraph = (function() {
  let history = [];
  return function(time, energies) {
    const xScale = 0.03;
    let w = graph.width;
    history.push([time, energies]);
    while(xScale*(time - history[0][0]) > w)
      history.shift();
    let ctx = graph.getContext('2d');
    ctx.clearRect(0, 0, graph.width, graph.height);
    const colors = ['#F88', '#88F', '#8D8'];
    let max = history.reduce(function(a, c) { return Math.max(a, c[1][0], c[1][1], c[1][2]); }, 0);
    let yScale = graph.height / (0.1 + 0.1*Math.ceil(10*max));
    for(let i = 0; i < 3; i++) {
      ctx.strokeStyle = colors[i];
      ctx.beginPath();
      ctx.moveTo(w + xScale*(history[0][0] - time), yScale*history[0][1][i]);
      for(let j = 1; j < history.length; j++)
        ctx.lineTo(w + xScale*(history[j][0] - time), yScale*history[j][1][i]);
      ctx.stroke();
    }
  };
})();
