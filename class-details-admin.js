var admin;

function detailsRequest(data, elm, callback) {
  var ajax = new Ajax('classes-admin-ajax.php', function(response, elm) {
    callback(response, elm);
    elm.classList.remove('changed');
  });
  ajax.onError = ajax.onTimeout = function(elm) {
    elm.innerHTML = elm.innerText.trim();
    elm.classList.add('warn');
  }
  ajax.sendRequest(data, elm);
}

function updateText(elm) {
  var text = elm.innerText.trim();
  var data = {
    'type': 'html',
    'which': elm.id,
    'text': text,
    'pass': admin.value
  };
  detailsRequest(data, elm, function() {
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
}

window.addEventListener('DOMContentLoaded', function(event) {
  admin = document.getElementById('admin');
  addEvents(document.getElementById('intro'));
  addEvents(document.getElementById('announces'));
});
