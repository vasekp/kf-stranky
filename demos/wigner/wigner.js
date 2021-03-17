'use strict';

var gl;
var playing, progs;
var fullBuff;
var over;

var angle, lastTime;
var scale, shift, catSepar;
var plotType, fun;
const speed = 0.001;
const angleRange = 4;

window.addEventListener('DOMContentLoaded', function() {
  var canvas = document.getElementById('canvas');
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  gl = canvas.getContext('webgl');

  if(!gl) {
    alert('Functionality necessary for this demo not supported. Please use a newer browser.');
    return;
  }

  gl.clearColor(1, 1, 1, 1);
  angle = 0;

  loadFiles(filesReady);
});

function filesReady(files) {
  progs = {};

  var func = files['functions.glsl'];
  progs.wigner = new Program(gl, func + files['wigner.vert'], func + files['wigner.frag']);
  progs.graph = new Program(gl, func + files['graph.vert'], func + files['graph.frag']);
  progs.wave = new Program(gl, func + files['wave.vert'], func + files['wave.frag']);
  progs.history = new Program(gl, files['history.vert'], func + files['history.frag']);
  progs.whistory = new Program(gl, files['history.vert'], func + files['whistory.frag']);

  fullBuff = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, fullBuff);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1,
    1, -1,
    -1, 1,
    1, 1,
    -1, 1,
    1, -1]), gl.STATIC_DRAW);

  scale = new Float32Array([1.2, 0.7, -0.4, 0.6]);
  shift = new Float32Array([0, 1]);
  catSepar = 1.5;
  updateUniforms();

  over = new Overlay(document.getElementById('overlayContainer'),
    { xMin: -5, xMax: 5, yMin: -5, yMax: 5 },
    function() { document.getElementById('pause').click(); }
  );
  let centerFun = function() { return shift; };
  let coords = function(u, v) { return [shift[0] + u*scale[0] + v*scale[2],  shift[1] + u*scale[1] + v*scale[3]]; }
  over.addControl(new CoordAxes(-4, 4, -4, 4, 'q', 'p'), {alwaysVisible: true});
  over.addControl(new DashedPath(
    function() { return [coords(-1, -1), coords(1, -1), coords(1, 1), coords(-1, 1), coords(-1, -1)] },
    '#C44'));
  over.addControl(new AbsControl(centerFun, 'cross', '#CC4', moveCentre));
  over.addControl(new DirControl(
    function() { return coords(1, 0); },
    centerFun,
    function() { return [scale[2], scale[3]]; },
    'cross', '#4C4', moveEx));
  over.addControl(new DirControl(
    function() { return coords(0, 1); },
    centerFun,
    function() { return [scale[0], scale[1]]; },
    'cross', '#4C4', moveEy));
  over.addControl(new CenterControl(
    function() { return coords(1, 1); },
    centerFun,
    'bent', '#C44', moveCorner));
  over.addControl(new CenterControl(
    function() { return fun == 'cat' ? [catSepar * scale[0] + shift[0], catSepar * scale[1] + shift[1]] : null; },
    centerFun,
    'bent', '#C44', moveSepar));

  makeSwitch('play-controls', playControl, 0);
  makeSwitch('func', changeFuncType, 0);
  makeSwitch('plotType', changePlotType, 0);
  document.getElementById('reset').addEventListener('click', reset);
}

function draw(time) {
  if(lastTime)
    angle += (time - lastTime) * speed;
  lastTime = time;

  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.bindBuffer(gl.ARRAY_BUFFER, fullBuff);

  gl.viewport(0, gl.canvas.height / 2, gl.canvas.width, gl.canvas.height / 2);
  gl.useProgram(progs.wigner.program);
  gl.enableVertexAttribArray(progs.wigner.aPos);
  gl.vertexAttribPointer(progs.wigner.aPos, 2, gl.FLOAT, false, 0, 0);
  gl.uniform1f(progs.wigner.uAngle, angle);
  gl.uniform1f(progs.wigner.uSepar, catSepar);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  gl.disableVertexAttribArray(progs.wigner.aPos);

  var pGraph = (plotType === 'wave' ? progs.wave : progs.graph);
  gl.viewport(0, 0.4 * gl.canvas.height, gl.canvas.width, 0.1 * gl.canvas.height);
  gl.useProgram(pGraph.program);
  gl.enableVertexAttribArray(pGraph.aPos);
  gl.vertexAttribPointer(pGraph.aPos, 2, gl.FLOAT, false, 0, 0);
  gl.uniform1f(pGraph.uAngle, angle);
  gl.uniform1f(pGraph.uSepar, catSepar);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  gl.disableVertexAttribArray(pGraph.aPos);

  var pHistory = (plotType === 'wave' ? progs.whistory : progs.history);
  var vpHeight = Math.floor(0.4 * gl.canvas.height);
  gl.viewport(0, 0, gl.canvas.width, vpHeight);
  if(playing) {
    if(angle < angleRange) {
      var startY = Math.floor(vpHeight * (1 - angle/angleRange));
      gl.enable(gl.SCISSOR_TEST);
      gl.scissor(0, startY, gl.canvas.width, vpHeight - startY);
    }
    gl.useProgram(pHistory.program);
    gl.enableVertexAttribArray(pHistory.aPos);
    gl.vertexAttribPointer(pHistory.aPos, 2, gl.FLOAT, false, 0, 0);
    gl.uniform1f(pHistory.uAngle, angle);
    gl.uniform1f(pHistory.uSepar, catSepar);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.disableVertexAttribArray(pHistory.aPos);
    gl.disable(gl.SCISSOR_TEST);
  }

  if(playing)
    requestAnimationFrame(draw);
  else
    lastTime = null;
}

function playControl(elm) {
  if(elm.id == 'play')
    play();
  else
    pause();
}

function play() {
  over.active = false;
  if(!playing) {
    playing = true;
    requestAnimationFrame(draw);
  }
}

function pause() {
  playing = false;
  over.active = true;
  resetAngle();
}

function resetAngle() {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  scale = new Float32Array([
    c*scale[0] + s*scale[1],
    -s*scale[0] + c*scale[1],
    c*scale[2] + s*scale[3],
    -s*scale[2] + c*scale[3]
  ]);
  shift = new Float32Array([
    c*shift[0] + s*shift[1],
    -s*shift[0] + c*shift[1]
  ]);
  angle = 0;
  updateUniforms();
}

function reset(e) {
  angle = 0;
  scale = new Float32Array([1, 0, 0, 1]);
  shift = new Float32Array([0, 0]);
  updateUniforms();
  requestAnimationFrame(draw);
  e.preventDefault();
}

function changeFuncType(elm) {
  fun = elm.id;
  var id = elm.getAttribute('data-func');
  for(let p in progs) {
    gl.useProgram(progs[p].program);
    gl.uniform1i(progs[p].uFunc, id);
  }
  resetAngle();
  requestAnimationFrame(draw);
}

function changePlotType(elm) {
  plotType = elm.id;
  requestAnimationFrame(draw);
}

function updateUniforms() {
  var mat3 = new Float32Array([
    scale[0], scale[1], 0,
    scale[2], scale[3], 0,
    shift[0], shift[1], 1]);

  for(let p in progs) {
    gl.useProgram(progs[p].program);
    gl.uniformMatrix3fv(progs[p].uMatrix, false, mat3);
  }
}

function moveCentre(x, y) {
  shift[0] = x;
  shift[1] = y;
  updateUniforms();
  requestAnimationFrame(draw);
}

function tryMatrix(mx) {
  let h1 = Math.hypot(mx[0], mx[1]);
  let h2 = Math.hypot(mx[2], mx[3]);
  let sp = (mx[0]*mx[2] + mx[1]*mx[3])/h1/h2;
  let accept = (h1 > 0.5 && h1 < 2 && h2 > 0.5 && h2 < 2 && sp > -1 && sp < 1);
  if(!accept)
    return;
  scale = mx;
  updateUniforms();
  requestAnimationFrame(draw);
}

function untrf(dx, dy) {
  return [scale[3]*dx - scale[2]*dy, scale[0]*dy - scale[1]*dx];
}

function moveEx(dx, dy) {
  let mxy = untrf(dx, dy);
  let nmx = new Float32Array([
    mxy[0]*scale[0] + mxy[1]*scale[2],
    mxy[0]*scale[1] + mxy[1]*scale[3],
    scale[2]/mxy[0], scale[3]/mxy[0]]);
  tryMatrix(nmx);
}

function moveEy(dx, dy) {
  let mxy = untrf(dx, dy);
  let nmx = new Float32Array([
    scale[0]/mxy[1], scale[1]/mxy[1],
    mxy[1]*scale[2] + mxy[0]*scale[0],
    mxy[1]*scale[3] + mxy[0]*scale[1]]);
  tryMatrix(nmx);
}

function moveCorner(dx, dy) {
  let uv = [scale[0] + scale[2], scale[1] + scale[3]];
  let expK = Math.hypot(dx, dy) / Math.hypot(uv[0], uv[1]);
  let ch = (expK + 1/expK) / 2, sh = (expK - 1/expK) / 2;
  let rot = relAngle(uv, [dx, dy]);
  let c = Math.cos(rot), s = Math.sin(rot);
  let m1 = new Float32Array([
    scale[0]*ch + scale[2]*sh, scale[1]*ch + scale[3]*sh,
    scale[0]*sh + scale[2]*ch, scale[1]*sh + scale[3]*ch]);
  let m2 = new Float32Array([c*m1[0] - s*m1[1], s*m1[0] + c*m1[1], c*m1[2] - s*m1[3], s*m1[2] + c*m1[3]]);
  tryMatrix(m2);
}

function moveSepar(dx, dy) {
  let u = [scale[0], scale[1]];
  let rot = relAngle(u, [dx, dy]);
  let c = Math.cos(rot), s = Math.sin(rot);
  tryMatrix(new Float32Array([
    c*scale[0] - s*scale[1], s*scale[0] + c*scale[1],
    c*scale[2] - s*scale[3], s*scale[2] + c*scale[3]]));
  catSepar = Math.max(Math.min(Math.hypot(dx, dy) / Math.hypot(u[0], u[1]), 4), 0.5);
}
