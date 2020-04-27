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
