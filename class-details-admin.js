var admin, empty;

function sendRequest(elm, type, text) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'class-details-ajax.php', true);
  var data = new FormData();
  data.append('type', type);
  data.append('text', text);
  data.append('pass', admin.value);
  xhr.onload = function() {
    if(xhr.status !== 200) {
      elm.classList.add('warn');
      return;
    }
    elm.classList.remove('changed');
    elm.innerHTML = text;
  };
  xhr.send(data);
}

function itemClick(e) {
  var elm = e.currentTarget;
  if(elm.contentEditable === 'true')
    return;
  elm.innerText = elm.innerHTML.trim();
  elm.contentEditable = 'true';
  elm.focus();
}

function itemBlur(e) {
  var elm = e.currentTarget;
  var text = elm.innerText.trim();
  elm.contentEditable = 'false';
  if(elm.classList.contains('changed')) {
    sendRequest(elm, elm.id, text);
  } else {
    elm.innerHTML = text;
  }
}

function itemInput(e) {
  var elm = e.currentTarget;
  elm.classList.add('changed');
}

function itemKeyDown(e) {
}

function addEvents(elm) {
  elm.classList.add('edit');
  elm.classList.add('html');
  elm.addEventListener('click', itemClick);
  elm.addEventListener('blur', itemBlur);
  elm.addEventListener('input', itemInput);
  elm.addEventListener('keydown', itemKeyDown);
}

window.addEventListener('DOMContentLoaded', function(event) {
  admin = document.getElementById('admin');
  addEvents(document.getElementById('intro'));
  addEvents(document.getElementById('announces'));
});
