/***** AJAX helpers *****/

function basename(url) {
  return url.substring(url.lastIndexOf('/') + 1);
}

function loadFiles(func) {
  var files = {};
  var links = document.querySelectorAll('link[rel=preload]');
  var loaded = 0;
  for(let i = 0; i < links.length; i++) {
    let xhr = new XMLHttpRequest();
    let url = links[i].href;
    xhr.open('GET', url, true);
    xhr.onload = function() {
      if(xhr.status === 200) {
        let id = links[i].id || basename(url);
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

function createGLShader(ctx, type, source) {
  var shader = ctx.createShader(type);
  ctx.shaderSource(shader, source);
  ctx.compileShader(shader);
  if(ctx.getShaderParameter(shader, ctx.COMPILE_STATUS))
    return shader;
  else {
    console.log(ctx.getShaderInfoLog(shader));
    ctx.deleteShader(shader);
  }
}

function createGLProgram(ctx, vertexShader, fragmentShader) {
  var program = ctx.createProgram();
  ctx.attachShader(program, vertexShader);
  ctx.attachShader(program, fragmentShader);
  ctx.linkProgram(program);
  if(ctx.getProgramParameter(program, ctx.LINK_STATUS))
    return program;
  else {
    console.log(ctx.getProgramInfoLog(program));
    ctx.deleteProgram(program);
  }
}

function createProgram(ctx, vertSource, fragSource) {
  var ret = {};
  var vs = createGLShader(gl, gl.VERTEX_SHADER, vertSource);
  var fs = createGLShader(gl, gl.FRAGMENT_SHADER, fragSource);
  var program = createGLProgram(gl, vs, fs);
  if(!program)
    return null;
  ret.program = program;
  const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  for(let i = 0; i < numUniforms; i++) {
    let name = gl.getActiveUniform(program, i).name;
    if(name.indexOf('[') > 0)
      name = name.substring(0, name.indexOf('['));
    const loc = gl.getUniformLocation(program, name);
    ret[name] = loc;
  }
  const numAttribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
  for(let i = 0; i < numAttribs; i++) {
    const name = gl.getActiveAttrib(program, i).name;
    const loc = gl.getAttribLocation(program, name);
    ret[name] = loc;
  }
  return ret;
}

/***** Mouse and touch event listeners *****/

function callBack(elm, ev, func) {
  if(!func)
    return;
  var rect = elm.getBoundingClientRect();
  func(elm, ev.clientX - rect.left, ev.clientY - rect.top, rect);
}

function mouseDown(e, callback) {
  if(e.button != 0)
    return;
  var elm = e.currentTarget;
  elm.setAttribute('data-rotating', 'true');
  e.currentTarget.setPointerCapture(e.pointerID);
  e.preventDefault();
  callBack(elm, e, callback);
}

function mouseMove(e, callback) {
  var elm = e.currentTarget;
  if(pointerActive(elm))
    callBack(elm, e, callback);
}

function mouseUp(e, callback) {
  var elm = e.currentTarget;
  elm.removeAttribute('data-rotating');
  elm.releasePointerCapture(e.pointerID);
  callBack(elm, e, callback);
}

function touchDown(e, callback) {
  var elm = e.currentTarget;
  if(pointerActive(elm))
    return;
  elm.setAttribute('data-rotating', 'true');
  elm.setAttribute('data-touchID', e.touches[0].identifier);
  e.preventDefault();
  callBack(elm, e.touches[0], callback);
}

function touchMove(e, callback) {
  var elm = e.currentTarget;
  if(!pointerActive(elm) || !elm.hasAttribute('data-touchID'))
    return;
  var pid = elm.getAttribute('data-touchID');
  var rect = elm.getBoundingClientRect();
  for(let i = 0; i < e.touches.length; i++)
    if(e.touches[i].identifier == pid)
      callBack(elm, e.touches[i], callback);
}

function touchUp(e, callback) {
  var elm = e.currentTarget;
  if(!pointerActive(elm))
    return;
  var pid = elm.getAttribute('data-touchID');
  var stillThere = Array.from(e.touches, function(t) { return t.identifier; }).includes(pid);
  if(!stillThere) {
    for(let i = 0; i < e.touches.length; i++)
      if(e.touches[i].identifier === elm.getAttribute(pid))
        callBack(elm, e.touches[i], callback);
    elm.removeAttribute('data-rotating');
  }
}

function pointerActive(elm) {
  return elm.hasAttribute('data-rotating');
}

function addPointerListeners(elm, fStart, fMove, fEnd) {
  elm.addEventListener('mousedown', function(e) { mouseDown(e, fStart); } );
  elm.addEventListener('mousemove', function(e) { mouseMove(e, fMove); } );
  elm.addEventListener('mouseup', function(e) { mouseUp(e, fEnd); } );

  elm.addEventListener('touchstart', function(e) { touchDown(e, fStart); } );
  elm.addEventListener('touchmove', function(e) { touchMove(e, fMove); } );
  elm.addEventListener('touchend', function(e) { touchUp(e, fEnd); } );
  elm.addEventListener('touchcancel', function(e) { touchUp(e, fEnd); } );
}
