'use strict';

var gl, c2d, progs, fb, texture, model, interaction;
var over;

window.addEventListener('DOMContentLoaded', function() {
  var canvas = document.getElementById('sphere');
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  gl = canvas.getContext('webgl');

  canvas = document.getElementById('vector');
  var ratio = window.devicePixelRatio || 1;
  canvas.width = canvas.clientWidth * ratio;
  canvas.height = canvas.clientHeight * ratio;
  c2d = canvas.getContext('2d');
  c2d.setTransform(canvas.width/3, 0, 0, -canvas.height/3, canvas.width/2, canvas.height/2);
  c2d.lineWidth = 0.05;
  c2d.lineCap = 'round';

  if(!gl) {
    alert('Functionality necessary for this demo not supported. Please use a newer browser.');
    return;
  }

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.enable(gl.CULL_FACE);

  model = {
    tilt: 0.2,
    angle: -.8,
    theta: 1,
    phi: 1,
    state: new State(2, -.5, 1.3),
    changed: true
  };
  interaction = {};
  updateQView();

  over = new Overlay(document.getElementById('container2D'),
    { xMin: -1.5, xMax: 1.5, yMin: -1.5, yMax: 1.5 });
  over.addControl(new CoordAxes(-1.3, 1.3, -1.3, 1.3,
    '<tspan>E</tspan><tspan font-size=".8" dy=".2">x</tspan>',
    '<tspan>E</tspan><tspan font-size=".8" dy=".2">y</tspan>'));
  over.addControl(new DashedPath(
    function() {
      let A = model.state.A, B = model.state.B;
      return [[-A, -B], [-A, B], [A, B], [A, -B], [-A, -B]];
    },
    '#F80'));
  let centerFun = function() { return [0, 0]; };
  over.addControl(new CenterControl(
    function() {
      let e = model.state.ellipse;
      return [e.a*Math.cos(e.angle), e.a*Math.sin(e.angle)]; },
    centerFun,
    'bent', '#08F', moveSemiaxis
  ));
  over.addControl(new CenterControl(
    function() {
      let e = model.state.ellipse;
      return [e.b*Math.sin(e.angle), -e.b*Math.cos(e.angle)]; },
    centerFun,
    'bent', '#08F', moveSemiaxis
  ));
  over.addControl(new CenterControl(
    function() {
      let e = model.state.ellipse;
      return [-e.a*Math.cos(e.angle), -e.a*Math.sin(e.angle)]; },
    centerFun,
    'bent', '#08F', moveSemiaxis
  ));
  over.addControl(new CenterControl(
    function() {
      let e = model.state.ellipse;
      return [-e.b*Math.sin(e.angle), e.b*Math.cos(e.angle)]; },
    centerFun,
    'bent', '#08F', moveSemiaxis
  ));

  loadFiles(filesReady);
});

function filesReady(files) {
  progs = {};

  progs.bkg = new Program(gl, files['background.vert'], files['background.frag']);

  progs.bkg.bPos = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, progs.bkg.bPos);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1,
    1, -1,
    -1, 1,
    1, 1,
    -1, 1,
    1, -1]), gl.STATIC_DRAW);

  progs.sphere = new Program(gl, files['sphere.vert'], files['sphere.frag']);

  const divX = 100, divY = 50;
  var cx = new GraphicsComplex(divX * (divY + 1), 3, function(xy) {
    return (xy[0] % divX) + xy[1] * divX;
  });
  for(let y = 0; y <= divY; y++) {
    let theta = Math.PI * y / divY + 0.001;
    for(let x = 0; x < divX; x++) {
      let phi = 2*Math.PI * x / divX + 0.001;
      cx.put([x, y], [Math.sin(theta) * Math.cos(phi), Math.sin(theta) * Math.sin(phi), Math.cos(theta)]);
      if(y < divY) {
        cx.simplex([x+1, y], [x, y], [x, y+1]);
        cx.simplex([x, y+1], [x+1, y+1], [x+1, y]);
      }
    }
  }
  progs.sphere.bPos = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, progs.sphere.bPos);
  gl.bufferData(gl.ARRAY_BUFFER, cx.coords(), gl.STATIC_DRAW);
  progs.sphere.bIx = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, progs.sphere.bIx);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cx.indices(), gl.STATIC_DRAW);
  progs.sphere.length = cx.length();

  progs.solid = new Program(gl, files['solid.vert'], files['solid.frag']);

  const divArrow = 10;
  cx = new GraphicsComplex(divArrow * 2 + 2, 6, function(xy) {
    return Array.isArray(xy) ? (xy[0] % divArrow) * 2 + xy[1] : divArrow * 2 + xy;
  });
  const rAxis = 0.025;
  const zStart = -1.4, zEnd = 1.4;
  cx.put(0, [0, 0, zStart,  0, 0, -1]);
  cx.put(1, [0, 0, zEnd,    0, 0, 1]);
  for(let x = 0; x < divArrow; x++) {
    let phi = 2*Math.PI * x / divArrow;
    let c = Math.cos(phi), s = Math.sin(phi);
    cx.put([x, 0], [rAxis * c, rAxis * s, zStart,  c, s, 0]);
    cx.put([x, 1], [rAxis * c, rAxis * s, zEnd,    c, s, 0]);
    cx.simplex([x, 0], [x+1, 0], [x, 1]);
    cx.simplex([x+1, 1], [x, 1], [x+1, 0]);
    cx.simplex([x+1, 0], [x, 0], 0);
    cx.simplex([x, 1], [x+1, 1], 1);
  }

  progs.solid.axes = {};
  progs.solid.axes.bAttrib = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, progs.solid.axes.bAttrib);
  gl.bufferData(gl.ARRAY_BUFFER, cx.coords(), gl.STATIC_DRAW);
  progs.solid.axes.bIx = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, progs.solid.axes.bIx);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cx.indices(), gl.STATIC_DRAW);
  progs.solid.axes.length = cx.length();

  const v2 = 1/Math.sqrt(2);
  progs.solid.axes.quats = [];
  progs.solid.axes.quats[0] = new Float32Array([0, v2, 0, v2]);
  progs.solid.axes.quats[1] = new Float32Array([-v2, 0, 0, v2]);
  progs.solid.axes.quats[2] = new Float32Array([0, 0, 0, 1]);

  const c1 = 0.3, c2 = 0.8;
  progs.solid.axes.colors = [];
  progs.solid.axes.colors[0] = new Float32Array([c1, c1, c2]);
  progs.solid.axes.colors[1] = new Float32Array([c1, c2, c1]);
  progs.solid.axes.colors[2] = new Float32Array([c2, c1, c1]);
  progs.solid.axes.colorsSat = [];
  progs.solid.axes.colorsSat[0] = new Float32Array([0, 0, 1]);
  progs.solid.axes.colorsSat[1] = new Float32Array([0, 1, 0]);
  progs.solid.axes.colorsSat[2] = new Float32Array([1, 0, 0]);

  cx = new GraphicsComplex(divArrow * 4 + 1, 6, function(xy) {
    return Array.isArray(xy) ? (xy[0] % divArrow) * 4 + xy[1] : divArrow * 4 + xy;
  });
  const rIn = 0.03;
  const rOut = 0.06;
  const zTip = 1.02;
  cx.put(0, [0, 0, zTip,  0, 0, 0]);
  for(let x = 0; x < divArrow; x++) {
    let phi = 2*Math.PI * x / divArrow;
    let c = Math.cos(phi), s = Math.sin(phi);
    cx.put([x, 0], [rIn * c, rIn * s, 0,    c, s, 0]);
    cx.put([x, 1], [rIn * c, rIn * s, 1,    c, s, 0]);
    cx.put([x, 2], [rOut * c, rOut * s, 1,  0, 0, -1]);
    cx.put([x, 3], [rOut * c, rOut * s, zTip,  0, 0, 1]);
    cx.simplex([x, 0], [x+1, 0], [x, 1]);
    cx.simplex([x+1, 1], [x, 1], [x+1, 0]);
    cx.simplex([x, 1], [x+1, 1], [x, 2]);
    cx.simplex([x+1, 2], [x, 2], [x+1, 1]);
    cx.simplex([x, 2], [x+1, 2], [x, 3]);
    cx.simplex([x+1, 3], [x, 3], [x+1, 2]);
    cx.simplex([x, 3], [x+1, 3], 0);
  }

  progs.solid.arrow = {};
  progs.solid.arrow.bAttrib = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, progs.solid.arrow.bAttrib);
  gl.bufferData(gl.ARRAY_BUFFER, cx.coords(), gl.STATIC_DRAW);
  progs.solid.arrow.bIx = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, progs.solid.arrow.bIx);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cx.indices(), gl.STATIC_DRAW);
  progs.solid.arrow.length = cx.length();

  progs.solid.arrow.color = new Float32Array([c2, c2, c1]);
  progs.solid.arrow.colorSat = new Float32Array([1, 1, 0]);

  progs.flat = new Program(gl, files['flat.vert'], files['flat.frag']);

  const divDisk = 6;
  cx = new GraphicsComplex(divDisk + 1, 2, function(x) { return x; });
  const patchSize = 0.2;
  for(let x = 0; x < divDisk; x++) {
    let phi = 2*Math.PI * x / divDisk + 0.001;
    cx.put(x, [patchSize * Math.cos(phi), patchSize * Math.sin(phi)]);
    cx.simplex(x, (x + 1) % divDisk, divDisk);
  }
  cx.put(divDisk, [0, 0]);

  progs.flat.disk = {};
  progs.flat.disk.bPos = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, progs.flat.disk.bPos);
  gl.bufferData(gl.ARRAY_BUFFER, cx.coords(), gl.STATIC_DRAW);
  progs.flat.disk.bIx = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, progs.flat.disk.bIx);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cx.indices(), gl.STATIC_DRAW);
  progs.flat.disk.length = cx.length();

  progs.line = new Program(gl, files['line.vert'], files['flat.frag']);

  progs.line.bFactor = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, progs.line.bFactor);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      1, 1, 1, 1, 1, 0,
      1, 1, 1, 1, 0, 1,
      1, 1, 1, 0, 1, 1,
      1, 1, 0, 1, 0, 0,
      1, 1, 0, 0, 1, 0,
      1, 0, 1, 1, 0, 0,
      1, 0, 1, 0, 0, 1,
      0, 1, 1, 0, 1, 0,
      0, 1, 1, 0, 0, 1
    ]), gl.STATIC_DRAW);

  texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.canvas.width, gl.canvas.height, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  var rb = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, rb);
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, gl.canvas.width, gl.canvas.height);
  gl.bindRenderbuffer(gl.RENDERBUFFER, null);

  fb = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rb);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  addPointerListeners(document.getElementById('sphere'), glPStart, glPMove, glPEnd);
  requestAnimationFrame(draw);
}

function draw(time) {
  if(interaction.lastTime) {
    if(interaction.pick > 0) {
      model.state.rotAxis(interaction.pick, (time - interaction.lastTime) * 0.0003);
      model.changed = true;
    }
    model.state.evolve((time - interaction.lastTime) * 0.006);
  }
  interaction.lastTime = time;

  if(model.changed) {
    gl.disable(gl.DEPTH_TEST);
    gl.useProgram(progs.bkg.program);
    gl.enableVertexAttribArray(progs.bkg.aPos);
    gl.bindBuffer(gl.ARRAY_BUFFER, progs.bkg.bPos);
    gl.vertexAttribPointer(progs.bkg.aPos, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.disableVertexAttribArray(progs.bkg.aPos);

    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.DEPTH_BUFFER_BIT);
    gl.useProgram(progs.solid.program);
    gl.enableVertexAttribArray(progs.solid.aPos);
    gl.enableVertexAttribArray(progs.solid.aNormal);
    gl.bindBuffer(gl.ARRAY_BUFFER, progs.solid.axes.bAttrib);
    gl.vertexAttribPointer(progs.solid.aPos, 3, gl.FLOAT, false, 6*4, 0);
    gl.vertexAttribPointer(progs.solid.aNormal, 3, gl.FLOAT, false, 6*4, 3*4);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, progs.solid.axes.bIx);
    gl.uniform4fv(progs.solid.uQView, model.qView);
    for(let i = 0; i < 3; i++) {
      gl.uniform4fv(progs.solid.uQModel, progs.solid.axes.quats[i]);
      gl.uniform3fv(progs.solid.uColor, progs.solid.axes.colors[i]);
      gl.drawElements(gl.TRIANGLES, progs.solid.axes.length, gl.UNSIGNED_SHORT, 0);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, progs.solid.arrow.bAttrib);
    gl.vertexAttribPointer(progs.solid.aPos, 3, gl.FLOAT, false, 6*4, 0);
    gl.vertexAttribPointer(progs.solid.aNormal, 3, gl.FLOAT, false, 6*4, 3*4);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, progs.solid.arrow.bIx);
    gl.uniform4fv(progs.solid.uQModel, model.state.quat);
    gl.uniform3fv(progs.solid.uColor, progs.solid.arrow.color);
    gl.drawElements(gl.TRIANGLES, progs.solid.arrow.length, gl.UNSIGNED_SHORT, 0);
    gl.disableVertexAttribArray(progs.solid.aPos);
    gl.disableVertexAttribArray(progs.solid.aNormal);

    gl.useProgram(progs.line.program);
    gl.enableVertexAttribArray(progs.line.aFactor);
    gl.bindBuffer(gl.ARRAY_BUFFER, progs.line.bFactor);
    gl.vertexAttribPointer(progs.line.aFactor, 3, gl.FLOAT, false, 0, 0);
    gl.uniform3fv(progs.line.uPos, model.state.coords);
    gl.uniform3fv(progs.line.uColor, progs.solid.arrow.color);
    gl.uniform4fv(progs.line.uQView, model.qView);
    gl.drawArrays(gl.LINES, 0, 18);
    gl.disableVertexAttribArray(progs.line.aFactor);

    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ZERO, gl.ONE);
    gl.useProgram(progs.sphere.program);
    gl.enableVertexAttribArray(progs.sphere.aPos);
    gl.bindBuffer(gl.ARRAY_BUFFER, progs.sphere.bPos);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, progs.sphere.bIx);
    gl.vertexAttribPointer(progs.sphere.aPos, 3, gl.FLOAT, false, 0, 0);
    gl.uniform4fv(progs.sphere.uQView, model.qView);
    gl.drawElements(gl.TRIANGLES, progs.sphere.length, gl.UNSIGNED_SHORT, 0);
    gl.disableVertexAttribArray(progs.sphere.aPos);
    gl.disable(gl.BLEND);

    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(progs.flat.program);
    gl.enableVertexAttribArray(progs.flat.aPos);
    gl.bindBuffer(gl.ARRAY_BUFFER, progs.sphere.bPos);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, progs.sphere.bIx);
    gl.vertexAttribPointer(progs.flat.aPos, 3, gl.FLOAT, false, 0, 0);
    gl.vertexAttrib2f(progs.flat.aDelta, 0, 0);
    gl.uniform4fv(progs.flat.uQView, model.qView);
    gl.uniform3f(progs.flat.uColor, 0, 0, 0);
    gl.uniform4f(progs.flat.uQModel, 0, 0, 0, 1);
    gl.drawElements(gl.TRIANGLES, progs.sphere.length, gl.UNSIGNED_SHORT, 0);
    gl.disableVertexAttribArray(progs.flat.aPos);
    gl.enableVertexAttribArray(progs.flat.aDelta);
    gl.bindBuffer(gl.ARRAY_BUFFER, progs.flat.disk.bPos);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, progs.flat.disk.bIx);
    gl.vertexAttribPointer(progs.flat.aDelta, 2, gl.FLOAT, false, 0, 0);
    for(let i = 0; i < 3; i++) {
      gl.uniform4fv(progs.flat.uQModel, progs.solid.axes.quats[i]);
      gl.uniform3fv(progs.flat.uColor, progs.solid.axes.colorsSat[i]);
      gl.vertexAttrib3f(progs.flat.aPos, 0, 0, 1.3);
      gl.drawElements(gl.TRIANGLES, progs.flat.disk.length, gl.UNSIGNED_SHORT, 0);
      gl.vertexAttrib3f(progs.flat.aPos, 0, 0, -1.3);
      gl.drawElements(gl.TRIANGLES, progs.flat.disk.length, gl.UNSIGNED_SHORT, 0);
    }
    gl.uniform4fv(progs.flat.uQModel, model.state.quat);
    gl.uniform3fv(progs.flat.uColor, progs.solid.arrow.colorSat);
    gl.vertexAttrib3f(progs.flat.aPos, 0, 0, 1.2);
    gl.drawElements(gl.TRIANGLES, progs.flat.disk.length, gl.UNSIGNED_SHORT, 0);
    gl.disableVertexAttribArray(progs.flat.aDelta);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    over.refresh();
    model.changed = false;
  }

  c2d.fillStyle = '#ffffff10';
  c2d.globalCompositeOperation = 'lighter';
  c2d.fillRect(-1.5, -1.5, 3, 3);
  c2d.globalCompositeOperation = 'multiply';

  let prev = model.lastPsi;
  let psi = model.state.psi();
  if(prev) {
    c2d.strokeStyle = '#000000ff';
    c2d.beginPath();
    c2d.moveTo(prev[0][0], prev[1][0]);
    c2d.lineTo(psi[0][0], psi[1][0]);
    c2d.stroke();
  }
  model.lastPsi = psi;

  if(prev) {
    c2d.strokeStyle = '#ff0000ff';
    c2d.beginPath();
    c2d.moveTo(model.state.A, prev[1][0], 0.05, 0, 2*Math.PI);
    c2d.lineTo(model.state.A, psi[1][0], 0.05, 0, 2*Math.PI);
    c2d.moveTo(prev[0][0], model.state.B, 0.05, 0, 2*Math.PI);
    c2d.lineTo(psi[0][0], model.state.B, 0.05, 0, 2*Math.PI);
    c2d.stroke();
  }

  requestAnimationFrame(draw);
}

function glPStart(elm, x, y) {
  interaction.lastX = x;
  interaction.lastY = y;
  var color = new Uint8Array(4);
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.readPixels(x, gl.canvas.height - y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, color);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  if(color[0] == 255 && color[1] == 255)
    interaction.pick = -1;
  else if(color[2] == 255)
    interaction.pick = 1;
  else if(color[1] == 255)
    interaction.pick = 2;
  else if(color[0] == 255)
    interaction.pick = 3;
  else
    interaction.pick = 0;
}

function glPMove(elm, x, y) {
  if(interaction.pick > 0)
    // handled in draw()
    return;
  else if(interaction.pick < 0) {
    let glX = ((x / gl.canvas.width) * 2 - 1) * 1.5;
    let glY = ((1 - y / gl.canvas.height) * 2 - 1) * 1.5;
    let len = hypot(glX, glY);
    let dir;
    if(len > 1)
      dir = [glX / len, glY / len, 0];
    else
      dir = [glX, glY, Math.sqrt(1 - glX*glX - glY*glY)];
    dir = vrotq(dir, qconj(model.qView));
    model.state.rotateTowards(dir);
    model.changed = true;
  } else {
    let viewport = gl.getParameter(gl.VIEWPORT);
    model.tilt += (y - interaction.lastY) / viewport[3] * 4;
    if(model.tilt > Math.PI / 2)
      model.tilt = Math.PI / 2;
    else if(model.tilt < -Math.PI / 2)
      model.tilt = -Math.PI / 2;
    model.angle += (x - interaction.lastX) / viewport[2] * 4;
    updateQView();
    interaction.lastX = x;
    interaction.lastY = y;
    model.changed = true;
  }
}

function glPEnd() {
  interaction.pick = 0;
}

function moveSemiaxis(x, y) {
  var angle = Math.atan2(y, x);
  var oldCoords = model.state.coords;
  let a = hypot(x, y);
  let v = 2*a*a - 1;
  let sx = v * Math.cos(2*angle);
  let sy = v * Math.sin(2*angle);
  let sz = Math.sqrt(Math.max(1 - sx*sx - sy*sy, 0.01)) * sign(oldCoords[2]);
  model.state.rotateTowards([sx, sy, sz]);
  model.changed = true;
}

function updateQView() {
  model.qView = qmulq(
    [Math.sin((model.tilt - Math.PI/2)/2), 0, 0, Math.cos((model.tilt - Math.PI/2)/2)],
    [0, 0, Math.sin(model.angle/2), Math.cos(model.angle/2)]
  );
}

function State(x, y, z) {
  let quat = findRotation([0, 0, 1], vnormalize([x, y, z]));
  Object.defineProperty(this, 'quat', {
    get: function() { return quat; },
    set: function(q) { quat = q; updateParams(); }
  });

  let updateParams = function() {
    let s = this.coords = vrotq([0, 0, 1], this.quat);
    let th = Math.acos(s[0]) / 2;
    this.A = Math.cos(th);
    this.B = Math.sin(th);
    let v = hypot(s[0], s[1]);
    this.ellipse = {
      a: Math.sqrt((1+v)/2),
      b: Math.sqrt((1-v)/2),
      angle: Math.atan2(s[1], s[0]) / 2
    };
  }.bind(this);
  updateParams();

  this.rotAxis = function(axis, angle) {
    let q = [0, 0, 0, Math.cos(angle)];
    q[axis - 1] = Math.sin(angle);
    this.quat = qnormalize(qmulq(q, this.quat));
  }

  this.evolve = function(angle) {
    let q = [0, 0, Math.sin(angle), Math.cos(angle)];
    this.quat = qnormalize(qmulq(this.quat, q));
  }

  this.rotateTowards = function(dir) {
    this.quat = qnormalize(qmulq(findRotation(this.coords, vnormalize(dir)), this.quat));
  }

  this.psi = function() {
    // X,Y,Z → Y,Z,X
    let q = qmulq([1/2, 1/2, -1/2, 1/2], this.quat);
    return [
      [q[0], q[3]],
      [q[2], -q[1]]
    ];
  }
}
