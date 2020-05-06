'use strict';

var canvas, gl, progs, model, interaction;
const SIZE = 4;
const numElements = SIZE * SIZE * SIZE * 2;

window.addEventListener('DOMContentLoaded', function() {
  canvas = document.getElementById('canvas');
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

  if(!gl) {
    alert('WebGL not supported');
    return;
  }

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.enable(gl.CULL_FACE);

  initPoly();
  model = {
    tilt: 0.2,
    angle: 0,
    speed: .001
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

  progs.sphere = new Program(gl, files['sphere.vert'], files['sphere.frag']);
  progs.sphere.bPos = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, progs.sphere.bPos);
  gl.bufferData(gl.ARRAY_BUFFER, cx.coords(), gl.STATIC_DRAW);
  progs.sphere.bIx = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, progs.sphere.bIx);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cx.indices(), gl.STATIC_DRAW);
  progs.sphere.length = cx.length();

  const divArrow = 10;
  cx = new GraphicsComplex(divArrow * 3 + 2, 6, function(xy) {
    return Array.isArray(xy) ? (xy[0] % divArrow) * 3 + xy[1] : divArrow * 3 + xy;
  });
  const rIn = 0.025;
  const rOut = 0.05;
  const zStart = -1.6, zEnd = 1.6, zTip = 1.75;
  cx.put(0, [0, 0, zStart,  0, 0, -1]);
  cx.put(1, [0, 0, zTip,    0, 0, 0]);
  for(let x = 0; x < divArrow; x++) {
    let phi = 2*Math.PI * x / divArrow;
    let c = Math.cos(phi), s = Math.sin(phi);
    cx.put([x, 0], [rIn * c, rIn * s, zStart,  c, s, 0]);
    cx.put([x, 1], [rIn * c, rIn * s, zEnd,    c, s, 0]);
    cx.put([x, 2], [rOut * c, rOut * s, zEnd,  (zTip - 1) * c, (zTip - 1) * s, rOut]);
    cx.simplex([x, 0], [x+1, 0], [x, 1]);
    cx.simplex([x+1, 1], [x, 1], [x+1, 0]);
    cx.simplex([x, 1], [x+1, 1], [x, 2]);
    cx.simplex([x+1, 2], [x, 2], [x+1, 1]);
    cx.simplex([x+1, 0], [x, 0], 0);
    cx.simplex([x, 2], [x+1, 2], 1);
  }

  progs.arrow = new Program(gl, files['arrow.vert'], files['arrow.frag']);
  progs.arrow.bAttrib = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, progs.arrow.bAttrib);
  gl.bufferData(gl.ARRAY_BUFFER, cx.coords(), gl.STATIC_DRAW);
  progs.arrow.bIx = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, progs.arrow.bIx);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cx.indices(), gl.STATIC_DRAW);
  progs.arrow.length = cx.length();

  const v2 = 1/Math.sqrt(2);
  progs.arrow.quats = [];
  progs.arrow.quats[0] = new Float32Array([0, v2, 0, v2]);
  progs.arrow.quats[1] = new Float32Array([-v2, 0, 0, v2]);
  progs.arrow.quats[2] = new Float32Array([0, 0, 0, 1]);

  const c1 = 0.3, c2 = 0.8;
  progs.arrow.colors = [];
  progs.arrow.colors[0] = new Float32Array([c1, c1, c2]);
  progs.arrow.colors[1] = new Float32Array([c1, c2, c1]);
  progs.arrow.colors[2] = new Float32Array([c2, c1, c1]);

  makeSwitch('model', setModel, 0);
  makeSwitch('family', setFamily, 0);

  let funcListener = function(e) {
    newFunc(e.currentTarget.id);
    e.preventDefault();
  };

  addPointerListeners(canvas, rotStart, rotMove);
  document.getElementById('random').addEventListener('click', funcListener);
  document.getElementById('l+').addEventListener('click', funcListener);
  document.getElementById('l-').addEventListener('click', funcListener);
  document.getElementById('m+').addEventListener('click', funcListener);
  document.getElementById('m-').addEventListener('click', funcListener);

  requestAnimationFrame(draw);
}

function draw(time) {
  gl.disable(gl.DEPTH_TEST);
  gl.useProgram(progs.bkg.program);
  gl.enableVertexAttribArray(progs.bkg.aPos);
  gl.bindBuffer(gl.ARRAY_BUFFER, progs.bkg.bPos);
  gl.vertexAttribPointer(progs.bkg.aPos, 2, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  gl.disableVertexAttribArray(progs.bkg.aPos);

  if(interaction.lastTime) {
    if(!pointerActive(canvas))
      model.angle += (time - interaction.lastTime) * model.speed;
    else
      model.speed = (model.angle - interaction.lastAngle) / (time - interaction.lastTime);
  }
  interaction.lastTime = time;
  interaction.lastAngle = model.angle;
  const qView = qmulq(
    [Math.sin((model.tilt - Math.PI/2)/2), 0, 0, Math.cos((model.tilt - Math.PI/2)/2)],
    [0, 0, Math.sin(model.angle/2), Math.cos(model.angle/2)]
  );

  gl.enable(gl.DEPTH_TEST);
  gl.clear(gl.DEPTH_BUFFER_BIT);
  gl.useProgram(progs.sphere.program);
  gl.enableVertexAttribArray(progs.sphere.aPos);
  gl.bindBuffer(gl.ARRAY_BUFFER, progs.sphere.bPos);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, progs.sphere.bIx);
  gl.vertexAttribPointer(progs.sphere.aPos, 3, gl.FLOAT, false, 0, 0);
  gl.uniform4fv(progs.sphere.uQView, qView);
  gl.drawElements(gl.TRIANGLES, progs.sphere.length, gl.UNSIGNED_SHORT, 0);
  gl.disableVertexAttribArray(progs.sphere.aPos);

  gl.useProgram(progs.arrow.program);
  gl.enableVertexAttribArray(progs.arrow.aPos);
  gl.enableVertexAttribArray(progs.arrow.aNormal);
  gl.bindBuffer(gl.ARRAY_BUFFER, progs.arrow.bAttrib);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, progs.arrow.bIx);
  gl.vertexAttribPointer(progs.arrow.aPos, 3, gl.FLOAT, false, 6*4, 0);
  gl.vertexAttribPointer(progs.arrow.aNormal, 3, gl.FLOAT, false, 6*4, 3*4);
  gl.uniform4fv(progs.arrow.uQView, qView);
  for(let i = 0; i < 3; i++) {
    gl.uniform4fv(progs.arrow.uQModel, progs.arrow.quats[i]);
    gl.uniform3fv(progs.arrow.uColor, progs.arrow.colors[i]);
    gl.drawElements(gl.TRIANGLES, progs.arrow.length, gl.UNSIGNED_SHORT, 0);
  }
  gl.disableVertexAttribArray(progs.arrow.aPos);
  gl.disableVertexAttribArray(progs.arrow.aNormal);

  requestAnimationFrame(draw);
}

/***** Polynomials *****/

var poly_ylm = [];
var poly_ri = [];
var poly_cart = [];

function initPoly() {
  initPoly_ylm();
  initPoly_ri();
  initPoly_cart();
}

function initPoly_ylm() {
  var poly, poly_m;
  function re(x, y, z) {
    return 2*(z + SIZE*(y + SIZE*x));
  };
  function im(x, y, z) {
    return 1 + 2*(z + SIZE*(y + SIZE*x));
  };

  const v2 = Math.sqrt(2), v3 = Math.sqrt(3), v5 = Math.sqrt(5), v7 = Math.sqrt(7);

  poly_m = [];

  poly = new Float32Array(numElements);
  poly[re(0, 0, 0)] = 1 / v3;
  poly['f1'] = 'Y<sub>0,0</sub>(ϑ,ϕ)';
  poly['f2'] = '1';
  poly_m.push(poly);

  poly_ylm.push(poly_m);
  poly_m = [];

  poly = new Float32Array(numElements);
  poly[re(1, 0, 0)] = 1 / v2;
  poly[im(0, 1, 0)] = -1 / v2;
  poly['f1'] = 'Y<sub>1,-1</sub>(ϑ,ϕ)';
  poly['f2'] = 'x – iy';
  poly_m.push(poly);

  poly = new Float32Array(numElements);
  poly[re(0, 0, 1)] = 1;
  poly['f1'] = 'Y<sub>1,0</sub>(ϑ,ϕ)';
  poly['f2'] = 'z';
  poly_m.push(poly);

  poly = new Float32Array(numElements);
  poly[re(1, 0, 0)] = -1 / v2;
  poly[im(0, 1, 0)] = -1 / v2;
  poly['f1'] = 'Y<sub>1,1</sub>(ϑ,ϕ)';
  poly['f2'] = '–(x + iy)';
  poly_m.push(poly);

  poly_ylm.push(poly_m);
  poly_m = [];

  var cc = v5 / v2;
  poly = new Float32Array(numElements);
  poly[re(2, 0, 0)] = cc / 2;
  poly[im(1, 1, 0)] = -cc;
  poly[re(0, 2, 0)] = -cc / 2;
  poly['f1'] = 'Y<sub>2,-2</sub>(ϑ,ϕ)';
  poly['f2'] = '(x – iy)<sup>2</sup>';
  poly_m.push(poly);

  poly = new Float32Array(numElements);
  poly[re(1, 0, 1)] = cc;
  poly[im(0, 1, 1)] = -cc;
  poly['f1'] = 'Y<sub>2,-1</sub>(ϑ,ϕ)';
  poly['f2'] = '(x – iy) z';
  poly_m.push(poly);

  var cc2 = v5 / v3 / 2;
  poly = new Float32Array(numElements);
  poly[re(2, 0, 0)] = -cc2;
  poly[re(0, 2, 0)] = -cc2;
  poly[re(0, 0, 2)] = 2*cc2;
  poly['f1'] = 'Y<sub>2,0</sub>(ϑ,ϕ)';
  poly['f2'] = 'z<sup>2</sup> – 1/3';
  poly_m.push(poly);

  poly = new Float32Array(numElements);
  poly[re(1, 0, 1)] = -cc;
  poly[im(0, 1, 1)] = -cc;
  poly['f1'] = 'Y<sub>2,1</sub>(ϑ,ϕ)';
  poly['f2'] = '–(x + iy) z';
  poly_m.push(poly);

  poly = new Float32Array(numElements);
  poly[re(2, 0, 0)] = cc / 2;
  poly[im(1, 1, 0)] = cc;
  poly[re(0, 2, 0)] = -cc / 2;
  poly['f1'] = 'Y<sub>2,2</sub>(ϑ,ϕ)';
  poly['f2'] = '(x + iy)<sup>2</sup>';
  poly_m.push(poly);

  poly_ylm.push(poly_m);
  poly_m = [];

  cc = v5 * v7 / v3 / 4;
  poly = new Float32Array(numElements);
  poly[re(3, 0, 0)] = cc;
  poly[im(2, 1, 0)] = -3*cc;
  poly[re(1, 2, 0)] = -3*cc;
  poly[im(0, 3, 0)] = cc;
  poly['f1'] = 'Y<sub>3,-3</sub>(ϑ,ϕ)';
  poly['f2'] = '(x – iy)<sup>3</sup>';
  poly_m.push(poly);

  cc = v5 * v7 / v2 / 2;
  poly = new Float32Array(numElements);
  poly[re(2, 0, 1)] = cc;
  poly[im(1, 1, 1)] = -2*cc;
  poly[re(0, 2, 1)] = -cc;
  poly['f1'] = 'Y<sub>3,-2</sub>(ϑ,ϕ)';
  poly['f2'] = '(x – iy)<sup>2</sup> z';
  poly_m.push(poly);

  cc = v7 / 4;
  poly = new Float32Array(numElements);
  poly[re(3, 0, 0)] = -cc;
  poly[im(2, 1, 0)] = cc;
  poly[re(1, 2, 0)] = -cc;
  poly[im(0, 3, 0)] = cc;
  poly[re(1, 0, 2)] = 4*cc;
  poly[im(0, 1, 2)] = -4*cc;
  poly['f1'] = 'Y<sub>3,-1</sub>(ϑ,ϕ)';
  poly['f2'] = '(x – iy) (z<sup>2</sup> – 1/5)';
  poly_m.push(poly);

  cc = v7 / v3 / 2
  poly = new Float32Array(numElements);
  poly[re(0, 0, 3)] = 2*cc;
  poly[re(2, 0, 1)] = -3*cc;
  poly[re(0, 2, 1)] = -3*cc;
  poly['f1'] = 'Y<sub>3,0</sub>(ϑ,ϕ)';
  poly['f2'] = 'z (z<sup>2</sup> – 3/5)';
  poly_m.push(poly);

  cc = v7 / 4;
  poly = new Float32Array(numElements);
  poly[re(3, 0, 0)] = cc;
  poly[im(2, 1, 0)] = cc;
  poly[re(1, 2, 0)] = cc;
  poly[im(0, 3, 0)] = cc;
  poly[re(1, 0, 2)] = -4*cc;
  poly[im(0, 1, 2)] = -4*cc;
  poly['f1'] = 'Y<sub>3,1</sub>(ϑ,ϕ)';
  poly['f2'] = '–(x + iy) (z<sup>2</sup> – 1/5)';
  poly_m.push(poly);

  cc = v5 * v7 / v2 / 2;
  poly = new Float32Array(numElements);
  poly[re(2, 0, 1)] = cc;
  poly[im(1, 1, 1)] = 2*cc;
  poly[re(0, 2, 1)] = -cc;
  poly['f1'] = 'Y<sub>3,2</sub>(ϑ,ϕ)';
  poly['f2'] = '(x + iy)<sup>2</sup> z';
  poly_m.push(poly);

  cc = v5 * v7 / v3 / 4;
  poly = new Float32Array(numElements);
  poly[re(3, 0, 0)] = -cc;
  poly[im(2, 1, 0)] = -3*cc;
  poly[re(1, 2, 0)] = 3*cc;
  poly[im(0, 3, 0)] = cc;
  poly['f1'] = 'Y<sub>3,3</sub>(ϑ,ϕ)';
  poly['f2'] = '–(x + iy)<sup>3</sup>';
  poly_m.push(poly);

  poly_ylm.push(poly_m);
  poly_m = [];
}

function initPoly_ri() {
  const v2 = Math.sqrt(2);
  for(let l = 0; l < SIZE; l++) {
    let poly_m = [];
    let pow = 1;
    for(let m = 1; m <= l; m++) {
      pow = -pow;
      let poly = new Float32Array(numElements);
      for(let i = 0; i < numElements; i++)
        poly[i^1] = (poly_ylm[l][l+m][i] - pow * poly_ylm[l][l-m][i]) / v2;
      poly['f1'] = 'i (' + poly_ylm[l][l-m]['f1']
        + (pow === 1 ? ' – ' : ' + ')
        + poly_ylm[l][l+m]['f1'] + ')';
      poly_m.unshift(poly);
    }
    poly_m.push(poly_ylm[l][l]);
    pow = 1;
    for(let m = 1; m <= l; m++) {
      let poly = new Float32Array(numElements);
      pow = -pow;
      for(let i = 0; i < numElements; i++)
        poly[i] = (poly_ylm[l][l-m][i] + pow * poly_ylm[l][l+m][i]) / v2;
      poly['f1'] = poly_ylm[l][l-m]['f1']
        + (pow === 1 ? ' + ' : ' – ')
        + poly_ylm[l][l+m]['f1'];
      poly_m.push(poly);
    }
    poly_ri.push(poly_m);
  }
  // m = 0 cases already copied from poly_ylm
  poly_ri[1][0]['f2'] = 'y';
  poly_ri[1][2]['f2'] = 'x';
  poly_ri[2][0]['f2'] = 'x y';
  poly_ri[2][1]['f2'] = 'y z';
  poly_ri[2][3]['f2'] = 'x z';
  poly_ri[2][4]['f2'] = 'x<sup>2</sup> – y<sup>2</sup>';
  poly_ri[3][0]['f2'] = 'y (3 x<sup>2</sup> – y<sup>2</sup>)';
  poly_ri[3][1]['f2'] = 'x y z';
  poly_ri[3][2]['f2'] = 'y (z<sup>2</sup> – 1/5)';
  poly_ri[3][4]['f2'] = 'x (z<sup>2</sup> – 1/5)';
  poly_ri[3][5]['f2'] = '(x<sup>2</sup> – y<sup>2</sup>) z';
  poly_ri[3][6]['f2'] = 'x (x<sup>2</sup> – 3 y<sup>2</sup>)';
}

function initPoly_cart() {
  var poly, poly_m;
  function re(x, y, z) {
    return 2*(z + SIZE*(y + SIZE*x));
  };

  const v2 = Math.sqrt(2), v3 = Math.sqrt(3), v5 = Math.sqrt(5), v7 = Math.sqrt(7);

  poly_m = [];

  poly = new Float32Array(numElements);
  poly[re(0, 0, 0)] = 1 / v3;
  poly['f1'] = 'Y<sub>0,0</sub>(ϑ,ϕ)';
  poly['f2'] = '1';
  poly_m.push(poly);

  poly_cart.push(poly_m);
  poly_m = [];

  poly = new Float32Array(numElements);
  poly[re(1, 0, 0)] = 1;
  poly['f1'] = 'Y<sub>1,-1</sub>(ϑ,ϕ) – Y<sub>1,1</sub>(ϑ,ϕ)';
  poly['f2'] = 'x';
  poly_m.push(poly);

  poly = new Float32Array(numElements);
  poly[re(0, 1, 0)] = 1;
  poly['f1'] = 'i (Y<sub>1,-1</sub>(ϑ,ϕ) + Y<sub>1,1</sub>(ϑ,ϕ))';
  poly['f2'] = 'y';
  poly_m.push(poly);

  poly = new Float32Array(numElements);
  poly[re(0, 0, 1)] = 1;
  poly['f1'] = 'Y<sub>1,0</sub>(ϑ,ϕ)';
  poly['f2'] = 'z';
  poly_m.push(poly);

  poly_cart.push(poly_m);
  poly_m = [];

  var cc = v5 / v3 / 2;
  poly = new Float32Array(numElements);
  poly[re(2, 0, 0)] = 2*cc;
  poly[re(0, 2, 0)] = -cc;
  poly[re(0, 0, 2)] = -cc;
  poly['f1'] = '√3 Y<sub>2,-2</sub>(ϑ,ϕ) – √2 Y<sub>2,0</sub>(ϑ,ϕ) + √3 Y<sub>2,2</sub>(ϑ,ϕ)';
  poly['f2'] = 'x^2 – 1/3';
  poly_m.push(poly);

  poly = new Float32Array(numElements);
  poly[re(2, 0, 0)] = -cc;
  poly[re(0, 2, 0)] = 2*cc;
  poly[re(0, 0, 2)] = -cc;
  poly['f1'] = '–(√3 Y<sub>2,-2</sub>(ϑ,ϕ) + √2 Y<sub>2,0</sub>(ϑ,ϕ) + √3 Y<sub>2,2</sub>(ϑ,ϕ))';
  poly['f2'] = 'y^2 – 1/3';
  poly_m.push(poly);

  poly = new Float32Array(numElements);
  poly[re(2, 0, 0)] = -cc;
  poly[re(0, 2, 0)] = -cc;
  poly[re(0, 0, 2)] = 2*cc;
  poly['f1'] = 'Y<sub>2,0</sub>(ϑ,ϕ)';
  poly['f2'] = 'z^2 – 1/3';
  poly_m.push(poly);

  cc = v5;
  poly = new Float32Array(numElements);
  poly[re(1, 1, 0)] = cc;
  poly['f1'] = 'i (Y<sub>2,-2</sub>(ϑ,ϕ) – Y<sub>2,2</sub>(ϑ,ϕ))';
  poly['f2'] = 'x y';
  poly_m.push(poly);

  poly = new Float32Array(numElements);
  poly[re(1, 0, 1)] = cc;
  poly['f1'] = 'Y<sub>2,-1</sub>(ϑ,ϕ) – Y<sub>2,1</sub>(ϑ,ϕ)';
  poly['f2'] = 'x z';
  poly_m.push(poly);

  poly = new Float32Array(numElements);
  poly[re(0, 1, 1)] = cc;
  poly['f1'] = 'i (Y<sub>2,-1</sub>(ϑ,ϕ) + Y<sub>2,1</sub>(ϑ,ϕ))';
  poly['f2'] = 'y z';
  poly_m.push(poly);

  poly_cart.push(poly_m);
  poly_m = [];

  cc = v7 / v3 / 2;
  poly = new Float32Array(numElements);
  poly[re(3, 0, 0)] = 2*cc;
  poly[re(1, 2, 0)] = -3*cc;
  poly[re(1, 0, 2)] = -3*cc;
  poly['f1'] = '√5 Y<sub>3,-3</sub>(ϑ,ϕ) – √3 Y<sub>3,-1</sub>(ϑ,ϕ) + √3 Y<sub>3,1</sub>(ϑ,ϕ) – √5 Y<sub>3,3</sub>(ϑ,ϕ)';
  poly['f2'] = 'x (x^2 – 3/5)';
  poly_m.push(poly);

  poly = new Float32Array(numElements);
  poly[re(0, 3, 0)] = 2*cc;
  poly[re(2, 1, 0)] = -3*cc;
  poly[re(0, 1, 2)] = -3*cc;
  poly['f1'] = '–i (√5 Y<sub>3,-3</sub>(ϑ,ϕ) + √3 Y<sub>3,-1</sub>(ϑ,ϕ) + √3 Y<sub>3,1</sub>(ϑ,ϕ) + √5 Y<sub>3,3</sub>(ϑ,ϕ))';
  poly['f2'] = 'y (y^2 – 3/5)';
  poly_m.push(poly);

  poly = new Float32Array(numElements);
  poly[re(0, 0, 3)] = 2*cc;
  poly[re(2, 0, 1)] = -3*cc;
  poly[re(0, 2, 1)] = -3*cc;
  poly['f1'] = 'Y<sub>3,0</sub>(ϑ,ϕ)';
  poly['f2'] = 'z (z^2 – 3/5)';
  poly_m.push(poly);

  cc = v7 / v2 / 2;
  poly = new Float32Array(numElements);
  poly[re(1, 2, 0)] = 4*cc;
  poly[re(1, 0, 2)] = -cc;
  poly[re(3, 0, 0)] = -cc;
  poly['f1'] = '–√15 Y<sub>3,-3</sub>(ϑ,ϕ) – Y<sub>3,-1</sub>(ϑ,ϕ) + Y<sub>3,1</sub>(ϑ,ϕ) + √15 Y<sub>3,3</sub>(ϑ,ϕ)';
  poly['f2'] = 'x (y^2 – 1/5)';
  poly_m.push(poly);

  poly = new Float32Array(numElements);
  poly[re(1, 0, 2)] = 4*cc;
  poly[re(1, 2, 0)] = -cc;
  poly[re(3, 0, 0)] = -cc;
  poly['f1'] = 'Y<sub>3,-1</sub>(ϑ,ϕ) – Y<sub>3,1</sub>(ϑ,ϕ)';
  poly['f2'] = 'x (z^2 – 1/5)';
  poly_m.push(poly);

  poly = new Float32Array(numElements);
  poly[re(2, 1, 0)] = 4*cc;
  poly[re(0, 1, 2)] = -cc;
  poly[re(0, 3, 0)] = -cc;
  poly['f1'] = 'i (√15 Y<sub>3,-3</sub>(ϑ,ϕ) – Y<sub>3,-1</sub>(ϑ,ϕ) – Y<sub>3,1</sub>(ϑ,ϕ) + √15 Y<sub>3,3</sub>(ϑ,ϕ))';
  poly['f2'] = 'y (x^2 – 1/5)';
  poly_m.push(poly);

  poly = new Float32Array(numElements);
  poly[re(0, 1, 2)] = 4*cc;
  poly[re(2, 1, 0)] = -cc;
  poly[re(0, 3, 0)] = -cc;
  poly['f1'] = 'i (Y<sub>3,-1</sub>(ϑ,ϕ) + Y<sub>3,1</sub>(ϑ,ϕ))';
  poly['f2'] = 'y (z^2 – 1/5)';
  poly_m.push(poly);

  poly = new Float32Array(numElements);
  poly[re(2, 0, 1)] = 4*cc;
  poly[re(0, 2, 1)] = -cc;
  poly[re(0, 0, 3)] = -cc;
  poly['f1'] = '√5 Y<sub>3,-2</sub>(ϑ,ϕ) – √6 Y<sub>3,0</sub>(ϑ,ϕ) + √5 Y<sub>3,2</sub>(ϑ,ϕ)';
  poly['f2'] = 'z (x^2 – 1/5)';
  poly_m.push(poly);

  poly = new Float32Array(numElements);
  poly[re(0, 2, 1)] = 4*cc;
  poly[re(2, 0, 1)] = -cc;
  poly[re(0, 0, 3)] = -cc;
  poly['f1'] = '–(√5 Y<sub>3,-2</sub>(ϑ,ϕ) + √6 Y<sub>3,0</sub>(ϑ,ϕ) + √5 Y<sub>3,2</sub>(ϑ,ϕ))';
  poly['f2'] = 'z (y^2 – 1/5)';
  poly_m.push(poly);

  cc = v5 * v7;
  poly = new Float32Array(numElements);
  poly[re(1, 1, 1)] = cc;
  poly['f1'] = 'i (Y<sub>3,-2</sub>(ϑ,ϕ) – Y<sub>3,2</sub>(ϑ,ϕ))';
  poly['f2'] = 'x y z';
  poly_m.push(poly);

  poly_cart.push(poly_m);
  poly_m = [];
}

function initPoly_random(l) {
  const cnt = 2*(2*l+1);
  var amps = new Float32Array(cnt);
  var sum2 = 0;
  for(let i = 0; i < cnt; i++) {
    amps[i] = 2*Math.random() - 1;
    sum2 += amps[i]*amps[i];
  }
  var corr = 1/Math.sqrt(sum2);
  for(let i = 0; i < cnt; i++)
    amps[i] *= corr;

  var poly = new Float32Array(numElements);
  for(let m = 0; m < 2*l+1; m++)
    for(let k = 0; k < numElements; k++) {
      poly[k] += amps[2*m] * poly_ylm[l][m][k];
      poly[k^1] += (k&1?-1:1) * amps[2*m+1] * poly_ylm[l][m][k];
    }

  poly['f1'] = 'Σ<sub>m</sub> α<sub>' + l + ',m</sub> ' + 'Y<sub>' + l + ',m</sub>';
  poly['f2'] = [
    'const',
    'linear(x, y, z)',
    'quadratic(x, y, z)',
    'cubic(x, y, z)'
  ][l];
  return poly;
}

function newPoly(poly) {
  gl.useProgram(progs.sphere.program);
  gl.uniform2fv(progs.sphere.uPoly, poly);
  document.getElementById('formula-ylm').innerHTML = poly['f1'];
  document.getElementById('formula-cart').innerHTML = poly['f2'];
}

function getPoly_random() {
  var poly;
  switch(model.family) {
    case 'ylm':
    case 'ri': {
      let ix = Math.floor(SIZE * SIZE * Math.random());
      let l = model.l = Math.floor(Math.sqrt(ix));
      let m = model.m = ix - l*(l+1);
      return (model.family == 'ylm' ? poly_ylm : poly_ri)[l][l+m]; }
    case 'cart': {
      let ix = Math.floor(20 * Math.random());
      // This is an approximation of the appropriate cubic eq. solution
      // valid for l ≤ 5 (SIZE ≤ 6)
      let l = model.l = Math.floor(Math.pow(6*(ix+1), 1/3)-1);
      let m = model.m = ix - l*(l+1)*(l+2)/6;
      return poly_cart[l][m]; }
    default: {
      let l = model.l = Math.floor(SIZE * Math.random());
      return initPoly_random(l);
    }
  }
}

function getPoly_delta(dl, dm) {
  model.l += dl;
  model.m += dm;
  if(model.l < 0)
    model.l = 0;
  else if(model.l >= SIZE)
    model.l = SIZE - 1;
  var poly;
  switch(model.family) {
    case 'ylm':
    case 'ri': {
      let l = model.l;
      if(model.m > model.l)
        model.m = model.l;
      else if(model.m < -model.l)
        model.m = -model.l;
      let m = model.m;
      return (model.family == 'ylm' ? poly_ylm : poly_ri)[l][l+m]; }
    case 'cart': {
      let l = model.l;
      if(model.m < 0)
        model.m = 0;
      else if(model.m >= (l+1)*(l+2)/2)
        model.m = (l+1)*(l+2)/2 - 1;
      let m = model.m;
      return poly_cart[l][m]; }
    default:
      return initPoly_random(model.l);
  }
}

function disable(id) {
  document.getElementById(id).classList.add('disabled');
}

function enable(id) {
  document.getElementById(id).classList.remove('disabled');
}

function setEnabled(id, b) {
  (b ? enable : disable)(id);
}

function updateControls() {
  let l = model.l, m = model.m;
  setEnabled('l-', l > 0);
  setEnabled('l+', l < SIZE - 1);
  switch(model.family) {
    case 'ylm':
    case 'ri':
      setEnabled('m-', m > -l);
      setEnabled('m+', m < l);
      break;
    case 'cart':
      setEnabled('m-', m > 0);
      setEnabled('m+', m < (l+1)*(l+2)-1);
      break;
    default:
      enable('m+');
      enable('m-');
  }
}

function newFunc(type) {
  var poly;
  switch(type) {
    case 'm+':
      poly = getPoly_delta(0, 1);
      break;
    case 'm-':
      poly = getPoly_delta(0, -1);
      break;
    case 'l+':
      poly = getPoly_delta(1, 0);
      break;
    case 'l-':
      poly = getPoly_delta(-1, 0);
      break;
    default:
      poly = getPoly_random();
      break;
  }
  newPoly(poly);
  updateControls();
}

function setModel(elm) {
  gl.useProgram(progs.sphere.program);
  gl.uniform1i(progs.sphere.uModel, elm.getAttribute('data-model'));
}

function setFamily(elm) {
  model.family = elm.getAttribute('data-family');
  newFunc();
}

function rotStart(elm, x, y) {
  interaction.lastX = x;
  interaction.lastY = y;
}

function rotMove(elm, x, y) {
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
