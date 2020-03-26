'use strict';

var admin;

var detailsAjax = new Ajax('class-details-admin-ajax.php',
  function(response, elm) {
    elm.innerHTML = elm.innerText.trim();
    elm.classList.remove('changed');
  },
  function(elm) {
    elm.innerHTML = elm.innerText.trim();
    elm.classList.add('warn');
  }
);

function updateText(elm) {
  var text = elm.innerText.trim();
  var data = {
    'which': elm.id,
    'text': text,
    'pass': admin.value
  };
  detailsAjax.sendRequest(data, elm);
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
