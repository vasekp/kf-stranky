'use strict';

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
    'class_ID': classID,
    'field': elm.id,
    'text': text,
    'pass': adminPass
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

function fileSelected(e) {
  var elm = e.currentTarget;
  elm.labels[0].firstElementChild.classList.remove('empty');
  var button = elm.form.querySelector('#upload-submit');
  if(button)
    button.disabled = false;
}

window.addEventListener('DOMContentLoaded', function(event) {
  addEvents(document.getElementById('intro'));
  addEvents(document.getElementById('announces'));
  Array.from(document.querySelectorAll('input[type="file"]')).forEach(function(elm) {
    elm.addEventListener('input', fileSelected);
  });
});
