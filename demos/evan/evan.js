'use strict';

var interaction = {}, values;
var gl, progs, texture, fullBuff;
var over;
const baseK = 40;

window.addEventListener('DOMContentLoaded', function() {
  var canvas = document.getElementById('canvas');
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  gl = canvas.getContext('webgl');

  if(!gl) {
    alert('WebGL not supported');
    return;
  }

  loadFiles(filesReady);
});

function filesReady(files) {
  progs = {};

  progs.prepBelow = new Program(gl, files['prepare.vert'], files['prep-below.frag']);
  progs.prepAbove = new Program(gl, files['prepare.vert'], files['prep-above.frag']);
  progs.draw = new Program(gl, files['draw.vert'], files['draw.frag']);

  fullBuff = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, fullBuff);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1,
    1, -1,
    -1, 1,
    1, 1,
    -1, 1,
    1, -1]), gl.STATIC_DRAW);

  texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.canvas.width, gl.canvas.height, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  gl.enable(gl.SCISSOR_TEST);
  progs.prepAbove.scissor = scissorAbove;
  progs.prepBelow.scissor = scissorBelow;

  values = {
    angle: Math.PI/4,
    ratio: Math.exp(-.25),
    width: 1,
    polarization: 's',
    wavelength: 1.5
  };

  over = new Overlay(document.getElementById('container'),
    { xMin: -5, xMax: 5, yMin: -5, yMax: 5 });
  let centerFun = function() { return [0, 0]; };
  over.addControl(new DashedPath(
    function() { return [
      [-8*Math.sin(values.angle), -8*Math.cos(values.angle)],
      [0, 0],
      [8*Math.sin(values.angle), -8*Math.cos(values.angle)]]; },
    'black'));
  over.addControl(new DashedPath(
    function() {
      let angleCrit = Math.asin(values.ratio);
      return !isNaN(angleCrit) ? [
        [-8*Math.sin(angleCrit), -8*Math.cos(angleCrit)],
        [0, 0],
        [8*Math.sin(angleCrit), -8*Math.cos(angleCrit)]
      ] : null; },
    'red'));
  over.addControl(new DashedPath(
    function() {
      let angleRef = Math.asin(Math.sin(values.angle) / values.ratio);
      return !isNaN(angleRef) ? [[0, 0], [8*Math.sin(angleRef), 8*Math.cos(angleRef)]] : null; },
    'black'));
  over.addControl(new CenterControl(
    function() { return [-4.5*Math.sin(values.angle), -4.5*Math.cos(values.angle)]; },
    centerFun,
    'vert-bent', '#F44', moveAngle
  ));
  over.addControl(new CenterControl(
    function() { return [-values.wavelength*Math.sin(values.angle), -values.wavelength*Math.cos(values.angle)]; },
    centerFun,
    'horz', '#4F4', moveWavelength
  ));
  over.addControl(new DirControl(
    function() {
      let c = Math.cos(values.angle),
          s = Math.sin(values.angle);
      return [-3*s - values.width * c, -3*c + values.width * s];
    },
    centerFun,
    function() { return [-3*Math.sin(values.angle), -3*Math.cos(values.angle)]; },
    'vert', '#44F', moveWidth
  ));

  makeSwitch('polarization', changePolarization, 0);
  document.getElementById('ratio').addEventListener('change', ratioChanged);
  document.getElementById('ratio').addEventListener('input', ratioChanged);
  requestAnimationFrame(draw);
}

function updateValues() {
  // Too narrow beams are unphysical: force Rayleigh length at least 5 (viewport size)
  if(values.width < Math.sqrt(10*values.wavelength / baseK))
    values.width = Math.sqrt(10*values.wavelength / baseK);
  over.refresh();

  let kMag = baseK / values.wavelength;
  let kVec = [kMag * Math.sin(values.angle), kMag * Math.cos(values.angle)];
  let spread = Math.PI/(values.width * kMag);

  [progs.prepAbove, progs.prepBelow].forEach(function(prog) {
    gl.useProgram(prog.program);
    gl.uniform2fv(prog.uK, kVec);
    gl.uniform1f(prog.uRatioSquared, Math.pow(values.ratio, 2));
    gl.uniform1f(prog.uSpread, spread);
    gl.uniform1i(prog.uPpolarized, values.polarization === 'p');
  });

  gl.useProgram(progs.draw.program);
  gl.uniform2fv(progs.draw.uK, kVec);
  gl.uniform1i(progs.draw.uSampler, texture);
}

function scissorAbove() {
  gl.scissor(0, gl.canvas.height / 2, gl.canvas.width, gl.canvas.height);
}

function scissorBelow() {
  gl.scissor(0, 0, gl.canvas.width, gl.canvas.height / 2);
}

function prepare() {
  const fb = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, fullBuff);

  [progs.prepAbove, progs.prepBelow].forEach(function(prog) {
    prog.scissor();
    gl.useProgram(prog.program);
    gl.enableVertexAttribArray(prog.aPos);
    gl.vertexAttribPointer(prog.aPos, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.disableVertexAttribArray(prog.aPos);
  });

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

function draw(time) {
  gl.bindBuffer(gl.ARRAY_BUFFER, fullBuff);
  gl.useProgram(progs.draw.program);
  gl.uniform1f(progs.draw.uTime, (time / 1000.0) % (2*Math.PI));
  gl.enableVertexAttribArray(progs.draw.aPos);
  gl.vertexAttribPointer(progs.draw.aPos, 2, gl.FLOAT, false, 0, 0);
  gl.scissor(0, 0, gl.canvas.width, gl.canvas.height / 2);
  gl.uniform1f(progs.draw.uBackground, Math.min(values.ratio, 1));
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  gl.scissor(0, gl.canvas.height / 2, gl.canvas.width, gl.canvas.height);
  gl.uniform1f(progs.draw.uBackground, Math.min(1/values.ratio, 1));
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  gl.disableVertexAttribArray(progs.draw.aPos);
  requestAnimationFrame(draw);
}

function moveAngle(x, y) {
  if(y > 0)
    y = 0;
  values.angle = Math.atan2(-x, -y);
  updateValues();
  prepare();
}

function moveWavelength(x, y) {
  let cc = Math.cos(values.angle);
  let ss = Math.sin(values.angle);
  let d = -(ss*x + cc*y);
  if(d < 0.7)
    d = 0.7;
  if(d > 5)
    d = 5;
  values.wavelength = d;
  updateValues();
  prepare();
}

function moveWidth(x, y) {
  let cc = Math.cos(values.angle);
  let ss = Math.sin(values.angle);
  let w = Math.abs(cc*x - ss*y);
  if(w < 0.05)
    w = 0.05;
  else if(w > 4)
    w = 4;
  values.width = w;
  updateValues();
  prepare();
}

function changePolarization(elm) {
  values.polarization = elm.id;
  updateValues();
  prepare();
}

function ratioChanged(e) {
  values.ratio = Math.exp(e.currentTarget.value);
  updateValues();
  prepare();
}
