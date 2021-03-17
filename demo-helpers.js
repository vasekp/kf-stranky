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
    let dist = hypot(point[0] - refPoint[0], point[1] - refPoint[1]);
    if(dist < currentMin) {
      found = id;
      currentMin = dist;
    }
  }
  return found;
}

/***** We still support IE11 *****/

var hypot = Math.hypot ? Math.hypot : function(dx, dy) {
  return Math.sqrt(dx*dx + dy*dy);
}

var cosh = Math.cosh ? Math.cosh : function(x) {
  return (Math.exp(x) + Math.exp(-x)) / 2;
}

var sinh = Math.sinh ? Math.sinh : function(x) {
  return (Math.exp(x) - Math.exp(-x)) / 2;
}

var sign = Math.sign ? Math.sign : function(x) {
  return x > 0 ? 1 : x < 0 ? -1 : 0; // insignificant difference to spec
}

/***** Complex numbers *****/

function cxpolar(r, phi) {
  return [r*Math.cos(phi), r*Math.sin(phi)];
}

function cxarg(c) {
  return Math.atan2(c[1], c[0]);
}

function cxabs(c) {
  return hypot(c[0], c[1]);
}

function cxadd(c1, c2) {
  return [c1[0] + c2[0], c1[1] + c2[1]];
}

function cxsub(c1, c2) {
  return [c1[0] - c2[0], c1[1] - c2[1]];
}

function cxmul(c1, c2) {
  return [c1[0]*c2[0] - c1[1]*c2[1], c1[1]*c2[0] + c1[0]*c2[1]];
}

function cxmulc(c1, c2) {
  return [c1[0]*c2[0] + c1[1]*c2[1], c1[1]*c2[0] - c1[0]*c2[1]];
}

function cxmulr(c1, r) {
  return [r*c1[0], r*c1[1]];
}

function cxexp(c) {
  return cxpolar(Math.exp(c[0]), c[1]);
}

function cxsqrt(c) {
  return cxpolar(Math.sqrt(cxabs(c)), cxarg(c)/2);
}

function cxdiv(c1, c2) {
  return cxmulr(cxmulc(c1, c2), 1/cxnorm2(c2));
}

function cxinv(c) {
  return cxdiv([1, 0], c);
}

function cxdivr(c, r) {
  return cxmulr(c, 1/r);
}

function cxnorm2(c) {
  return c[0]*c[0] + c[1]*c[1];
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

function qexp(q, t) {
  let cos = Math.cos(t), sin = Math.sin(t);
  if(q[3]) {
    let exp = Math.exp(q[3]);
    return [exp * sin * q[0], exp * sin * q[1], exp * sin * q[2], exp * cos];
  } else
    return [sin * q[0], sin * q[1], sin * q[2], cos];
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

function m2mul(a, b) {
  return [a[0]*b[0] + a[2]*b[1], a[1]*b[0] + a[3]*b[1],
    a[0]*b[2] + a[2]*b[3], a[1]*b[2] + a[3]*b[3],
    a[0]*b[4] + a[2]*b[5] + a[4], a[1]*b[4] + a[3]*b[5] + a[5]];
}

function m2inv(m) {
  let invd = 1/(m[0]*m[3] - m[1]*m[2]);
  return [invd*m[3], -invd*m[1], -invd*m[2], invd*m[0],
    invd*(m[2]*m[5] - m[3]*m[4]), invd*(m[1]*m[4] - m[0]*m[5])];
}

function m2tr(m) {
  return [m[0], m[2], m[1], m[3], m[4], m[5]];
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

function Overlay(container, options, callback) {
  let svgElement = document.createElementNS(svgNS, 'svg');
  svgElement.setAttribute('class', 'controls');
  if(options.underneath)
    container.insertBefore(svgElement, container.firstChild);
  else
    container.appendChild(svgElement);

  let em = parseFloat(getComputedStyle(container).fontSize);
  let w = svgElement.clientWidth / em;
  let h = svgElement.clientHeight / em;
  let p = options.padding || 0;
  svgElement.setAttributeNS(null, 'viewBox', '0 0 ' + w + ' ' + h);
  this.c2w = m2mul([w - 2*p, 0, 0, h-2*p, p, h-p],
    m2inv([options.xMax - options.xMin, 0, 0, options.yMin - options.yMax, options.xMin, options.yMin]));
  this.w2c = m2inv(this.c2w);

  let controls = [];
  let parser = new DOMParser();
  this.addControl = function(control, extra) {
    control.owner = this;
    control.extra = extra;
    if(control.svgFun) {
      let svg = '<g xmlns="' + svgNS + '" xmlns:xlink="' + xlinkNS + '">'
        + control.svgFun() + '</g>';
      let elm = control.elm = document.adoptNode(parser.parseFromString(svg, svgMime).documentElement);
      if(!(extra && extra.alwaysVisible))
        elm.setAttribute('class', 'control');
      svgElement.appendChild(elm);
    }
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
    get: function() { return +svgElement.getAttribute('data-active'); },
    set: function(a) {
      svgElement.setAttribute('data-active', +a);
      requestAnimationFrame(this.refresh);
    }
  });

  let activeControl;
  let delta;
  let pStart = function(elm, x, y) {
    let pos = m2v(this.w2c, [x/em, y/em]);
    activeControl = findNearest2(pos, controls, 0.5);
    if(!activeControl)
      return;
    if(callback)
      callback('start', activeControl, this);
    let refPos = activeControl.coords();
    delta = [pos[0] - refPos[0], pos[1] - refPos[1]];
    if(activeControl.extra && activeControl.extra.captureAll && hypot(delta[0], delta[1]) > 0.25) {
      // The tap was noticeably far from a "capture all" control: intended meaning was to move it there.
      // Thus 1) we won't use the delta, 2) we fire a move event right away.
      delta = [0, 0];
      activeControl.callback(pos[0], pos[1]);
    }
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
    if(callback)
      callback('release', activeControl, this);
    activeControl = null;
  }.bind(this);
  addPointerListeners(svgElement, pStart, pMove, pEnd);
}

function findNearest2(point, controls, minDistance) {
  var currentMin = minDistance;
  var found = null;
  controls.forEach(function(control) {
    if(!control.coords)
      return;
    if(control.extra && control.extra.captureAll) {
      found = control;
      return;
    }
    let refPoint = control.coords();
    if(!refPoint)
      return;
    let dist = hypot(point[0] - refPoint[0], point[1] - refPoint[1]);
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
  let svg = '<g fill="' + color + '" stroke="' + color + '" stroke-width=".06">';
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

function BaseMarker(shape, color) {
  if(shape)
    this.svgFun = function() { return controlNodeSVG(color, shape); };
}

function Label(x, y, color, text) {
  BaseMarker.call(this);
  this.svgFun = function() {
    let xyW = m2v(this.owner.c2w, [x, y]);
    return '<text x="' + xyW[0] + '" y="' + (xyW[1] + .4) + '" fill="' + color + '" '
      + 'font-size="1" stroke="none">' + text + '</text>';
  };
}

function CrossLabel(x, y, color, text) {
  BaseMarker.call(this);
  this.svgFun = function() {
    let xyW = m2v(this.owner.c2w, [x, y]);
    return '<path stroke="' + color + '" stroke-width=".06" d="M ' + xyW.join(' ')
      + ' m -.25 -.25 l .5 .5 m -.5 0 l .5 -.5"/>'
      + '<text x="' + (xyW[0] + .25) + '" y="' + (xyW[1] - .25) + '" fill="' + color + '" '
      + 'font-size="1" stroke="none">' + text + '</text>';
  };
}

function CoordAxes(xMin, xMax, yMin, yMax, xName, yName, xMarks, yMarks) {
  BaseMarker.call(this);
  this.svgFun = function() {
    let pxMin = m2v(this.owner.c2w, [xMin, 0]),
        pxMax = m2v(this.owner.c2w, [xMax, 0]),
        pyMin = m2v(this.owner.c2w, [0, yMin]),
        pyMax = m2v(this.owner.c2w, [0, yMax]);
    let svg = '<g fill="black" stroke="black" stroke-width=".06" font-size="1">'
      + '<path d="M ' + pxMin[0] + ' ' + pxMin[1] + ' L ' + pxMax[0] + ' ' + pxMax[1] + '"/>'
      + '<path d="M ' + pxMax[0] + ' ' + pxMax[1] + ' l 0 -.25 .5 .25 -.5 .25 z" stroke="none"/>'
      + '<text x="' + (pxMax[0] + .5) + '" y="' + (pxMax[1] - .5) + '" text-anchor="end" stroke="none">' + xName + '</text>'
      + '<path d="M ' + pyMin[0] + ' ' + pyMin[1] + ' L ' + pyMax[0] + ' ' + pyMax[1] + '"/>'
      + '<path d="M ' + pyMax[0] + ' ' + pyMax[1] + ' l -.25 0 .25 -.5 .25 .5 z" stroke="none"/>'
      + '<text x="' + (pyMax[0] + .5) + '" y="' + (pyMax[1] + .5) + '" stroke="none">' + yName + '</text>'
    if(xMarks) {
      let ticks = '';
      xMarks.forEach(function(mark) {
        let pos = (mark instanceof Array) ? mark[0] : mark;
        let text = (mark instanceof Array) ? mark[1] : mark;
        let xy1 = m2v(this.owner.c2w, [pos, 0]),
            xy2 = m2v(this.owner.c2w, [pos, yMin]);
        ticks += 'M ' + xy1.join(' ') + ' L ' + xy2.join(' ');
        svg += '<text stroke="none" x="' + xy2[0] + '" y="' + (xy2[1] + .8) + '" '
          + 'text-anchor="middle">' + text + '</text>';
      }.bind(this));
      svg += '<path d="' + ticks + '"/>';
    }
    if(yMarks) {
      let ticks = '';
      yMarks.forEach(function(mark) {
        let pos = (mark instanceof Array) ? mark[0] : mark;
        let text = (mark instanceof Array) ? mark[1] : mark;
        let xy1 = m2v(this.owner.c2w, [0, pos]),
            xy2 = m2v(this.owner.c2w, [xMin, pos]);
        ticks += 'M ' + xy1.join(' ') + ' L ' + xy2.join(' ');
        svg += '<text stroke="none" x="' + xy2[0] + '" y="' + (xy2[1] + .4) + '" '
          + 'text-anchor="end">' + text + '</text>';
      }.bind(this));
      svg += '<path d="' + ticks + '"/>';
    }
    svg += '</g>';
    return svg;
  }
}

function CoordAxis(xMin, xMax, yMin, yMax, xName, xMarks) {
  BaseMarker.call(this);
  this.svgFun = function() {
    let pxMin = m2v(this.owner.c2w, [xMin, 0]),
        pxMax = m2v(this.owner.c2w, [xMax, 0]);
    let svg = '<g fill="black" stroke="black" stroke-width=".06" font-size="1">'
      + '<path d="M ' + pxMin[0] + ' ' + pxMin[1] + ' L ' + pxMax[0] + ' ' + pxMax[1] + '"/>'
      + '<path d="M ' + pxMax[0] + ' ' + pxMax[1] + ' l 0 -.25 .5 .25 -.5 .25 z" stroke="none"/>'
      + '<text x="' + (pxMax[0] + .5) + '" y="' + (pxMax[1] - .5) + '" text-anchor="end" stroke="none">' + xName + '</text>';
    if(xMarks) {
      let ticks = '';
      xMarks.forEach(function(mark) {
        let pos = (mark instanceof Array) ? mark[0] : mark;
        let text = (mark instanceof Array) ? mark[1] : mark;
        let xy1 = m2v(this.owner.c2w, [pos, yMax]),
            xy2 = m2v(this.owner.c2w, [pos, yMin]);
        ticks += 'M ' + xy1.join(' ') + ' L ' + xy2.join(' ');
        svg += '<text stroke="none" x="' + xy2[0] + '" y="' + (xy2[1] + .8) + '" '
          + 'text-anchor="middle">' + text + '</text>';
      }.bind(this));
      svg += '<path d="' + ticks + '"/>';
    }
    svg += '</g>';
    return svg;
  }
}

function Arrow(fromFun, toFun, color) {
  BaseMarker.call(this);
  this.svgFun = function() {
    return '<g fill="' + color + '" stroke="' + color + '" stroke-width=".06">'
      + '<path/>'
      + '<path d="M 0 0 l .5 .25 0 -.5 z" stroke="none"/>'
      + '</g>';
  };
  this.update = function() {
    let from = m2v(this.owner.c2w, fromFun());
    let to = m2v(this.owner.c2w, toFun());
    if(!from || !to) {
      this.elm.style.visibility = 'hidden';
      return;
    }
    let dx = to[0] - from[0],
        dy = to[1] - from[1],
        len = hypot(dx, dy);
    if(len == 0) {
      this.elm.style.visibility = 'hidden';
      return;
    }
    this.elm.querySelector('path').setAttribute('d', 'M 0 0 H ' + len);
    let trf = 'translate(' + to[0] + ', ' + to[1] + ') '
      + 'rotate(' + (Math.atan2(-dy, -dx) * 180 / Math.PI) + ')';
    this.elm.setAttribute('transform', trf);
    this.elm.style.visibility = 'visible';
  };
}

function DashedPath(arrayFun, color) {
  BaseMarker.call(this, 'dash', color);
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

function BaseControl(coordsFun, refFun, callback) {
  this.coords = coordsFun;
  this.ref = refFun;
  this.callback = callback;
}

function Control(coordsFun, refFun, dirFun, shape, color, callback) {
  BaseMarker.call(this, shape, color);
  BaseControl.call(this, coordsFun, refFun, callback);
  this.dir = dirFun;
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
