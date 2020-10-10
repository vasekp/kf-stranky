'use strict';

/***** AJAX helpers *****/

function basename(url) {
  return url.substring(url.lastIndexOf('/') + 1);
}

function loadFiles(func) {
  var files = {};
  var links = document.querySelectorAll('link[rel="preload"]');
  var loaded = 0;
  for(let i = 0; i < links.length; i++) {
    let xhr = new XMLHttpRequest();
    let url = links[i].href;
    let iForIE = i;
    xhr.open('GET', url, true);
    xhr.onload = function() {
      if(xhr.status === 200) {
        let id = links[iForIE].id || basename(url);
        files[id] = xhr.responseText;
        if(++loaded == links.length)
          func(files);
      } else {
        alert(url + ' not loaded!');
        return;
      }
    };
    xhr.responseType = 'text';
    xhr.send();
  }
}

/***** OpenGL *****/

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
  attach(vs, gl.VERTEX_SHADER);
  attach(fs, gl.FRAGMENT_SHADER);

  ctx.linkProgram(program);
  if(!ctx.getProgramParameter(program, ctx.LINK_STATUS)) {
    console.log(ctx.getProgramInfoLog(program));
    ctx.deleteProgram(program);
    throw 'Program linking failed.';
  }

  this.program = program;
  const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  for(let i = 0; i < numUniforms; i++) {
    let name = gl.getActiveUniform(program, i).name;
    if(name.indexOf('[') > 0)
      name = name.substring(0, name.indexOf('['));
    const loc = gl.getUniformLocation(program, name);
    this[name] = loc;
  }
  const numAttribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
  for(let i = 0; i < numAttribs; i++) {
    const name = gl.getActiveAttrib(program, i).name;
    const loc = gl.getAttribLocation(program, name);
    this[name] = loc;
  }
}

function GraphicsComplex(num, dim, indexer) {
  this._coords = new Float32Array(num * dim);
  this._indices = [];

  this.put = function(ix, coords) {
    let base = indexer(ix) * dim;
    for(let j = 0; j < dim; j++)
      this._coords[base + j] = coords[j];
  }

  this.simplex = function() {
    for(let j = 0; j < arguments.length; j++)
      this._indices.push(indexer(arguments[j]));
  }

  this.coords = function() { return this._coords; };
  this.indices = function() { return new Uint16Array(this._indices); }
  this.length = function() { return this._indices.length; }
}

/***** Mouse and pointer event listeners *****/

function callBack(elm, ev, func) {
  if(!func)
    return;
  var rect = elm.getBoundingClientRect();
  func(elm, ev.clientX - rect.left, ev.clientY - rect.top, rect);
}

function pointerDown(e, callback) {
  var elm = e.currentTarget;
  if(pointerActive(elm))
    return;
  elm.setAttribute('data-rotating', 'true');
  elm.setAttribute('data-pointerId', e.pointerId);
  e.currentTarget.setPointerCapture(e.pointerId);
  e.preventDefault();
  callBack(elm, e, callback);
}

function pointerMove(e, callback) {
  var elm = e.currentTarget;
  if(!pointerActive(elm) || !elm.hasAttribute('data-pointerId')
      || e.pointerId != elm.getAttribute('data-pointerId'))
    return;
  callBack(elm, e, callback);
}

function pointerUp(e, callback) {
  var elm = e.currentTarget;
  if(!pointerActive(elm) || !elm.hasAttribute('data-pointerId')
      || e.pointerId != elm.getAttribute('data-pointerId'))
    return;
  elm.removeAttribute('data-rotating');
  elm.releasePointerCapture(e.pointerId);
  callBack(elm, e, callback);
}

function pointerActive(elm) {
  return elm.hasAttribute('data-rotating');
}

function addPointerListeners(elm, fStart, fMove, fEnd) {
  elm.addEventListener('pointerdown', function(e) { pointerDown(e, fStart); } );
  elm.addEventListener('pointermove', function(e) { pointerMove(e, fMove); } );
  elm.addEventListener('pointerup', function(e) { pointerUp(e, fEnd); } );
  elm.addEventListener('pointercancel', function(e) { pointerUp(e, fEnd); } );
  elm.addEventListener('touchstart', function(e) { e.preventDefault(); } );
  elm.style['touch-action'] = 'none';
}

function findNearest(point, map, minDistance) {
  var currentMin = minDistance;
  var found = null;
  for(let id in map) {
    let refPoint = map[id];
    let dist = Math.hypot(point[0] - refPoint[0], point[1] - refPoint[1]);
    if(dist < currentMin) {
      found = id;
      currentMin = dist;
    }
  }
  return found;
}

/***** Vector and quaternion algebra *****/

function dot(v1, v2) {
  return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
}

function cross(v1, v2) {
  return [
    v1[1] * v2[2] - v1[2] * v2[1],
    v1[2] * v2[0] - v1[0] * v2[2],
    v1[0] * v2[1] - v1[1] * v2[0]
  ];
}

function vnormalize(v) {
  let len = Math.sqrt(dot(v, v));
  return [v[0] / len, v[1] / len, v[2] / len];
}

function qmulq(q1, q2) {
  return [
    q1[3]*q2[0] + q2[3]*q1[0] + q1[1]*q2[2] - q1[2]*q2[1],
    q1[3]*q2[1] + q2[3]*q1[1] + q1[2]*q2[0] - q1[0]*q2[2],
    q1[3]*q2[2] + q2[3]*q1[2] + q1[0]*q2[1] - q1[1]*q2[0],
    q1[3]*q2[3] - q1[0]*q2[0] - q1[1]*q2[1] - q1[2]*q2[2]
  ];
}

function qconj(q) {
  return [-q[0], -q[1], -q[2], q[3]];
}

function qnormalize(q) {
  let qLen = Math.sqrt(q[0]*q[0] + q[1]*q[1] + q[2]*q[2] + q[3]*q[3]);
  return [q[0] / qLen, q[1] / qLen, q[2] / qLen, q[3] / qLen];
}

function vrotq(v, q) {
  let t = [
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

function findRotation(v1, v2) {
  let c = cross(v1, v2);
  let d = dot(v1, v2);
  if(d == -1)
    return [1, 0, 0, 0];
  else
    return qnormalize([c[0], c[1], c[2], 1 + d]);
}

function m2inv(m) {
  let invd = 1/(m[0]*m[3] - m[1]*m[2]);
  return [invd*m[3], -invd*m[1], -invd*m[2], invd*m[0],
    invd*(m[2]*m[5] - m[3]*m[4]), invd*(m[1]*m[4] - m[0]*m[5])];
}

function m2v(m, v) {
  return [m[0]*v[0] + m[2]*v[1] + m[4], m[1]*v[0] + m[3]*v[1] + m[5]];
}

function relAngle(v1, v2) {
  return Math.atan2(v1[0]*v2[1] - v1[1]*v2[0], v1[0]*v2[0] + v1[1]*v2[1]);
}

/***** Controller interface *****/

let svgNS = 'http://www.w3.org/2000/svg';
let xlinkNS = 'http://www.w3.org/1999/xlink';
let svgMime = 'image/svg+xml';

function Overlay(container, baseCoords, activateCallback) {
  let svg = document.createElementNS(svgNS, 'svg');
  svg.classList.add('controls');
  container.appendChild(svg);

  let em = parseFloat(getComputedStyle(container).fontSize);
  let w = svg.clientWidth / em;
  let h = svg.clientHeight / em;
  svg.setAttributeNS(null, 'viewBox', '0 0 ' + w + ' ' + h);
  this.w2c = [
    (baseCoords.xMax - baseCoords.xMin) / w, 0,
    0, (baseCoords.yMin - baseCoords.yMax) / h,
    baseCoords.xMin, baseCoords.yMax
  ];
  this.c2w = m2inv(this.w2c);

  let controls = [];
  let parser = new DOMParser();
  this.addControl = function(control) {
    let elm = control.elm = document.adoptNode(parser.parseFromString(control.svg, svgMime).documentElement);
    if(!(control.extra && control.extra.alwaysVisible))
      elm.classList.add('control');
    svg.appendChild(elm);
    control.owner = this;
    controls.push(control);
    if(control.update)
      control.update();
  };

  this.refresh = function() {
    controls.forEach(function(c) { if(c.update) c.update(); });
    if(this.active)
      requestAnimationFrame(this.refresh);
  }.bind(this);
  this.refresh();

  Object.defineProperty(this, 'active', {
    get: function() { return svg.classList.contains('active'); },
    set: function(a) {
      svg.classList.toggle('active', a);
      requestAnimationFrame(this.refresh);
    }
  });

  let activeControl;
  let delta;
  let pStart = function(elm, x, y) {
    if(!this.active) {
      if(activateCallback)
        activateCallback();
    }
    let pos = m2v(this.w2c, [x/em, y/em]);
    activeControl = findNearest2(pos, controls, 0.5);
    if(!activeControl)
      return;
    let refPos = activeControl.coords();
    delta = [pos[0] - refPos[0], pos[1] - refPos[1]];
  }.bind(this);
  let pMove = function(elm, x, y) {
    if(!activeControl)
      return;
    let pos = m2v(this.w2c, [x/em, y/em]);
    pos[0] -= delta[0];
    pos[1] -= delta[1];
    let ref = activeControl.ref ? activeControl.ref() : [0, 0];
    activeControl.callback(pos[0] - ref[0], pos[1] - ref[1]);
  }.bind(this);
  let pEnd = function() {
    activeControl = null;
  }.bind(this);
  addPointerListeners(svg, pStart, pMove, pEnd);
}

function findNearest2(point, controls, minDistance) {
  var currentMin = minDistance;
  var found = null;
  controls.forEach(function(control) {
    if(!control.coords)
      return;
    let refPoint = control.coords();
    if(!refPoint)
      return;
    let dist = Math.hypot(point[0] - refPoint[0], point[1] - refPoint[1]);
    if(dist < currentMin) {
      found = control;
      currentMin = dist;
    }
  });
  return found;
}

let idCounter = function() {
  let c = 0;
  return function() { return ++c; }
}();

function controlNodeSVG(color, shape) {
  let svg = '<g xmlns="' + svgNS + '" xmlns:xlink="' + xlinkNS + '" '
    + 'fill="' + color + '" stroke="' + color + '" stroke-width=".06">';
  let box = '<path fill="none" d="M -.35 -.35 H .35 V .35 H -.35 z"/>';
  let horz = '<path d="M -1 0 H 1 M 1 0 l 0 -.2 .4 .2 -.4 .2 z M -1 0 l 0 -.2 -.4 .2 .4 .2 z"/>';
  let vert = '<path d="M 0 -1 V 1 M 0 1 l -.2 0 .2 .4 .2 -.4 z M 0 -1 l -.2 0 .2 -.4 .2 .4 z"/>';
  let vert_bent = '<path fill="none" d="M -.1 -1 Q .1 0 -.1 1"/>'
        + '<path d="M -.1 1 l -.24 -.05 0.14 0.54 .35 -.43 z M -.1 -1 l -.24 .05 0.14 -0.54 .35 .43 z"/>';
  switch(shape) {
    case 'cross':
      svg += box + horz + vert;
      break;
    case 'bent':
      svg += box + horz + vert_bent;
      break;
    case 'horz':
      svg += box + horz;
      break;
    case 'vert':
      svg += box + vert;
      break;
    case 'vert-bent':
      svg += box + vert_bent;
      break;
    case 'dash':
      let c = idCounter();
      svg += '<defs><path id="path' + c + '" fill="none"/></defs>'
        + '<use xlink:href="#path' + c + '" stroke="' + color + '" stroke-dasharray=".3 .3"/>'
        + '<use xlink:href="#path' + c + '" stroke="white" stroke-dasharray=".3 .3" stroke-dashoffset=".3"/>'
      break;
  }
  svg += '</g>';
  return svg;
}

function BaseMarker(shape, color, extra) {
  this.extra = extra;
  this.svg = controlNodeSVG(color, shape);
}

function CoordAxes(xMin, xMax, yMin, yMax, xMark, yMark) {
  BaseMarker.call(this, '', 'black');
  this.extra = { alwaysVisible: true };
  this.update = function() {
    let parser = new DOMParser();
    let pxMin = m2v(this.owner.c2w, [xMin, 0]),
        pxMax = m2v(this.owner.c2w, [xMax, 0]),
        pyMin = m2v(this.owner.c2w, [0, yMin]),
        pyMax = m2v(this.owner.c2w, [0, yMax]);
    let svg = '<g xmlns="' + svgNS + '">'
      + '<path d="M ' + pxMin[0] + ' ' + pxMin[1] + ' L ' + pxMax[0] + ' ' + pxMax[1] + ' m 0 0 '
        + 'l 0 -.25 .5 .25 -.5 .25 z"/>'
      + '<text x="' + pxMax[0] + '" y="' + (pxMax[1] - .5) + '" font-size="1" stroke="none">' + xMark + '</text>'
      + '<path d="M ' + pyMin[0] + ' ' + pyMin[1] + ' L ' + pyMax[0] + ' ' + pyMax[1] + ' m 0 0 '
        + 'l -.25 0 .25 -.5 .25 .5 z"/>'
      + '<text x="' + (pyMax[0] + .5) + '" y="' + pyMax[1] + '" font-size="1" stroke="none">' + yMark + '</text>'
      + '</g>';
    let frag = parser.parseFromString(svg, svgMime).documentElement;
    this.elm.appendChild(document.adoptNode(frag));
    this.update = null;
  }
}

function DashedPath(arrayFun, color, extra) {
  BaseMarker.call(this, 'dash', color, extra);
  this.update = function() {
    let pts = arrayFun();
    this.elm.style.visibility = pts ? 'visible' : 'hidden';
    if(!pts)
      return;
    let c2w = this.owner.c2w;
    pts = pts.map(function(pt) {
      let coord = m2v(c2w, pt);
      return coord[0] + ' ' + coord[1];
    });
    this.elm.querySelector('path').setAttribute('d', 'M ' + pts.join(' L '));
  }
}

function Control(coordsFun, refFun, dirFun, shape, color, callback) {
  BaseMarker.call(this, shape, color, callback);
  this.coords = coordsFun;
  this.ref = refFun;
  this.dir = dirFun;
  this.callback = callback;
  this.update = function() {
    let pos = this.coords();
    this.elm.style.visibility = pos ? 'visible' : 'hidden';
    if(!pos)
      return;
    let dir = this.dir(pos);
    let angle = Math.atan2(dir[1], dir[0]);
    let powW = m2v(this.owner.c2w, pos);
    let trf = 'translate(' + powW[0] + ' ' + powW[1] + ') rotate(' + (-angle/Math.PI*180) + ')';
    this.elm.setAttribute('transform', trf);
  };
}

function AbsControl(coordsFun, shape, color, callback) {
  Control.call(this, coordsFun, null, function() { return [1,0]; }, shape, color, callback);
}

function CenterControl(coordsFun, centerFun, shape, color, callback) {
  this.center = centerFun;
  Control.call(this, coordsFun, centerFun,
    function(pos) {
      let center = this.center();
      return [pos[0] - center[0], pos[1] - center[1]];
    },
    shape, color, callback);
}

function DirControl(coordsFun, refFun, axisFun, shape, color, callback) {
  Control.call(this, coordsFun, refFun, axisFun, shape, color, callback);
}
