'use strict';

var interaction = {}, values;
var gl, progs, texture, fullBuff;
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

  makeSwitch('polarization', changePolarization, 0);
  document.getElementById('ratio').addEventListener('change', ratioChanged);
  document.getElementById('ratio').addEventListener('input', ratioChanged);
  addPointerListeners(document.getElementById('coords'), pStart, pMove);
  requestAnimationFrame(draw);
}

function updateValues() {
  let kMag = baseK / values.wavelength;
  let kVec = [kMag * Math.sin(values.angle), kMag * Math.cos(values.angle)];
  let spread = Math.PI/(values.width * kMag);

  [progs.prepAbove, progs.prepBelow].forEach(function(prog) {
    gl.useProgram(prog.program);
    gl.uniform2fv(prog.uK, kVec);
    gl.uniform1f(prog.uN2N1, Math.pow(values.ratio, 2));
    gl.uniform1f(prog.uSpread, spread);
    gl.uniform1i(prog.uPpolarized, values.polarization === 'p');
  });

  gl.useProgram(progs.draw.program);
  gl.uniform2fv(progs.draw.uK, kVec);
  gl.uniform1i(progs.draw.uSampler, texture);

  function r2d(rad) {
    return rad / Math.PI * 180;
  }
  document.getElementById('incident').setAttribute('transform',
    'rotate(' + (-90-r2d(values.angle)) + ')');
  document.getElementById('reflected').setAttribute('transform',
    'rotate(' + (-90+r2d(values.angle)) + ')');
  let angleRef = Math.asin(Math.sin(values.angle) / values.ratio);
  if(!isNaN(angleRef))
    document.getElementById('refracted').setAttribute('transform',
      'rotate(' + (90-r2d(angleRef)) + ')');
  document.getElementById('refracted').classList.toggle('hide', isNaN(angleRef));
  document.getElementById('width').setAttribute('d',
    'M 3 ' + -(values.width + .5) + ' V ' + -values.width + ' V ' + values.width + ' v .5');
  document.getElementById('wavelength').setAttribute('d',
    'M ' + (values.wavelength - .5) + ' 0 h .5 h .5');
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

function pStart(elm, x, y, rect) {
  var tx = 5*(2*x/rect.width - 1);
  var ty = -5*(2*y/rect.height - 1);
  var cc = Math.cos(values.angle);
  var ss = Math.sin(values.angle);
  function trf(tx, ty) {
    return [-ss*tx - cc*ty, -ss*ty + cc*tx];
  }
  function dist(tx, ty, mx, my) {
    let [ux, uy] = trf(tx, ty);
    return Math.hypot(ux-mx, uy-my);
  }
  if(dist(tx, ty, 4.5, 0) < 0.2)
    interaction.moving = 'rot';
  else if(dist(tx, ty, 3, values.width) < 0.2)
    interaction.moving = 'w';
  else if(dist(tx, ty, 3, -values.width) < 0.2)
    interaction.moving = 'w';
  else if(dist(tx, ty, values.wavelength, 0) < 0.2)
    interaction.moving = 'wl';
  else
    interaction.moving = null;
}

function pMove(elm, x, y, rect) {
  if(!interaction.moving)
    return;

  var tx = 5*(2*x/rect.width - 1);
  var ty = -5*(2*y/rect.height - 1);
  if(interaction.moving === 'rot') {
    if(ty > 0)
      ty = 0;
    values.angle = Math.atan2(-tx, -ty);
  } else if(interaction.moving === 'w') {
    let cc = Math.cos(values.angle);
    let ss = Math.sin(values.angle);
    let w = Math.abs(cc*tx - ss*ty);
    if(w < 0.05)
      w = 0.05;
    else if(w > 4)
      w = 4;
    values.width = w;
  } else if(interaction.moving === 'wl') {
    let cc = Math.cos(values.angle);
    let ss = Math.sin(values.angle);
    let d = -(ss*tx + cc*ty);
    if(d < 0.7)
      d = 0.7;
    if(d > 5)
      d = 5;
    values.wavelength = d;
  }
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
