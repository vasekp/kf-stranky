var gl;

function draw(time) {
  if(iface.lastTime)
    iface.angle += (time - iface.lastTime) * iface.speed;
  iface.lastTime = time;

  gl.viewport(0, gl.canvas.height / 2, gl.canvas.width, gl.canvas.height / 2);

  gl.useProgram(progs.wigner.program);
  gl.enableVertexAttribArray(progs.wigner.aPos);
  gl.bindBuffer(gl.ARRAY_BUFFER, progs.wigner.bPos);
  gl.vertexAttribPointer(progs.wigner.aPos, 2, gl.FLOAT, false, 0, 0);
  gl.uniform1f(progs.wigner.uAngle, iface.angle);
  gl.uniform1f(progs.wigner.uSepar, 2.5);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  gl.disableVertexAttribArray(progs.wigner.aPos);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height / 2);

  gl.useProgram(progs.quad.program);
  gl.enableVertexAttribArray(progs.quad.aPos);
  gl.bindBuffer(gl.ARRAY_BUFFER, progs.quad.bPos);
  gl.vertexAttribPointer(progs.quad.aPos, 2, gl.FLOAT, false, 0, 0);
  gl.uniform1f(progs.quad.uAngle, iface.angle);
  gl.uniform1f(progs.quad.uSepar, 2.5);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  gl.disableVertexAttribArray(progs.quad.aPos);

  requestAnimationFrame(draw);
}

function start(files) {
  var vs, fs;

  progs.wigner = {};
  vs = createShader(gl, gl.VERTEX_SHADER, files['wigner.vert']);
  fs = createShader(gl, gl.FRAGMENT_SHADER, files['wigner.frag']);
  progs.wigner.program = createProgram(gl, vs, fs);
  progs.wigner.aPos = gl.getAttribLocation(progs.wigner.program, 'aPos');
  progs.wigner.uAngle = gl.getUniformLocation(progs.wigner.program, 'uAngle');
  progs.wigner.uSepar = gl.getUniformLocation(progs.wigner.program, 'uSepar');

  progs.quad = {};
  vs = createShader(gl, gl.VERTEX_SHADER, files['quad.vert']);
  fs = createShader(gl, gl.FRAGMENT_SHADER, files['quad.frag']);
  progs.quad.program = createProgram(gl, vs, fs);
  progs.quad.aPos = gl.getAttribLocation(progs.quad.program, 'aPos');
  progs.quad.uAngle = gl.getUniformLocation(progs.quad.program, 'uAngle');
  progs.quad.uSepar = gl.getUniformLocation(progs.quad.program, 'uSepar');

  progs.wigner.bPos = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, progs.wigner.bPos);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1,
    1, -1,
    -1, 1,
    1, 1,
    -1, 1,
    1, -1]), gl.STATIC_DRAW);

  progs.quad.bPos = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, progs.quad.bPos);
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
