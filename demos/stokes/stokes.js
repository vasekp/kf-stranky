'use strict';

var gl, progs, fb, texture, model, interaction;
const divX = 100, divY = 50;
const divArrow = 10;
const divDisk = 6;

window.addEventListener('DOMContentLoaded', function() {
  var canvas = document.getElementById('sphere');
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  gl = canvas.getContext('webgl');

  if(!gl) {
    alert('WebGL not supported');
    return;
  }

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.enable(gl.CULL_FACE);

  model = {
    tilt: 0.2,
    angle: -.5,
    theta: 1,
    phi: 1,
    state: new State(2, -.5, 1.3)
  };
  interaction = {};

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

  var strideX = 3;
  var strideY = strideX * divX;
  var points = new Float32Array(strideY * (divY + 1));
  for(let y = 0; y <= divY; y++) {
    let theta = Math.PI * y / divY + 0.001;
    for(let x = 0; x < divX; x++) {
      let phi = 2*Math.PI * x / divX + 0.001;
      let base = x * strideX + y * strideY;
      points[base + 0] = Math.sin(theta) * Math.cos(phi);
      points[base + 1] = Math.sin(theta) * Math.sin(phi);
      points[base + 2] = Math.cos(theta);
    }
  }
  progs.sphere.bPos = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, progs.sphere.bPos);
  gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);

  var index = function(x, y) {
    return (x % divX) + y * divX;
  };

  strideX = 6;
  strideY = strideX * divX;
  var indices = new Uint16Array(strideY * divY);
  for(let y = 0; y < divY; y++) {
    for(let x = 0; x < divX; x++) {
      let base = x * strideX + y * strideY;
      indices[base + 0] = index(x+1, y);
      indices[base + 1] = index(x, y);
      indices[base + 2] = index(x, y+1);
      indices[base + 3] = index(x, y+1);
      indices[base + 4] = index(x+1, y+1);
      indices[base + 5] = index(x+1, y);
    }
  }
  progs.sphere.bIx = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, progs.sphere.bIx);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  progs.solid = new Program(gl, files['solid.vert'], files['solid.frag']);

  index = function(x, y) {
    return (x % divArrow) * 2 + y;
  };
  var coords = new Float32Array(divArrow * 2 * 3 + 2 * 3); // 2 vec3s/div + 2 extra
  var normals = new Float32Array(divArrow * 2 * 3 + 2 * 3);
  const rAxis = 0.025;
  const zStart = -1.4, zEnd = 1.4;
  for(let x = 0; x < divX; x++) {
    let phi = 2*Math.PI * x / divArrow;
    let c = Math.cos(phi), s = Math.sin(phi);
    let base = 3 * index(x, 0);
    coords[base + 0] = rAxis * c;
    coords[base + 1] = rAxis * s;
    coords[base + 2] = zStart;

    coords[base + 3] = rAxis * c;
    coords[base + 4] = rAxis * s;
    coords[base + 5] = zEnd;

    normals[base + 0] = normals[base + 3] = c;
    normals[base + 1] = normals[base + 4] = s;
    normals[base + 2] = normals[base + 5] = 0;
  }
  var ixStart = 2 * divArrow;
  {
    let base = 3 * ixStart;
    coords[base + 0] = 0;
    coords[base + 1] = 0;
    coords[base + 2] = zStart;

    normals[base + 0] = 0;
    normals[base + 1] = 0;
    normals[base + 2] = -1;
  }
  var ixEnd = 2 * divArrow + 1;
  {
    let base = 3 * ixEnd;
    coords[base + 0] = 0;
    coords[base + 1] = 0;
    coords[base + 2] = zEnd;

    normals[base + 0] = 0;
    normals[base + 1] = 0;
    normals[base + 2] = 1;
  }
  indices = new Uint16Array(divArrow * 4 * 3); // 4 triangles/div
  for(let x = 0; x < divArrow; x++) {
    let base = x * 4 * 3;
    indices[base + 0] = index(x, 0);
    indices[base + 1] = index(x+1, 0);
    indices[base + 2] = index(x, 1);

    indices[base + 3] = index(x+1, 1);
    indices[base + 4] = index(x, 1);
    indices[base + 5] = index(x+1, 0);

    indices[base + 6] = index(x, 1);
    indices[base + 7] = index(x+1, 1);
    indices[base + 8] = ixEnd;

    indices[base + 9] = index(x+1, 0);
    indices[base + 10] = index(x, 0);
    indices[base + 11] = ixStart;
  }

  progs.solid.axes = {};

  progs.solid.axes.bCoords = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, progs.solid.axes.bCoords);
  gl.bufferData(gl.ARRAY_BUFFER, coords, gl.STATIC_DRAW);

  progs.solid.axes.bNormals = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, progs.solid.axes.bNormals);
  gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);

  progs.solid.axes.bIx = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, progs.solid.axes.bIx);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

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

  index = function(x, y) {
    return (x % divArrow) * 3 + y;
  };
  coords = new Float32Array(divArrow * 3 * 3 + 2 * 3); // 3 vec3s/div + 2 extra
  normals = new Float32Array(divArrow * 3 * 3 + 2 * 3);
  const rIn = 0.03;
  const rOut = 0.06;
  const zTip = 1.2;
  for(let x = 0; x < divArrow; x++) {
    let phi = 2*Math.PI * x / divArrow;
    let c = Math.cos(phi), s = Math.sin(phi);
    let base = 3 * index(x, 0);
    coords[base + 0] = rIn * c;
    coords[base + 1] = rIn * s;
    coords[base + 2] = 0;

    coords[base + 3] = rIn * c;
    coords[base + 4] = rIn * s;
    coords[base + 5] = 1;

    coords[base + 6] = rOut * c;
    coords[base + 7] = rOut * s;
    coords[base + 8] = 1;

    normals[base + 0] = normals[base + 3] = c;
    normals[base + 1] = normals[base + 4] = s;
    normals[base + 2] = normals[base + 5] = 0;

    normals[base + 6] = (zTip - 1) * c;
    normals[base + 7] = (zTip - 1) * s;
    normals[base + 8] = rOut;
  }
  ixStart = 3 * divArrow;
  {
    let base = 3 * ixStart;
    coords[base + 0] = 0;
    coords[base + 1] = 0;
    coords[base + 2] = 0;

    normals[base + 0] = 0;
    normals[base + 1] = 0;
    normals[base + 2] = -1;
  }
  ixEnd = 3 * divArrow + 1;
  {
    let base = 3 * ixEnd;
    coords[base + 0] = 0;
    coords[base + 1] = 0;
    coords[base + 2] = zTip;

    normals[base + 0] = 0;
    normals[base + 1] = 0;
    normals[base + 2] = 0;
  }
  indices = new Uint16Array(divArrow * 5 * 3); // 5 triangles/div
  for(let x = 0; x < divArrow; x++) {
    let base = x * 5 * 3;
    indices[base + 0] = index(x, 0);
    indices[base + 1] = index(x+1, 0);
    indices[base + 2] = index(x, 1);

    indices[base + 3] = index(x+1, 1);
    indices[base + 4] = index(x, 1);
    indices[base + 5] = index(x+1, 0);

    indices[base + 6] = index(x, 1);
    indices[base + 7] = index(x+1, 1);
    indices[base + 8] = index(x, 2);

    indices[base + 9] = index(x+1, 2);
    indices[base + 10] = index(x, 2);
    indices[base + 11] = index(x+1, 1);

    indices[base + 12] = index(x, 2);
    indices[base + 13] = index(x+1, 2);
    indices[base + 14] = ixEnd;
  }

  progs.solid.arrow = {};

  progs.solid.arrow.bCoords = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, progs.solid.arrow.bCoords);
  gl.bufferData(gl.ARRAY_BUFFER, coords, gl.STATIC_DRAW);

  progs.solid.arrow.bNormals = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, progs.solid.arrow.bNormals);
  gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);

  progs.solid.arrow.bIx = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, progs.solid.arrow.bIx);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  progs.solid.arrow.color = new Float32Array([c2, c2, c1]);

  progs.flat = new Program(gl, files['flat.vert'], files['flat.frag']);

  progs.flat.disk = {};
  var stride = 2;
  points = new Float32Array(stride * (divDisk + 1));
  const patchSize = 0.2;
  for(let x = 0; x < divDisk; x++) {
    let phi = 2*Math.PI * x / divDisk + 0.001;
    let base = x * stride;
    points[base + 0] = patchSize * Math.cos(phi);
    points[base + 1] = patchSize * Math.sin(phi);
  }
  {
    let base = divDisk * stride;
    points[base + 0] = 0;
    points[base + 1] = 0;
  }
  progs.flat.disk.bPos = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, progs.flat.disk.bPos);
  gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);

  stride = 3;
  indices = new Uint16Array(stride * divDisk);
  for(let x = 0; x < divDisk; x++) {
    let base = x * stride;
    indices[base + 0] = x;
    indices[base + 1] = (x + 1) % divDisk;
    indices[base + 2] = divDisk;
  }
  progs.flat.disk.bIx = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, progs.flat.disk.bIx);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

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

  var canvas = document.getElementById('sphere');
  addPointerListeners(canvas, rotStart, rotMove);
  requestAnimationFrame(draw);
}

function mulq(q1, q2) {
  return [
    q1[3]*q2[0] + q2[3]*q1[0] + q1[1]*q2[2] - q1[2]*q2[1],
    q1[3]*q2[1] + q2[3]*q1[1] + q1[2]*q2[0] - q1[0]*q2[2],
    q1[3]*q2[2] + q2[3]*q1[2] + q1[0]*q2[1] - q1[1]*q2[0],
    q1[3]*q2[3] - q1[0]*q2[0] - q1[1]*q2[1] - q1[2]*q2[2]
  ];
}

function rotate(v, q) {
  var t = [
    q[3]*v[0] + q[1]*v[2] - q[2]*v[1],
    q[3]*v[1] + q[2]*v[0] - q[0]*v[2],
    q[3]*v[2] + q[0]*v[1] - q[1]*v[0]
  ];
  return [
    v[0] + 2*(q[1]*t[2] - q[2]*t[1]),
    v[1] + 2*(q[2]*t[0] - q[0]*t[2]),
    v[2] + 2*(q[0]*t[1] - q[1]*t[0]),
  ];
}

function draw(time) {
  gl.disable(gl.DEPTH_TEST);
  gl.useProgram(progs.bkg.program);
  gl.enableVertexAttribArray(progs.bkg.aPos);
  gl.bindBuffer(gl.ARRAY_BUFFER, progs.bkg.bPos);
  gl.vertexAttribPointer(progs.bkg.aPos, 2, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  gl.disableVertexAttribArray(progs.bkg.aPos);

  const qView = mulq(
    [Math.sin((model.tilt - Math.PI/2)/2), 0, 0, Math.cos((model.tilt - Math.PI/2)/2)],
    [0, 0, Math.sin(model.angle/2), Math.cos(model.angle/2)]
  );

  gl.enable(gl.DEPTH_TEST);
  gl.clear(gl.DEPTH_BUFFER_BIT);
  gl.useProgram(progs.solid.program);
  gl.enableVertexAttribArray(progs.solid.aPos);
  gl.enableVertexAttribArray(progs.solid.aNormal);
  gl.bindBuffer(gl.ARRAY_BUFFER, progs.solid.axes.bCoords);
  gl.vertexAttribPointer(progs.solid.aPos, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, progs.solid.axes.bNormals);
  gl.vertexAttribPointer(progs.solid.aNormal, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, progs.solid.axes.bIx);
  gl.uniform4fv(progs.solid.uQView, qView);
  for(let i = 0; i < 3; i++) {
    gl.uniform4fv(progs.solid.uQModel, progs.solid.axes.quats[i]);
    gl.uniform3fv(progs.solid.uColor, progs.solid.axes.colors[i]);
    gl.drawElements(gl.TRIANGLES, divArrow * 12, gl.UNSIGNED_SHORT, 0);
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, progs.solid.arrow.bCoords);
  gl.vertexAttribPointer(progs.solid.aPos, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, progs.solid.arrow.bNormals);
  gl.vertexAttribPointer(progs.solid.aNormal, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, progs.solid.arrow.bIx);
  gl.uniform4fv(progs.solid.uQModel, model.state.quat);
  gl.uniform3fv(progs.solid.uColor, progs.solid.arrow.color);
  gl.drawElements(gl.TRIANGLES, divArrow * 15, gl.UNSIGNED_SHORT, 0);
  gl.disableVertexAttribArray(progs.solid.aPos);
  gl.disableVertexAttribArray(progs.solid.aNormal);

  gl.enable(gl.BLEND);
  gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ZERO, gl.ONE);
  gl.useProgram(progs.sphere.program);
  gl.enableVertexAttribArray(progs.sphere.aPos);
  gl.bindBuffer(gl.ARRAY_BUFFER, progs.sphere.bPos);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, progs.sphere.bIx);
  gl.vertexAttribPointer(progs.sphere.aPos, 3, gl.FLOAT, false, 0, 0);
  gl.uniform4fv(progs.sphere.uQView, qView);
  gl.drawElements(gl.TRIANGLES, divX * divY * 6, gl.UNSIGNED_SHORT, 0);
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
  gl.uniform4fv(progs.flat.uQView, qView);
  gl.uniform3f(progs.flat.uColor, 0, 0, 0);
  gl.uniform4f(progs.flat.uQModel, 0, 0, 0, 1);
  gl.drawElements(gl.TRIANGLES, divX * divY * 6, gl.UNSIGNED_SHORT, 0);
  gl.disableVertexAttribArray(progs.flat.aPos);
  gl.enableVertexAttribArray(progs.flat.aDelta);
  gl.bindBuffer(gl.ARRAY_BUFFER, progs.flat.disk.bPos);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, progs.flat.disk.bIx);
  gl.vertexAttribPointer(progs.flat.aDelta, 2, gl.FLOAT, false, 0, 0);
  for(let i = 0; i < 3; i++) {
    gl.uniform4fv(progs.flat.uQModel, progs.solid.axes.quats[i]);
    gl.uniform3fv(progs.flat.uColor, progs.solid.axes.colorsSat[i]);
    gl.vertexAttrib3f(progs.flat.aPos, 0, 0, 1.3);
    gl.drawElements(gl.TRIANGLES, divDisk * 3, gl.UNSIGNED_SHORT, 0);
    gl.vertexAttrib3f(progs.flat.aPos, 0, 0, -1.3);
    gl.drawElements(gl.TRIANGLES, divDisk * 3, gl.UNSIGNED_SHORT, 0);
  }
  gl.disableVertexAttribArray(progs.flat.aDelta);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  var canvas = document.getElementById('vector');

  requestAnimationFrame(draw);
}

function rotStart(elm, x, y) {
  interaction.lastX = x;
  interaction.lastY = y;
  var color = new Uint8Array(4);
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.readPixels(x, gl.canvas.height - y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, color);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  if(color[2] == 255)
    interaction.face = 1;
  else if(color[1] == 255)
    interaction.face = 2;
  else if(color[0] == 255)
    interaction.face = 3;
  else
    interaction.face = 0;
  console.log(interaction.face);
}

function rotMove(elm, x, y) {
  if(interaction.face != 0)
    return;
  var viewport = gl.getParameter(gl.VIEWPORT);
  model.tilt += (y - interaction.lastY) / viewport[3] * 4;
  if(model.tilt > Math.PI / 2)
    model.tilt = Math.PI / 2;
  else if(model.tilt < -Math.PI / 2)
    model.tilt = -Math.PI / 2;
  model.angle += (x - interaction.lastX) / viewport[2] * 4;
  interaction.lastX = x;
  interaction.lastY = y;
}

function State(x, y, z) {
  var len = Math.sqrt(x*x + y*y + z*z);
  var cross = [-y / len, x / len, 0];
  var dot = z / len;
  if(dot == -1)
    this.quat = [1, 0, 0, 0];
  else {
    let qLen = Math.sqrt(2 + 2*dot);
    this.quat = [cross[0] / qLen, cross[1] / qLen, cross[2] / qLen, (1 + dot) / qLen];
  }

  this.coords = function() {
    return rotate([0, 0, 1], this.quat);
  }

  this.rotX = function(a) {
    this.quat = mulq(this.quat, [sin(a), 0, 0, cos(a)]);
  }

  this.rotY = function(a) {
    this.quat = mulq(this.quat, [0, sin(a), 0, cos(a)]);
  }

  this.rotZ = function(a) {
    this.quat = mulq(this.quat, [0, 0, sin(a), cos(a)]);
  }
}
