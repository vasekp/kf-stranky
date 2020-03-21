/*function sendRequest(elm, data, callback) {
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
}*/

/*function editableKeyDown(callback) {
  return function(e) {
    if(callback)
      if(callback(e.currentTarget, e.keyCode))
        e.preventDefault();
  };
}*/

/*function makeEditable(elm, enterCB, leaveUnchangedCB, leaveChangedCB, inputCB, keyDownCB) {
  elm.classList.add('edit');
  elm.addEventListener('click', editableClick(enterCB));
  elm.addEventListener('blur', editableBlur(leaveChangedCB, leaveUnchangedCB));
  elm.addEventListener('input', editableInput(inputCB));
  elm.addEventListener('keydown', editableKeyDown(keyDownCB));
}*/

/*function updateText(elm) {
  var text = elm.innerText.trim();
  var data = {
    'type': 'html',
    'which': elm.id,
    'text': text,
    'pass': admin.value
  };
  sendRequest(elm, data, function() {
    elm.innerHTML = elm.innerText.trim();
  });
}

function addEvents(elm) {
  elm.classList.add('html');
  function onEnter(elm) {
    elm.innerText = elm.innerHTML.trim();
  };
  function onLeaveUnchanged(elm) {
    elm.innerHTML = elm.innerText.trim();
  }
  makeEditable(elm, onEnter, onLeaveUnchanged, updateText, null, null);
}*/

window.addEventListener('DOMContentLoaded', function(event) {
  /*admin = document.getElementById('admin');
  addEvents(document.getElementById('intro'));
  addEvents(document.getElementById('announces'));*/
  Array.from(document.getElementsByClassName('bubble')).forEach(function(elm) {
    const xmlns = 'http://www.w3.org/2000/svg';
    var textElm = elm.getElementsByTagName('text')[0];
    textElm.textContent = textElm.textContent.trim();
    if(!textElm.textContent)
      return;
    var newChild = document.createElementNS(xmlns, 'tspan');
    newChild.setAttributeNS(null, 'fill', 'red');
    newChild.appendChild(document.createTextNode('/+1'));
    textElm.appendChild(newChild, textElm);
  });
});
