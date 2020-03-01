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

/***** Mouse and touch event listeners *****/

function mouseDown(e, callback) {
  if(e.button != 0)
    return;
  var elm = e.currentTarget;
  elm.setAttribute('data-rotating', 'true');
  e.currentTarget.setPointerCapture(e.pointerID);
  e.preventDefault();
  if(callback)
    callback(elm, e.offsetX, e.offsetY);
}

function mouseMove(e, callback) {
  var elm = e.currentTarget;
  if(pointerActive(elm) && callback)
    callback(elm, e.offsetX, e.offsetY);
}

function mouseUp(e, callback) {
  var elm = e.currentTarget;
  elm.removeAttribute('data-rotating');
  elm.releasePointerCapture(e.pointerID);
  if(callback)
    callback(elm, e.offsetX, e.offsetY);
}

function touchCB(elm, touch, func) {
  var rect = elm.getBoundingClientRect();
  func(elm, touch.clientX - rect.left, touch.clientY - rect.top);
}

function touchDown(e, callback) {
  var elm = e.currentTarget;
  if(pointerActive(elm))
    return;
  elm.setAttribute('data-rotating', 'true');
  elm.setAttribute('data-touchID', e.touches[0].identifier);
  e.preventDefault();
  if(callback)
    touchCB(elm, e.touches[0], callback);
}

function touchMove(e, callback) {
  var elm = e.currentTarget;
  if(!pointerActive(elm) || !elm.hasAttribute('data-touchID') || !callback)
    return;
  var pid = elm.getAttribute('data-touchID');
  var rect = elm.getBoundingClientRect();
  for(let i = 0; i < e.touches.length; i++)
    if(e.touches[i].identifier == pid)
      touchCB(elm, e.touches[i], callback);
}

function touchUp(e, callback) {
  var elm = e.currentTarget;
  if(!pointerActive(elm))
    return;
  var pid = elm.getAttribute('data-touchID');
  var stillThere = Array.from(e.touches, function(t) { return t.identifier; }).includes(pid);
  if(!stillThere) {
    if(callback) {
      for(let i = 0; i < e.touches.length; i++)
        if(e.touches[i].identifier === elm.getAttribute(pid))
          touchCB(elm, e.touches[i], callback);
    }
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
