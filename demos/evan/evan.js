'use strict';

var gl;
var interaction, progs, texture;
var fullBuff;

window.addEventListener('DOMContentLoaded', function() {
  var canvas = document.getElementById('canvas');
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  gl = canvas.getContext('webgl');

  if(!gl) {
    alert('WebGL not supported');
    return;
  }

  /*if(gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT).precision <= 0) {
    alert('High precision, required for this demo, not supported in this hardware');
    return;
  }*/

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

  prepare();
  requestAnimationFrame(draw);
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
    gl.uniform2f(prog.uK, 25, 20);
    gl.uniform1f(prog.uN2N1, 0.5);
    gl.uniform1f(prog.uSpread, .1);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.disableVertexAttribArray(prog.aPos);
  });

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

function draw(time) {
  gl.bindBuffer(gl.ARRAY_BUFFER, fullBuff);
  gl.useProgram(progs.draw.program);
  gl.uniform2f(progs.draw.uK, 25, 20);
  gl.uniform1f(progs.draw.uTime, time / 1000.0);
  gl.uniform1i(progs.draw.uSampler, texture);
  gl.enableVertexAttribArray(progs.draw.aPos);
  gl.vertexAttribPointer(progs.draw.aPos, 2, gl.FLOAT, false, 0, 0);
  gl.scissor(0, 0, gl.canvas.width, gl.canvas.height / 2);
  gl.uniform1f(progs.draw.uBackground, 0.7);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  gl.scissor(0, gl.canvas.height / 2, gl.canvas.width, gl.canvas.height);
  gl.uniform1f(progs.draw.uBackground, 1);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  gl.disableVertexAttribArray(progs.draw.aPos);
  requestAnimationFrame(draw);
}
