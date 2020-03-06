var gl;

function draw(time) {
  if(iface.lastTime)
    iface.angle += (time - iface.lastTime) * iface.speed;
  iface.lastTime = time;

  gl.bindBuffer(gl.ARRAY_BUFFER, progs.bufs.full);

  gl.viewport(0, gl.canvas.height / 2, gl.canvas.width, gl.canvas.height / 2);
  gl.useProgram(progs.wigner.program);
  gl.enableVertexAttribArray(progs.wigner.aPos);
  gl.vertexAttribPointer(progs.wigner.aPos, 2, gl.FLOAT, false, 0, 0);
  gl.uniform1f(progs.wigner.uAngle, iface.angle);
  gl.uniform1f(progs.wigner.uSepar, 2.5);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  gl.disableVertexAttribArray(progs.wigner.aPos);

  gl.viewport(0, 0.4 * gl.canvas.height, gl.canvas.width, 0.1 * gl.canvas.height);
  gl.useProgram(progs.graph.program);
  gl.enableVertexAttribArray(progs.graph.aPos);
  gl.vertexAttribPointer(progs.graph.aPos, 2, gl.FLOAT, false, 0, 0);
  gl.uniform1f(progs.graph.uAngle, iface.angle);
  gl.uniform1f(progs.graph.uSepar, 2.5);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  gl.disableVertexAttribArray(progs.graph.aPos);

  gl.viewport(0, 0, gl.canvas.width, 0.4 * gl.canvas.height);
  gl.useProgram(progs.quad.program);
  gl.enableVertexAttribArray(progs.quad.aPos);
  gl.vertexAttribPointer(progs.quad.aPos, 2, gl.FLOAT, false, 0, 0);
  gl.uniform1f(progs.quad.uAngle, iface.angle);
  gl.uniform1f(progs.quad.uSepar, 2.5);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  gl.disableVertexAttribArray(progs.quad.aPos);

  requestAnimationFrame(draw);
}

function start(files) {
  var vs, fs;

  progs.wigner = createProgram(gl, files['wigner.vert'], files['wigner.frag']);
  progs.quad = createProgram(gl, files['quad.vert'], files['quad.frag']);
  progs.graph = createProgram(gl, files['graph.vert'], files['graph.frag']);
  progs.bufs = {};

  progs.bufs.full = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, progs.bufs.full);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1,
    1, -1,
    -1, 1,
    1, 1,
    -1, 1,
    1, -1]), gl.STATIC_DRAW);

  requestAnimationFrame(draw);
}

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

  progs = {};
  loadFiles(start);

  iface = {
    angle: 0,
    speed: .001
  };

  /*let funcListener = function(e) {
    newFunc(e.currentTarget.id);
    e.preventDefault();
  };

  addPointerListeners(canvas, rotStart, rotMove);
  document.getElementById('random').addEventListener('click', funcListener);
  document.getElementById('l+').addEventListener('click', funcListener);
  document.getElementById('l-').addEventListener('click', funcListener);
  document.getElementById('m+').addEventListener('click', funcListener);
  document.getElementById('m-').addEventListener('click', funcListener);*/
});
