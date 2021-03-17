'use strict';

var c2d, gl2d, c3d, gl3d, progs, model, interaction;
const SIZE = 4;
const numElements = SIZE * SIZE * SIZE * 2;

window.addEventListener('DOMContentLoaded', function() {
  c2d = document.getElementById('grid');
  c2d.width = c2d.clientWidth * window.devicePixelRatio;
  c2d.height = c2d.clientHeight * window.devicePixelRatio;
  gl2d = c2d.getContext('webgl') || c2d.getContext('experimental-webgl');

  c3d = document.getElementById('sphere');
  c3d.width = c3d.clientWidth * window.devicePixelRatio;
  c3d.height = c3d.clientHeight * window.devicePixelRatio;
  gl3d = c3d.getContext('webgl') || c3d.getContext('experimental-webgl');

  if(!gl2d || !gl3d) {
    alert('WebGL not supported');
    return;
  }

  gl2d.viewport(0, 0, gl2d.canvas.width, gl2d.canvas.height);
  gl2d.clearColor(1, 1, 1, 1);
  gl2d.enable(gl2d.BLEND);
  gl2d.blendFuncSeparate(gl2d.SRC_ALPHA, gl2d.ONE_MINUS_SRC_ALPHA, gl2d.ZERO, gl2d.ONE);

  {
    let over = new Overlay(document.getElementById('grid').parentNode,
      { xMin: -2.1, xMax: 2.1, yMin: -2.1, yMax: 2.1 });
    over.addControl(new CrossLabel(0, 0, '#48f', '0'));
    over.addControl(new CrossLabel(1, 0, '#48f', '1'));
    over.addControl(new CrossLabel(-1, 0, '#48f', '–1'));
    over.addControl(new CrossLabel(0, 1, '#48f', 'i'));
    over.addControl(new CrossLabel(0, -1, '#48f', '–i'));
  }

  gl3d.viewport(0, 0, gl3d.canvas.width, gl3d.canvas.height);
  gl3d.clearColor(1, 1, 1, 1);
  gl3d.enable(gl3d.BLEND);
  gl3d.blendFuncSeparate(gl3d.SRC_ALPHA, gl3d.ONE_MINUS_SRC_ALPHA, gl3d.ZERO, gl3d.ONE);

  model = {};
  interaction = {};

  {
    let alpha = 15 * Math.PI / 180; // angular radius of the sphere
    let beta = 50 * Math.PI / 180; // angle of eye to center
    let gamma = 40 * Math.PI / 180; // camera angle
    let phi = 10 * Math.PI / 180; // side view angle
    let cos1 = Math.cos(alpha), sin1 = Math.sin(alpha), tan1 = sin1 / cos1;
    let cos2 = Math.cos(beta), sin2 = Math.sin(beta);
    let cos3 = Math.cos(phi), sin3 = Math.sin(phi);
    let s = 1/Math.tan(gamma);
    // Center of view = halfway between centre and the touching point (0, 0, -1).
    let eyeDist = 1/tan1;
    let eyeZ = [cos2*sin3, cos2*cos3, -sin2];
    let eyeX = vnormalize(cross(eyeZ, [0, 0, 1]));
    let eyeY = cross(eyeX, eyeZ);
    let p = model.proj = [
      s*eyeX[0], s*eyeY[0], eyeZ[0], eyeZ[0],
      s*eyeX[1], s*eyeY[1], eyeZ[1], eyeZ[1],
      s*eyeX[2], s*eyeY[2], eyeZ[2], eyeZ[2],
      s*eyeX[2]/2, s*eyeY[2]/2, 0, eyeDist
    ];
    model.inv = [
      -p[9]*p[7] + p[13]*p[7] + p[5]*p[11] - p[5]*p[15],
      p[9]*p[3] - p[13]*p[3] - p[1]*p[11] + p[1]*p[15],
      0,
      p[5] * p[3] - p[1] * p[7],

      p[8]*p[7] - p[12]*p[7] - p[4]*p[11] + p[4]*p[15],
      -p[8]*p[3] + p[12]*p[3] + p[0]*p[11] - p[0]*p[15],
      0,
      -p[4] * p[3] + p[0] * p[7],

      0, 0, 0, 0,

      -p[8]*p[5] + p[12]*p[5] + p[4]*p[9] - p[4]*p[13],
      p[8]*p[1] - p[12]*p[1] - p[0]*p[9] + p[0]*p[13],
      0,
      p[4] * p[1] - p[0] * p[5]
    ];
  }

  model.mx = [1, 0, 0, 0, 0, 0, 1, 0];
  formatMatrix(model.mx);
  model.targetMx = null;

  const v2 = Math.sqrt(2);
  const presets = {
    i: [[1, 0], [0, 0], [0, 0], [1, 0]],
    sx: [[0, 0], [1, 0], [1, 0], [0, 0]],
    sy: [[0, 0], [0, -1], [0, 1], [0, 0]],
    sz: [[1, 0], [0, 0], [0, 0], [-1, 0]],
    h: [[1/v2, 0], [1/v2, 0], [1/v2, 0], [-1/v2, 0]],
    cayley: [[1, 0], [0, -1], [1, 0], [0, 1]],
    icayley: [[0, 1], [1, 0], [1, 0], [0, 1]],
    rot: [[1/v2, 0], [-1/v2, 0], [1/v2, 0], [1/v2, 0]],
    phase: [[1, 0], [0, 0], [0, 0], [0, 1]],
    skewX: [[1, 0], [1, 0], [0, 0], [1, 0]],
    skewY: [[1, 0], [0, 0], [1, 0], [1, 0]],
    sqAxes: [[v2, 0], [0, 0], [0, 0], [1/v2, 0]],
    sqDiag: [[v2, 0], [1, 0], [1, 0], [v2, 0]],
  };

  document.getElementById('presets').addEventListener('click', function(e) {
    e.preventDefault();
    let tgt = e.target;
    while(tgt && tgt.tagName !== 'A')
      tgt = tgt.parentNode;
    if(!tgt)
      return;
    let id = tgt.getAttribute('data-preset');
    if(!id)
      return;
    if(!model.targetMx)
      requestAnimationFrame(draw);
    let orig;
    switch(id) {
      case 'rndU':
        orig = rndUnitary();
        break;
      case 'rndR':
        orig = rndReal();
        break;
      case 'rndU2':
        orig = rndU11();
        break;
      default:
        orig = presets[id];
        break;
    }
    formatMatrix(Array.prototype.concat.apply([], orig));
    let det = cxsub(cxmul(orig[0], orig[3]), cxmul(orig[1], orig[2]));
    let norm = cxinv(cxsqrt(det));
    let tmx = []; // Don't overwrite presets
    for(let i = 0; i < 4; i++)
      tmx[i] = cxmul(orig[i], norm);
    model.targetMx = [].concat(tmx[0], tmx[1], tmx[2], tmx[3]);
  });

  loadFiles(filesReady);
});

function filesReady(files) {
  progs = {};

  progs.grid = new Program(gl2d, files['grid.vert'], files['grid.frag']);
  progs.grid.bPos = gl2d.createBuffer();
  gl2d.bindBuffer(gl2d.ARRAY_BUFFER, progs.grid.bPos);
  gl2d.bufferData(gl2d.ARRAY_BUFFER, new Float32Array([
    -1, -1,
    1, -1,
    -1, 1,
    1, 1,
    -1, 1,
    1, -1]), gl2d.STATIC_DRAW);

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
  progs.sphere = new Program(gl3d, files['sphere.vert'], files['sphere.frag']);
  progs.sphere.bPos = gl3d.createBuffer();
  gl3d.bindBuffer(gl3d.ARRAY_BUFFER, progs.sphere.bPos);
  gl3d.bufferData(gl3d.ARRAY_BUFFER, cx.coords(), gl3d.STATIC_DRAW);
  progs.sphere.bIx = gl3d.createBuffer();
  gl3d.bindBuffer(gl3d.ELEMENT_ARRAY_BUFFER, progs.sphere.bIx);
  gl3d.bufferData(gl3d.ELEMENT_ARRAY_BUFFER, cx.indices(), gl3d.STATIC_DRAW);
  progs.sphere.length = cx.length();

  progs.plane = new Program(gl3d, files['plane.vert'], files['plane.frag']);
  progs.plane.bPos = gl3d.createBuffer();
  gl3d.bindBuffer(gl3d.ARRAY_BUFFER, progs.plane.bPos);
  gl3d.bufferData(gl3d.ARRAY_BUFFER, new Float32Array([
    -1, -1,
    1, -1,
    -1, 1,
    1, 1,
    -1, 1,
    1, -1
  ]), gl3d.STATIC_DRAW);

  requestAnimationFrame(draw);
}

function draw(time) {
  if(model.targetMx) {
    const step = 0.01;
    const omx = model.mx;
    const tmx = model.targetMx;
    let dist = 0;
    for(let i = 0; i < 8; i++)
      dist += Math.pow(omx[i] - tmx[i], 2);
    dist = Math.sqrt(dist);
    if(dist < step) {
      model.mx = model.targetMx;
      model.targetMx = null;
    } else {
      for(let i = 0; i < 8; i++)
        omx[i] += step / dist * (tmx[i] - omx[i]);
      let prep = [[omx[0], omx[1]], [omx[2], omx[3]], [omx[4], omx[5]], [omx[6], omx[7]]];
      model.mx = [].concat(prep[0], prep[1], prep[2], prep[3]);
    }
  }

  /* n1, n2, n3, a for x=0, y=0, unit circle */
  let m = model.mx;
  let planes = [
    /* Re(δ^*α + γ^*β), Im(δ^*α + γ^*β), Re(β^*α - δ^*γ), Re(β^*α + δ^*γ) */
    m[0]*m[6] + m[1]*m[7] + m[2]*m[4] + m[3]*m[5],
    m[1]*m[6] - m[0]*m[7] + m[4]*m[3] - m[2]*m[5],
    m[0]*m[2] + m[1]*m[3] - m[4]*m[6] - m[5]*m[7],
    m[0]*m[2] + m[1]*m[3] + m[4]*m[6] + m[5]*m[7],
    /* Im(γ^*β - δ^*α), Re(δ^*α - γ^*β), Im(δ^*γ - β^*α), -Im(δ^*γ + β^*α) */
    m[4]*m[3] - m[2]*m[5] - m[6]*m[1] + m[0]*m[7],
    m[0]*m[6] + m[1]*m[7] - m[2]*m[4] - m[3]*m[5],
    m[6]*m[5] - m[4]*m[7] - m[2]*m[1] + m[0]*m[3],
    m[4]*m[7] - m[6]*m[5] + m[0]*m[3] - m[1]*m[2],
    /* Re(γ^*α - δ^*β), Im(γ^*α - δ^*β), (|α|^2-|β|^2-|γ|^2+|δ|^2)/2, (|α|^2-|β|^2+|γ|^2-|δ|^2)/2 */
    m[0]*m[4] + m[1]*m[5] - m[2]*m[6] - m[3]*m[7],
    m[4]*m[1] - m[0]*m[5] - m[6]*m[3] + m[2]*m[7],
    (m[0]*m[0] + m[1]*m[1] - m[2]*m[2] - m[3]*m[3] - m[4]*m[4] - m[5]*m[5] + m[6]*m[6] + m[7]*m[7])/2,
    (m[0]*m[0] + m[1]*m[1] - m[2]*m[2] - m[3]*m[3] + m[4]*m[4] + m[5]*m[5] - m[6]*m[6] - m[7]*m[7])/2
  ];
  for(let i = 0; i < 3; i++) {
    let norm = planes[4*i]*planes[4*i] + planes[4*i+1]*planes[4*i+1] + planes[4*i+2]*planes[4*i+2];
    norm = 1/Math.sqrt(norm);
    for(let j = 0; j < 4; j++)
      planes[4*i+j] *= norm;
  }

  gl2d.clear(gl2d.COLOR_BUFFER_BIT);
  gl2d.useProgram(progs.grid.program);
  gl2d.uniform2fv(progs.grid.uMatrix, model.mx);
  gl2d.enableVertexAttribArray(progs.grid.aPos);
  gl2d.bindBuffer(gl2d.ARRAY_BUFFER, progs.grid.bPos);
  gl2d.vertexAttribPointer(progs.grid.aPos, 2, gl2d.FLOAT, false, 0, 0);
  gl2d.drawArrays(gl2d.TRIANGLES, 0, 6);
  gl2d.disableVertexAttribArray(progs.grid.aPos);

  gl3d.clear(gl3d.COLOR_BUFFER_BIT);

  gl3d.disable(gl3d.CULL_FACE);
  gl3d.disable(gl3d.BLEND);
  gl3d.useProgram(progs.plane.program);
  gl3d.uniform2fv(progs.plane.uMatrix, model.mx);
  gl3d.uniformMatrix4fv(progs.plane.uMProj, false, model.proj);
  gl3d.uniformMatrix4fv(progs.plane.uMInv, false, model.inv);
  gl3d.uniform1f(progs.plane.uDx, 1.5 * window.devicePixelRatio / gl3d.canvas.width);
  gl3d.enableVertexAttribArray(progs.plane.aPos);
  gl3d.bindBuffer(gl3d.ARRAY_BUFFER, progs.plane.bPos);
  gl3d.vertexAttribPointer(progs.plane.aPos, 2, gl3d.FLOAT, false, 0, 0);
  gl3d.drawArrays(gl3d.TRIANGLES, 0, 6);
  gl3d.disableVertexAttribArray(progs.plane.aPos);

  gl3d.enable(gl3d.CULL_FACE);
  gl3d.enable(gl3d.BLEND);
  gl3d.useProgram(progs.sphere.program);
  gl3d.uniform2fv(progs.sphere.uMatrix, model.mx);
  gl3d.uniform4fv(progs.sphere.uPlanes, planes);
  gl3d.uniformMatrix4fv(progs.sphere.uMProj, false, model.proj);
  gl3d.enableVertexAttribArray(progs.sphere.aPos);
  gl3d.bindBuffer(gl3d.ARRAY_BUFFER, progs.sphere.bPos);
  gl3d.bindBuffer(gl3d.ELEMENT_ARRAY_BUFFER, progs.sphere.bIx);
  gl3d.vertexAttribPointer(progs.sphere.aPos, 3, gl3d.FLOAT, false, 0, 0);
  gl3d.cullFace(gl3d.FRONT);
  gl3d.drawElements(gl3d.TRIANGLES, progs.sphere.length, gl3d.UNSIGNED_SHORT, 0);
  gl3d.cullFace(gl3d.BACK);
  gl3d.drawElements(gl3d.TRIANGLES, progs.sphere.length, gl3d.UNSIGNED_SHORT, 0);
  gl3d.disableVertexAttribArray(progs.sphere.aPos);

  if(interaction.lastTime) {
    if(!pointerActive(c2d))
      model.angle += (time - interaction.lastTime) * model.speed;
    else
      model.speed = (model.angle - interaction.lastAngle) / (time - interaction.lastTime);
  }
  interaction.lastTime = time;
  interaction.lastAngle = model.angle;

  if(model.targetMx)
    requestAnimationFrame(draw);
}

function formatMatrix(mx) {
  function formatComplex(re, im) {
    let rs = Math.abs(re).toFixed(1);
    let is = Math.abs(im).toFixed(1);
    if(rs == 0)
      return is == 0 ? '0.0' : im > 0 ? is + 'i' : '–' + is + 'i';
    else {
      if(re < 0)
        rs = '–' + rs;
      if(is == 0)
        return rs;
      else
        is = im > 0 ? ' + ' + is : ' – ' + is;
      return rs + is + 'i';
    }
  }

  document.getElementById('m11').textContent = formatComplex(mx[0], mx[1]);
  document.getElementById('m12').textContent = formatComplex(mx[2], mx[3]);
  document.getElementById('m21').textContent = formatComplex(mx[4], mx[5]);
  document.getElementById('m22').textContent = formatComplex(mx[6], mx[7]);
}

function rndUnitary() {
  let a = 2*Math.random() - 1;
  let b = 2*Math.random() - 1;
  let c = 2*Math.random() - 1;
  let d = 2*Math.random() - 1;
  let norm = 1 / Math.sqrt(a*a + b*b + c*c + d*d);
  a *= norm;
  b *= norm;
  c *= norm;
  d *= norm;
  return [[a, b], [c, d], [-c, d], [a, -b]];
}

function rndReal() {
  let a, b, c, d;
  do {
    a = 2*Math.random() - 1;
    b = 2*Math.random() - 1;
    c = 2*Math.random() - 1;
    d = 2*Math.random() - 1;
  } while(a*d - b*c < 0.25);
  return [[a, 0], [b, 0], [c, 0], [d, 0]];
}

function rndU11() {
  let a, b, c, d;
  do {
    a = 2*Math.random() - 1;
    b = 2*Math.random() - 1;
    c = 2*Math.random() - 1;
    d = 2*Math.random() - 1;
  } while(a*a + b*b - c*c - d*d < 0.5);
  let norm = 1 / Math.sqrt(a*a + b*b - c*c - d*d);
  a *= norm;
  b *= norm;
  c *= norm;
  d *= norm;
  return [[a, b], [c, d], [c, -d], [a, -b]];
}
