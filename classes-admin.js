function sendRequest(elm, data, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'classes-admin-ajax.php', true);
  var xhrData = new FormData();
  for(item in data)
    xhrData.append(item, data[item]);
  xhr.responseType = 'json';
  xhr.onload = function() {
    if(xhr.status !== 200) {
      elm.classList.add('warn');
      return;
    }
    callback(elm, xhr.response);
    elm.classList.remove('changed');
  };
  xhr.send(xhrData);
}

function editableClick(callback) {
  return function(e) {
    var elm = e.currentTarget;
    if(elm.contentEditable === 'true')
      return;
    if(callback)
      callback(elm);
    elm.contentEditable = 'true';
    elm.focus();
  };
}

function editableBlur(changedCB, unchangedCB) {
  return function(e) {
    var elm = e.currentTarget;
    elm.contentEditable = 'false';
    if(elm.classList.contains('changed')) {
      if(changedCB)
        changedCB(elm);
    } else {
      if(unchangedCB)
        unchangedCB(elm);
    }
  };
}

function editableInput(callback) {
  return function(e) {
    var elm = e.currentTarget;
    elm.classList.add('changed');
    if(callback)
      callback(elm);
  }
}

function editableKeyDown(callback) {
  return function(e) {
    if(callback)
      if(callback(e.currentTarget, e.keyCode))
        e.preventDefault();
  };
}

function makeEditable(elm, enterCB, leaveUnchangedCB, leaveChangedCB, inputCB, keyDownCB) {
  elm.classList.add('edit');
  elm.addEventListener('click', editableClick(enterCB));
  elm.addEventListener('blur', editableBlur(leaveChangedCB, leaveUnchangedCB));
  elm.addEventListener('input', editableInput(inputCB));
  elm.addEventListener('keydown', editableKeyDown(keyDownCB));
}
