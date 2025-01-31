const rIni = 10.0;
const vIni = 0.2;
const speedScale = 5;
var gl;
var over;

const ctx = (_ => {
  const q = 1.0 - 1.0 / rIni;
  const ch = Math.cosh(vIni);
  const sh = Math.sinh(vIni);

  return {
    t: 0.0,
    r: rIni,
    ur: 0.0,
    phi: 0.0,
    chi: 0.0,
    l: rIni * sh,
    e: ch * Math.sqrt(q),
    buffer: new Float32Array(8 * 5),
    view: [0.0, 0.0, 0.0, 1.0],
    view_tmp: [0.0, 0.0, 0.0, 1.0],
    view_rot: [0.0, 0.0, 0.0],
    angle: 30.0,
    speed: 1.0,
    scale: 11
  };
})();

function step(dt) {
  const l2 = ctx.l * ctx.l;
  const ro = ctx.r;
  if(ctx.r > 1.0) {
    // Outside of event horizon, use approximation of constant acceleration
    // (handles turning points better)
    const r = ctx.r;
    const ar = -0.5 / r / r + l2 / r / r / r * (1.0 - 1.5 / r);
    const urn = ctx.ur + ar * dt;
    const rn = ctx.r + (ctx.ur + urn) / 2.0 * dt;
    if(rn < 0.0) {
      stop();
      return;
    }
    ctx.ur = urn;
    ctx.r = rn;
  } else {
    // Inside the event horizon, the above approximation fails
    // Use Runge-Kutta instead, checking at every step of the process
    function u(r) {
      const u2 = ctx.e * ctx.e - (1.0 - 1.0 / r) * (1.0 + ctx.l * ctx.l / r / r);
      if(u2 > 0.0)
        return -Math.sqrt(u2);
      else
        throw 0;
    }
    try {
      const k1 = u(ctx.r);
      const k2 = u(ctx.r + k1 * dt / 2.0);
      const k3 = u(ctx.r + k2 * dt / 2.0);
      const k4 = u(ctx.r + k3 * dt);
      const rn = ctx.r + (k1 + 2 * k2 + 2 * k3 + k4) / 6.0 * dt;
      if(rn <= 0.0) {
        stop();
        return;
      }
      ctx.ur = u(rn);
      ctx.r = rn;
    } catch(_) {
      stop();
      return;
    }
  }

  const q = 1.0 - 1.0 / ctx.r;
  const r2 = ctx.r * ctx.r;
  const r2avg = (ctx.r * ctx.r + ro * ro) / 2.0;
  ctx.ur = Math.sign(ctx.ur) * Math.sqrt(Math.max(0.0, ctx.e * ctx.e - q * (1.0 + l2 / r2)));
  ctx.phi += ctx.l / r2avg * dt;
  ctx.chi += ctx.l * ctx.e / (l2 + r2avg) * dt;
  ctx.t += dt;

  let rr = Math.max(ctx.r, Math.hypot(ctx.r + speedScale * ctx.ur, speedScale * ctx.l / ctx.r));
  if(rr > 0.95 * ctx.scale) {
    ctx.scale = rr * 1.4;
    over.updateScale({ xMin: -ctx.scale, xMax: ctx.scale, yMin: -ctx.scale, yMax: ctx.scale });
  }

  const minScale = 3.0;
  if(rr < 0.5 * ctx.scale && ctx.scale > minScale) {
    ctx.scale = Math.max(rr * 1.4, minScale);
    over.updateScale({ xMin: -ctx.scale, xMax: ctx.scale, yMin: -ctx.scale, yMax: ctx.scale });
  }
}

function stop() {
  document.getElementById('speed').value = 0;
  ctx.speed = 0;
}

window.addEventListener('DOMContentLoaded', function() {
  var canvas = document.getElementById('canvas');
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  gl = canvas.getContext('webgl2');

  if(!gl) {
    alert('Functionality necessary for this demo not supported. Please use a newer browser.');
    return;
  }

  loadFiles(filesReady);
});

function filesReady(files) {
  const sim = new Program(gl, files['sim.vert'], files['sim.frag']);

  sim.tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, sim.tex);

  let counter = 0;
  const loadTex = (dir, fname) => {
    const img = document.getElementById(fname);
    const callback = _ => {
      gl.texImage2D(dir, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      counter++;
      if(counter == 6) {
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAX_LOD, 2);
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
      }
    }
    if(img.complete)
      callback();
    else
      img.onload = callback;
  }
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  // Texture source: https://svs.gsfc.nasa.gov/4851/
  // See more information in TEX-SOURCE.txt
  loadTex(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 'px.png'),
  loadTex(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 'nx.png'),
  loadTex(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 'py.png'),
  loadTex(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 'ny.png'),
  loadTex(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 'pz.png'),
  loadTex(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 'nz.png')

  gl.useProgram(sim.program);
  gl.uniform1i(sim.cubemap, sim.tex);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

  const uniBuf = gl.createBuffer();
  gl.bindBuffer(gl.UNIFORM_BUFFER, uniBuf);
  gl.bindBufferRange(gl.UNIFORM_BUFFER, 0, uniBuf, 0, ctx.buffer.byteLength);

  let lastT;
  function drawFrame(time) {
    const ratio = window.devicePixelRatio || 1;
    const width = canvas.width = canvas.clientWidth * ratio;
    const height = canvas.height = canvas.clientHeight * ratio;
    const itan = 1.0 / Math.tan(ctx.angle * Math.PI / 180.0);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.useProgram(sim.program);

    const mProj = [
      itan * height / width, 0, 0, 0,
      0, -itan, 0, 0,
      0, 0, -1, 1,
      0, 0, 0, 0
    ];
    gl.uniformMatrix4fv(sim.mProj, false, mProj);

    if(lastT !== undefined) {
      const dt = time - lastT;
      if(dt < 1000) {
        const rot = qexp(ctx.view_rot, dt * ctx.speed);
        const q = qmul(ctx.view, rot);
        const n = qnorm(q, q);
        ctx.view = [q[0] / n, q[1] / n, q[2] / n, q[3] / n];

        if(ctx.speed != 0)
          step(dt / 1000 * ctx.speed);
      }
    }
    lastT = time;

    gl.uniform4fv(sim.qView, ctx.view);
    gl.uniform4fv(sim.qView2, ctx.view_tmp);

    const sf = Math.sin(ctx.phi);
    const cf = Math.cos(ctx.phi);
    const r2 = ctx.r * ctx.r;
    ctx.buffer.set([ctx.r], 0);         // pos.r
    ctx.buffer.set([cf, sf, 0.0], 4);   // pos.n
    ctx.buffer.set([ctx.ur, ctx.e], 8); // spd.r, spd.t
    ctx.buffer.set([-sf * ctx.l / r2, cf * ctx.l / r2, 0.0], 12); // spd.n

    const cc = Math.cos(ctx.chi);
    const sc = Math.sin(ctx.chi);
    const nu = Math.sqrt(ctx.l * ctx.l + ctx.r * ctx.r);
    const tri = [];
    const v = { t: ctx.l * ctx.e / nu, r: ctx.l * ctx.ur / nu, n: [-sf * nu / r2, cf * nu / r2, 0.0] };
    const w = { t: ctx.r * ctx.ur / nu, r: ctx.r * ctx.e / nu, n: [0.0, 0.0, 0.0] };
    tri[0] = { t: cc * v.t + sc * w.t, r: cc * v.r + sc * w.r, n: [cc * v.n[0], cc * v.n[1], cc * v.n[2]] };
    tri[1] = { t: 0.0, r: 0.0, n: [0.0, 0.0, 1.0 / ctx.r] };
    tri[2] = { t: -sc * v.t + cc * w.t, r: -sc * v.r + cc * w.r, n: [-sc * v.n[0], -sc * v.n[1], -sc * v.n[2]] };
    ctx.buffer.set([tri[0].r, tri[0].t], 16);
    ctx.buffer.set(tri[0].n, 20);
    ctx.buffer.set([tri[1].r, tri[1].t], 24);
    ctx.buffer.set(tri[1].n, 28);
    ctx.buffer.set([tri[2].r, tri[2].t], 32);
    ctx.buffer.set(tri[2].n, 36);
    gl.bufferData(gl.UNIFORM_BUFFER, ctx.buffer, gl.STATIC_DRAW);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    requestAnimationFrame(drawFrame);
  }

  let pid, pcoords;
  const hist = [];

  canvas.addEventListener('pointerdown', ev => {
    if(pid === undefined) {
      pid = ev.pointerId;
      canvas.setPointerCapture(pid);
      ev.preventDefault();
      pcoords = [ev.clientX, ev.clientY];
      hist.length = 0;
      hist.push({ t: performance.now(), q: ctx.view_tmp });
      ctx.view_rot = [0.0, 0.0, 0.0];
    }
  });

  canvas.addEventListener('pointermove', ev => {
    if(pid !== undefined) {
      const coords = [ev.clientX, ev.clientY];
      const angle = ctx.angle * Math.PI / 180.0;
      const ax = (coords[0] - pcoords[0]) / canvas.height * 2 * angle;
      const ay = -(coords[1] - pcoords[1]) / canvas.height * 2 * angle;
      ctx.view_tmp = qmul(
        [Math.sin(ay / 2), 0, 0, Math.cos(ay / 2)],
        [0, Math.sin(ax / 2), 0, Math.cos(ax / 2)]);
      const now = performance.now();
      hist.push({ t: performance.now(), q: ctx.view_tmp });
      hist.splice(0, hist.findIndex(rec => rec.t >= now - 100));
    }
  });

  canvas.addEventListener('pointerup', ev => {
    if(pid !== undefined) {
      ctx.view = qmul(ctx.view, ctx.view_tmp);
      const now = performance.now();
      hist.splice(0, hist.findIndex(rec => rec[0] >= now - 100));
      if(hist.length >= 2 && hist.at(-1).t != hist[0].t && now - hist.at(-1).t < 10 && ctx.speed != 0) {
        const dt = hist.at(-1).t - hist[0].t;
        const dq = qmul(qconj(hist[0].q), hist.at(-1).q);
        ctx.view_rot = qlog0(dq, dt * ctx.speed);
      } else
        ctx.view_rot = [0.0, 0.0, 0.0];
    }
    ctx.view_tmp = [0.0, 0.0, 0.0, 1.0];
    canvas.releasePointerCapture(pid);
    pid = undefined;
  });

  canvas.addEventListener('pointercancel', ev => {
    ctx.view_tmp = [0.0, 0.0, 0.0, 1.0];
    canvas.releasePointerCapture(pid);
    pid = undefined;
  });

  over = new Overlay(document.getElementById('geometry'),
    { xMin: -ctx.scale, xMax: ctx.scale, yMin: -ctx.scale, yMax: ctx.scale },
    act => {
      stop(); 
      delete over.svg.dataset['hidden'];
      if(act === "release") step(0);
    });
  const centerFun = _ => [ctx.r * Math.cos(ctx.phi), ctx.r * Math.sin(ctx.phi)];
  const tipFun = _ => [
      Math.cos(ctx.phi) * (ctx.r + speedScale * ctx.ur) - speedScale * Math.sin(ctx.phi) * ctx.l / ctx.r,
      Math.sin(ctx.phi) * (ctx.r + speedScale * ctx.ur) + speedScale * Math.cos(ctx.phi) * ctx.l / ctx.r];
  over.addControl(new CircleMarker(_ => [0, 0], 1, '#888'), {alwaysVisible: true});
  over.addControl(new CircleMarker(centerFun, 0.2, 'black'), {alwaysVisible: true});
  over.addControl(new Arrow(centerFun, tipFun, 'black'), {alwaysVisible: true});
  over.addControl(new AbsControl(centerFun, 'cross', '#44F',
    (x, y) => {
      let un = ctx.l / ctx.r;
      ctx.r = Math.hypot(x, y);
      ctx.phi = Math.atan2(y, x);
      ctx.l = un * ctx.r;
      let r = ctx.r;
      let l2 = ctx.l * ctx.l;
      if(ctx.r < 1.0) {
        ctx.ur = Math.min(ctx.ur, -Math.sqrt((1.0 / r - 1.0) * (1 + l2 / r / r)));
      }
      ctx.e = Math.sqrt(Math.max(ctx.ur * ctx.ur + (1.0 - 1.0/r) * (1.0 + l2 / r / r), 0.0));
    }));
  over.addControl(new CenterControl(tipFun, centerFun, 'bent', '#F44',
    (x, y) => {
      let r = ctx.r;
      let cf = Math.cos(ctx.phi);
      let sf = Math.sin(ctx.phi);
      let dr = cf * x + sf * y;
      let dn = cf * y - sf * x;
      ctx.ur = dr / speedScale;
      ctx.l = dn / speedScale * r;
      let l2 = ctx.l * ctx.l;
      if(ctx.r < 1.0) {
        ctx.ur = Math.min(ctx.ur, -Math.sqrt((1.0 / r - 1.0) * (1 + l2 / r / r)));
      }
      ctx.e = Math.sqrt(Math.max(ctx.ur * ctx.ur + (1.0 - 1.0/r) * (1.0 + l2 / r / r), 0.0));
    }));
  over.svg.dataset['hidden'] = 1;
  over.active = true;

  document.getElementById('angle').addEventListener('input',
    e => ctx.angle = e.currentTarget.value);

  document.getElementById('speed').addEventListener('input',
    e => {
      ctx.speed = e.currentTarget.value;
      over.svg.dataset['hidden'] = 1;
    });

  requestAnimationFrame(drawFrame);
}

function CircleMarker(centerFun, radius, color) {
  BaseMarker.call(this);
  this.svgFun = function() {
    return `<circle fill="${color}"/>`;
  };
  this.update = function() {
    let xy = m2v(this.owner.c2w, centerFun());
    let scale = this.owner.c2w[0];
    let elm = this.elm.querySelector('circle');
    elm.setAttribute('cx', xy[0]);
    elm.setAttribute('cy', xy[1]);
    elm.setAttribute('r', scale * radius);
  }
}

function qmul(q1, q2) {
  return [
    q1[3] * q2[0] + q2[3] * q1[0] + q1[1] * q2[2] - q1[2] * q2[1],
    q1[3] * q2[1] + q2[3] * q1[1] + q1[2] * q2[0] - q1[0] * q2[2],
    q1[3] * q2[2] + q2[3] * q1[2] + q1[0] * q2[1] - q1[1] * q2[0],
    q1[3] * q2[3] - q1[0] * q2[0] - q1[1] * q2[1] - q1[2] * q2[2],
  ];
}

function qconj(q) {
  return [-q[0], -q[1], -q[2], q[3]];
}

function qnorm(q) {
  return q[0] * q[0] + q[1] * q[1] + q[2] * q[2] + q[3] * q[3];
}

function qlog0(q, div) { // assumes q.q == 1, q[3] != -1
  const a = Math.acos(q[3]);
  if(a == 0.0)
    return [0.0, 0.0, 0.0];
  else {
    const m = a / Math.sin(a) / div;
    return [m * q[0], m * q[1], m * q[2]];
  }
}

function qexp(v, mul) {
  const a = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  if(a == 0)
    return [0.0, 0.0, 0.0, 1.0];
  else {
    const sa = Math.sin(a * mul);
    return [v[0] / a * sa, v[1] / a * sa, v[2] / a * sa, Math.cos(a * mul)];
  }
}

function Shader(ctx, type, source) {
  var shader = ctx.createShader(type);
  ctx.shaderSource(shader, source);
  ctx.compileShader(shader);
  if(!ctx.getShaderParameter(shader, ctx.COMPILE_STATUS)) {
    console.log(ctx.getShaderInfoLog(shader));
    ctx.deleteShader(shader);
    throw 'Shader compilation failed.';
  }
  this.shader = shader;
}

function Program(ctx, vs, fs) {
  var program = ctx.createProgram();
  function attach(s, type) {
    if(s instanceof Shader)
      ctx.attachShader(program, s.shader);
    else
      ctx.attachShader(program, new Shader(ctx, type, s).shader);
  }
  attach(vs, ctx.VERTEX_SHADER);
  attach(fs, ctx.FRAGMENT_SHADER);

  ctx.linkProgram(program);
  if(!ctx.getProgramParameter(program, ctx.LINK_STATUS)) {
    console.log(ctx.getProgramInfoLog(program));
    ctx.deleteProgram(program);
    throw 'Program linking failed.';
  }

  this.program = program;
  const numUniforms = ctx.getProgramParameter(program, ctx.ACTIVE_UNIFORMS);
  for(let i = 0; i < numUniforms; i++) {
    let name = ctx.getActiveUniform(program, i).name;
    if(name.indexOf('[') > 0)
      name = name.substring(0, name.indexOf('['));
    const loc = ctx.getUniformLocation(program, name);
    this[name] = loc;
  }
  const numAttribs = ctx.getProgramParameter(program, ctx.ACTIVE_ATTRIBUTES);
  for(let i = 0; i < numAttribs; i++) {
    const name = ctx.getActiveAttrib(program, i).name;
    const loc = ctx.getAttribLocation(program, name);
    this[name] = loc;
  }
}
