var gl;
var interaction, playing, progs;
var fullBuff;

var angle, lastTime;
var scale, shift, catSepar;
var plotType;
const speed = 0.001;
const angleRange = 4;

window.addEventListener('DOMContentLoaded', function() {
  var canvas = document.getElementById('canvas');
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  gl = canvas.getContext('webgl');

  if(!gl) {
    alert('WebGL not supported');
    return;
  }

  if(gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT).precision <= 0) {
    alert('High precision, required for this demo, not supported in this hardware');
    return;
  }

  gl.clearColor(1, 1, 1, 1);
  interaction = {};
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

  makeSwitch('play-controls', playControl, 0);
  makeSwitch('func', changeFuncType, 0);
  makeSwitch('plotType', changePlotType, 0);
  document.getElementById('reset').addEventListener('click', reset);
  addPointerListeners(document.getElementById('coords'), pStart, pMove);
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
  document.getElementById('shape-controls').classList.add('hidden');
  if(!playing) {
    playing = true;
    requestAnimationFrame(draw);
  }
}

function pause() {
  playing = false;
  resetAngle();
  document.getElementById('shape-controls').classList.remove('hidden');
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
  updateControls();
}

function reset(e) {
  angle = 0;
  scale = new Float32Array([1, 0, 0, 1]);
  shift = new Float32Array([0, 0]);
  updateUniforms();
  updateControls();
  requestAnimationFrame(draw);
  e.preventDefault();
}

function changeFuncType(elm) {
  var id = elm.getAttribute('data-func');
  for(p in progs) {
    gl.useProgram(progs[p].program);
    gl.uniform1i(progs[p].uFunc, id);
  }
  resetAngle();
  document.getElementById('separ').classList.toggle('hidden', elm.id != 'cat');
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

  for(p in progs) {
    gl.useProgram(progs[p].program);
    gl.uniformMatrix3fv(progs[p].uMatrix, false, mat3);
  }
}

function updateControls() {
  var controls = document.getElementById('shape-controls');
  function coords(x, y) {
    return (shift[0] + x*scale[0] + y*scale[2]) + ' ' + (shift[1] + x*scale[1] + y*scale[3]);
  }
  function coordsN(x, y, n) {
    return (shift[0] + x*scale[0] + y*scale[2] + y*n*scale[1] - x*n*scale[3])
      + ' ' + (shift[1] + x*scale[1] + y*scale[3] - y*n*scale[0] + x*n*scale[2]);
  }
  const ps = coords(0, 0);
  document.getElementById('bounds').setAttribute('d', 'M ' + coords(-1, -1)
    + ' L ' + coords(1, -1) + ' L ' + coords(1, 1) + ' L ' + coords(-1, 1) + ' z');
  document.getElementById('center').setAttribute('d', 'M ' + ps + ' M ' + ps);
  document.getElementById('edge-x').setAttribute('d', 'M ' + coordsN(1, 0, 1) + ' M ' + coords(1, 0));
  document.getElementById('edge-y').setAttribute('d', 'M ' + coordsN(0, 1, 1) + ' M ' + coords(0, 1));
  document.getElementById('corner-xy').setAttribute('d', 'M ' + ps + ' M ' + coords(1, 1));
  document.getElementById('separ').setAttribute('d', 'M ' + ps + ' M ' + coords(catSepar, 0));
}

function pStart(elm, x, y, rect) {
  if(playing) {
    document.getElementById('pause').click();
    return;
  }
  var tx = 5*(2*x/rect.width - 1);
  var ty = -5*(2*y/rect.height - 1);
  function dist(tx, ty, mx, my) {
    return Math.hypot(shift[0] + mx*scale[0] + my*scale[2] - tx,
      shift[1] + mx*scale[1] + my*scale[3] - ty);
  }
  if(dist(tx, ty, 0, 0) < 0.2)
    interaction.moving = 'c';
  else if(dist(tx, ty, 1, 0) < 0.2)
    interaction.moving = 'ex';
  else if(dist(tx, ty, 0, 1) < 0.2)
    interaction.moving = 'ey';
  else if(dist(tx, ty, 1, 1) < 0.2)
    interaction.moving = 'cxy';
  else if(dist(tx, ty, catSepar, 0) < 0.2)
    interaction.moving = 's';
  else
    interaction.moving = null;
  interaction.lastX = tx;
  interaction.lastY = ty;
}


function pMove(elm, x, y, rect) {
  function matAccept(mx) {
    let h1 = Math.hypot(mx[0], mx[1]);
    let h2 = Math.hypot(mx[2], mx[3]);
    let sp = (mx[0]*mx[2] + mx[1]*mx[3])/h1/h2;
    return h1 > 0.5 && h1 < 2 && h2 > 0.5 && h2 < 2 && sp > -1 && sp < 1;
  }

  if(!interaction.moving)
    return;

  var tx = 5*(2*x/rect.width - 1);
  var ty = -5*(2*y/rect.height - 1);
  if(interaction.moving === 'c') {
    shift[0] += tx - interaction.lastX;
    shift[1] += ty - interaction.lastY;
  } else {
    var dx = tx - shift[0];
    var dy = ty - shift[1];
    var u = [scale[0], scale[1]];
    var v = [scale[2], scale[3]];
    var uv = [u[0]+v[0], u[1]+v[1]];
    var mx = v[1] * dx - v[0] * dy;
    var my = -u[1] * dx + u[0] * dy;
    switch(interaction.moving) {
      case 'ex': {
        let nmx = new Float32Array([mx*scale[0] + my*scale[2], mx*scale[1] + my*scale[3], scale[2]/mx, scale[3]/mx]);
        if(matAccept(nmx))
          scale = nmx;
        break; }
      case 'ey': {
        let nmx = new Float32Array([scale[0]/my, scale[1]/my, my*scale[2] + mx*scale[0], my*scale[3] + mx*scale[1]]);
        if(matAccept(nmx))
          scale = nmx;
        break; }
      case 'cxy': {
        let expK = Math.hypot(dx, dy) / Math.hypot(uv[0], uv[1]);
        let ch = (expK + 1/expK) / 2, sh = (expK - 1/expK) / 2;
        let rot = Math.atan2(dy*uv[0] - dx*uv[1], dx*uv[0] + dy*uv[1]);
        let c = Math.cos(rot), s = Math.sin(rot);
        let m1 = new Float32Array([scale[0]*ch + scale[2]*sh, scale[1]*ch + scale[3]*sh, scale[0]*sh + scale[2]*ch, scale[1]*sh + scale[3]*ch]);
        let m2 = new Float32Array([c*m1[0] - s*m1[1], s*m1[0] + c*m1[1], c*m1[2] - s*m1[3], s*m1[2] + c*m1[3]]);
        if(matAccept(m2))
          scale = m2;
        break; }
      case 's': {
        let u = [scale[0], scale[1]];
        let rot = Math.atan2(dy*u[0] - dx*u[1], dx*u[0] + dy*u[1]);
        let c = Math.cos(rot), s = Math.sin(rot);
        scale = new Float32Array([c*scale[0] - s*scale[1], s*scale[0] + c*scale[1], c*scale[2] - s*scale[3], s*scale[2] + c*scale[3]]);
        catSepar = Math.max(Math.min(Math.hypot(dx, dy) / Math.hypot(u[0], u[1]), 4), 0.5);
        break; }
    }
  }
  interaction.lastX = tx;
  interaction.lastY = ty;
  updateUniforms();
  updateControls();
  requestAnimationFrame(draw);
}
