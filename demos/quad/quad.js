var ctxWigner, ctxQuad;

function draw(time) {
  if(iface.lastTime)
    iface.angle += (time - iface.lastTime) * iface.speed;
  iface.lastTime = time;

  //ctxWigner.disable(ctxWigner.DEPTH_TEST);
  ctxWigner.useProgram(progs.wigner.program);
  ctxWigner.enableVertexAttribArray(progs.wigner.aPos);
  ctxWigner.bindBuffer(ctxWigner.ARRAY_BUFFER, progs.wigner.bPos);
  ctxWigner.vertexAttribPointer(progs.wigner.aPos, 2, ctxWigner.FLOAT, false, 0, 0);
  ctxWigner.uniform1f(progs.wigner.uAngle, iface.angle);
  ctxWigner.uniform1f(progs.wigner.uSepar, 2.5);
  ctxWigner.drawArrays(ctxWigner.TRIANGLES, 0, 6);
  ctxWigner.disableVertexAttribArray(progs.wigner.aPos);

  ctxQuad.useProgram(progs.quad.program);
  ctxQuad.enableVertexAttribArray(progs.quad.aPos);
  ctxQuad.bindBuffer(ctxQuad.ARRAY_BUFFER, progs.quad.bPos);
  ctxQuad.vertexAttribPointer(progs.quad.aPos, 2, ctxQuad.FLOAT, false, 0, 0);
  ctxQuad.uniform1f(progs.quad.uAngle, iface.angle);
  ctxQuad.uniform1f(progs.quad.uSepar, 2.5);
  ctxQuad.drawArrays(ctxQuad.TRIANGLES, 0, 6);
  ctxQuad.disableVertexAttribArray(progs.quad.aPos);

  requestAnimationFrame(draw);
}

function start(files) {
  var vs, fs;

  progs.wigner = {};
  vs = createShader(ctxWigner, ctxWigner.VERTEX_SHADER, files['wigner.vert']);
  fs = createShader(ctxWigner, ctxWigner.FRAGMENT_SHADER, files['wigner.frag']);
  progs.wigner.program = createProgram(ctxWigner, vs, fs);
  progs.wigner.aPos = ctxWigner.getAttribLocation(progs.wigner.program, 'aPos');
  progs.wigner.uAngle = ctxWigner.getUniformLocation(progs.wigner.program, 'uAngle');
  progs.wigner.uSepar = ctxWigner.getUniformLocation(progs.wigner.program, 'uSepar');

  progs.quad = {};
  vs = createShader(ctxQuad, ctxQuad.VERTEX_SHADER, files['quad.vert']);
  fs = createShader(ctxQuad, ctxQuad.FRAGMENT_SHADER, files['quad.frag']);
  progs.quad.program = createProgram(ctxQuad, vs, fs);
  progs.quad.aPos = ctxQuad.getAttribLocation(progs.quad.program, 'aPos');
  progs.quad.uAngle = ctxQuad.getUniformLocation(progs.quad.program, 'uAngle');
  progs.quad.uSepar = ctxQuad.getUniformLocation(progs.quad.program, 'uSepar');

  progs.wigner.bPos = ctxWigner.createBuffer();
  ctxWigner.bindBuffer(ctxWigner.ARRAY_BUFFER, progs.wigner.bPos);
  ctxWigner.bufferData(ctxWigner.ARRAY_BUFFER, new Float32Array([
    -1, -1,
    1, -1,
    -1, 1,
    1, 1,
    -1, 1,
    1, -1]), ctxWigner.STATIC_DRAW);

  progs.quad.bPos = ctxQuad.createBuffer();
  ctxQuad.bindBuffer(ctxQuad.ARRAY_BUFFER, progs.quad.bPos);
  ctxQuad.bufferData(ctxQuad.ARRAY_BUFFER, new Float32Array([
    -1, -1,
    1, -1,
    -1, 1,
    1, 1,
    -1, 1,
    1, -1]), ctxQuad.STATIC_DRAW);

  requestAnimationFrame(draw);
}

window.addEventListener('DOMContentLoaded', function() {
  var canvas = document.getElementById('wigner');
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  ctxWigner = canvas.getContext('webgl');

  canvas = document.getElementById('quad');
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  ctxQuad = canvas.getContext('webgl');

  if(!ctxWigner || !ctxQuad) {
    alert('WebGL not supported');
    return;
  }

  ctxWigner.viewport(0, 0, ctxWigner.canvas.width, ctxWigner.canvas.height);
  ctxQuad.viewport(0, 0, ctxQuad.canvas.width, ctxQuad.canvas.height);

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
