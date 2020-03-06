var canvas, gl, progs, iface;
const divX = 100, divY = 50;
const divArrow = 10;
const SIZE = 4;
const numElements = SIZE * SIZE * SIZE * 2;

function start(files) {
  var vs, fs;

  progs.bkg = createProgram(gl, files['background.vert'], files['background.frag']);

  progs.bkg.bPos = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, progs.bkg.bPos);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1,
    1, -1,
    -1, 1,
    1, 1,
    -1, 1,
    1, -1]), gl.STATIC_DRAW);

  progs.sphere = createProgram(gl, files['sphere.vert'], files['sphere.frag']);

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

  progs.arrow = createProgram(gl, files['arrow.vert'], files['arrow.frag']);

  strideX = 3 * 3 * 2;
  var attribs = new Float32Array(strideX * divArrow + 2 * 3 * 2);
  const rIn = 0.025;
  const rOut = 0.05;
  const zStart = -1.6, zEnd = 1.6, zTip = 1.75;
  for(let x = 0; x < divX; x++) {
    let phi = 2*Math.PI * x / divArrow;
    let base = x * strideX;
    let c = Math.cos(phi), s = Math.sin(phi);
    /* trunk - position */
    attribs[base + 0] = attribs[base + 6] = rIn * c;
    attribs[base + 1] = attribs[base + 7] = rIn * s;
    attribs[base + 2] = zStart;
    attribs[base + 8] = zEnd;
    /* trunk - normal */
    attribs[base + 3] = attribs[base + 9] = c;
    attribs[base + 4] = attribs[base + 10] = s;
    attribs[base + 5] = attribs[base + 11] = 0;
    /* tip - position */
    attribs[base + 12] = rOut * c;
    attribs[base + 13] = rOut * s;
    attribs[base + 14] = zEnd;
    /* tip - normal */
    attribs[base + 15] = (zTip - zEnd) * c;
    attribs[base + 16] = (zTip - zEnd) * s;
    attribs[base + 17] = rOut;
  }
  const ixStart = 3 * divArrow;
  attribs[6*ixStart + 0] = 0;
  attribs[6*ixStart + 1] = 0;
  attribs[6*ixStart + 2] = zStart;
  attribs[6*ixStart + 3] = 0;
  attribs[6*ixStart + 4] = 0;
  attribs[6*ixStart + 5] = -1;
  const ixTip = 3 * divArrow + 1;
  attribs[6*ixTip + 0] = 0;
  attribs[6*ixTip + 1] = 0;
  attribs[6*ixTip + 2] = zTip;
  attribs[6*ixTip + 3] = 0;
  attribs[6*ixTip + 4] = 0;
  attribs[6*ixTip + 5] = 0;
  progs.arrow.bAttribs = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, progs.arrow.bAttribs);
  gl.bufferData(gl.ARRAY_BUFFER, attribs, gl.STATIC_DRAW);

  index = function(x, y) {
    return (x % divArrow) * 3 + y;
  };

  strideX = 18;
  indices = new Uint16Array(strideX * divArrow);
  for(let x = 0; x < divArrow; x++) {
    let base = x * strideX;
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
    indices[base + 14] = ixTip;
    indices[base + 15] = index(x+1, 0);
    indices[base + 16] = index(x, 0);
    indices[base + 17] = ixStart;
  }
  progs.arrow.bIx = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, progs.arrow.bIx);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

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

  requestAnimationFrame(draw);
}

function mulq(q1, q2) {
  return [
    q1[3]*q2[0] + q2[3]*q1[0] + q1[1]*q2[2] - q1[2]*q2[1],
    q1[3]*q2[1] + q2[3]*q1[1] + q1[2]*q2[0] - q1[0]*q2[2],
    q1[3]*q2[2] + q2[3]*q1[2] + q1[0]*q2[1] - q1[1]*q2[0],
    q1[3]*q2[3] - q1[0]*q2[0] - q1[1]*q2[1] - q1[2]*q2[2]];
}

function draw(time) {
  gl.disable(gl.DEPTH_TEST);
  gl.useProgram(progs.bkg.program);
  gl.enableVertexAttribArray(progs.bkg.aPos);
  gl.bindBuffer(gl.ARRAY_BUFFER, progs.bkg.bPos);
  gl.vertexAttribPointer(progs.bkg.aPos, 2, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  gl.disableVertexAttribArray(progs.bkg.aPos);

  if(iface.lastTime) {
    if(!pointerActive(canvas))
      iface.angle += (time - iface.lastTime) * iface.speed;
    else
      iface.speed = (iface.angle - iface.lastAngle) / (time - iface.lastTime);
  }
  iface.lastTime = time;
  iface.lastAngle = iface.angle;
  const qView = mulq(
    [Math.sin((iface.tilt - Math.PI/2)/2), 0, 0, Math.cos((iface.tilt - Math.PI/2)/2)],
    [0, 0, Math.sin(iface.angle/2), Math.cos(iface.angle/2)]
  );

  gl.enable(gl.DEPTH_TEST);
  gl.clear(gl.DEPTH_BUFFER_BIT);
  gl.useProgram(progs.sphere.program);
  gl.enableVertexAttribArray(progs.sphere.aPos);
  gl.bindBuffer(gl.ARRAY_BUFFER, progs.sphere.bPos);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, progs.sphere.bIx);
  gl.vertexAttribPointer(progs.sphere.aPos, 3, gl.FLOAT, false, 0, 0);
  gl.uniform4fv(progs.sphere.uQView, qView);
  gl.drawElements(gl.TRIANGLES, divX * divY * 6, gl.UNSIGNED_SHORT, 0);
  gl.disableVertexAttribArray(progs.sphere.aPos);

  gl.useProgram(progs.arrow.program);
  gl.enableVertexAttribArray(progs.arrow.aPos);
  gl.enableVertexAttribArray(progs.arrow.aNormal);
  gl.bindBuffer(gl.ARRAY_BUFFER, progs.arrow.bAttribs);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, progs.arrow.bIx);
  gl.vertexAttribPointer(progs.arrow.aPos, 3, gl.FLOAT, false, 6*4, 0);
  gl.vertexAttribPointer(progs.arrow.aNormal, 3, gl.FLOAT, false, 6*4, 3*4);
  gl.uniform4fv(progs.arrow.uQView, qView);
  for(let i = 0; i < 3; i++) {
    gl.uniform4fv(progs.arrow.uQModel, progs.arrow.quats[i]);
    gl.uniform3fv(progs.arrow.uColor, progs.arrow.colors[i]);
    gl.drawElements(gl.TRIANGLES, divArrow * 18, gl.UNSIGNED_SHORT, 0);
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
  switch(iface.family) {
    case 'ylm':
    case 'ri': {
      let ix = Math.floor(SIZE * SIZE * Math.random());
      let l = iface.l = Math.floor(Math.sqrt(ix));
      let m = iface.m = ix - l*(l+1);
      return (iface.family == 'ylm' ? poly_ylm : poly_ri)[l][l+m]; }
    case 'cart': {
      let ix = Math.floor(20 * Math.random());
      // This is an approximation of the appropriate cubic eq. solution
      // valid for l ≤ 5 (SIZE ≤ 6)
      let l = iface.l = Math.floor(Math.pow(6*(ix+1), 1/3)-1);
      let m = iface.m = ix - l*(l+1)*(l+2)/6;
      return poly_cart[l][m]; }
    default: {
      let l = iface.l = Math.floor(SIZE * Math.random());
      return initPoly_random(l);
    }
  }
}

function getPoly_delta(dl, dm) {
  iface.l += dl;
  iface.m += dm;
  if(iface.l < 0)
    iface.l = 0;
  else if(iface.l >= SIZE)
    iface.l = SIZE - 1;
  var poly;
  switch(iface.family) {
    case 'ylm':
    case 'ri': {
      let l = iface.l;
      if(iface.m > iface.l)
        iface.m = iface.l;
      else if(iface.m < -iface.l)
        iface.m = -iface.l;
      let m = iface.m;
      return (iface.family == 'ylm' ? poly_ylm : poly_ri)[l][l+m]; }
    case 'cart': {
      let l = iface.l;
      if(iface.m < 0)
        iface.m = 0;
      else if(iface.m >= (l+1)*(l+2)/2)
        iface.m = (l+1)*(l+2)/2 - 1;
      let m = iface.m;
      return poly_cart[l][m]; }
    default:
      return initPoly_random(iface.l);
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
  let l = iface.l, m = iface.m;
  setEnabled('l-', l > 0);
  setEnabled('l+', l < SIZE - 1);
  switch(iface.family) {
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
  iface.family = elm.getAttribute('data-family');
  newFunc();
}

/***** Interaction & initialization *****/

function rotStart(elm, x, y) {
  iface.lastX = x;
  iface.lastY = y;
}

function rotMove(elm, x, y) {
  var viewport = gl.getParameter(gl.VIEWPORT);
  iface.tilt += (y - iface.lastY) / viewport[3] * 4;
  if(iface.tilt > Math.PI / 2)
    iface.tilt = Math.PI / 2;
  else if(iface.tilt < -Math.PI / 2)
    iface.tilt = -Math.PI / 2;
  iface.angle += (x - iface.lastX) / viewport[2] * 4;
  iface.lastX = x;
  iface.lastY = y;
}

window.addEventListener('DOMContentLoaded', function() {
  canvas = document.getElementById('canvas');
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  gl = canvas.getContext('webgl');

  if(!gl) {
    alert('WebGL not supported');
    return;
  }

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.enable(gl.CULL_FACE);

  initPoly();

  progs = {};
  loadFiles(start);

  iface = {
    tilt: 0.2,
    angle: 0,
    speed: .001
  };

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
});
