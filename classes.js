function sendRequest(elm, type, id, text) {
  let xhr = new XMLHttpRequest();
  xhr.open('POST', 'class-notes-ajax.php', true);
  let data = new FormData();
  data.append('type', type);
  data.append('id', id);
  data.append('date', document.getElementById('date').getAttribute('data-date'));
  data.append('text', text);
  xhr.responseType = 'json';
  xhr.onload = function() {
    if(xhr.status !== 200) {
      elm.classList.add('warn');
      return;
    }
    if(type === 'insert')
      elm.setAttribute('data-id', xhr.response.id);
    elm.classList.remove('changed');
  }
  xhr.send(data);
}

function newDatePrepare() {
  while(list.firstChild)
    list.removeChild(list.firstChild);
  let date = document.getElementById('date');
  date.innerText = '';
  date.removeAttribute('data-date');
  date.contentEditable = 'true';
  date.focus();
}

function newDateEntered() {
  let re = /^(\d{1,2})\. ?(\d{1,2})\. ?(\d{4})$/;
  let array;
  let date = document.getElementById('date');
  if(array = re.exec(date.innerText.trim())) {
    date.setAttribute('data-date', array[3] + '-' + array[2] + '-' + array[1]);
    date.contentEditable = 'false';
    let clone = empty.cloneNode(true);
    addEvents(clone);
    list.appendChild(clone);
    clone.click();
  }
}

function dateKeyDown(e) {
  if(e.keyCode == 13) {
    e.currentTarget.blur();
    e.preventDefault();
  }
}

function toBraces(elm) {
  Array.from(elm.getElementsByClassName('litref')).forEach(function(child) {
    elm.replaceChild(document.createTextNode('{' + child.innerText + '}'), child); });
}

function fromBraces(elm) {
  let text = elm.innerText.trim();
  let re = /{([^}]*)}/;
  let match;
  while(elm.firstChild)
    elm.removeChild(elm.firstChild);
  while(match = re.exec(text)) {
    if(match.index > 0)
      elm.appendChild(document.createTextNode(text.substr(0, match.index)));
    let span = document.createElement('span');
    span.classList.add('litref');
    span.innerText = match[1];
    elm.appendChild(span);
    text = text.substr(match.index + match[0].length);
  }
  if(text)
    elm.appendChild(document.createTextNode(text));
}

function itemClick(e) {
  let elm = e.currentTarget;
  toBraces(elm);
  elm.contentEditable = 'true';
  elm.focus();
}

function itemBlur(e) {
  let elm = e.currentTarget;
  let text = elm.innerText.trim();
  elm.contentEditable = 'false';
  fromBraces(elm);
  if(!elm.classList.contains('last') && !text) {
    if(elm.getAttribute('data-id'))
      sendRequest(elm, 'delete', elm.getAttribute('data-id'));
    list.removeChild(elm);
  } else if(text && elm.classList.contains('changed')) {
    if(elm.getAttribute('data-id'))
      sendRequest(elm, 'update', elm.getAttribute('data-id'), text);
    else {
      sendRequest(elm, 'insert', '', text);
    }
  }
}

function itemInput(e) {
  let elm = e.currentTarget;
  elm.classList.add('changed');
  if(elm.classList.contains('last') && !!elm.innerText.trim()) {
    elm.classList.remove('last');
    let clone = empty.cloneNode(true);
    addEvents(clone);
    list.appendChild(clone);
  }
}

function itemKeyDown(e) {
  if(e.keyCode == 13 || e.keyCode == 38 || e.keyCode == 40) {
    let next = (e.keyCode == 38
      ? e.currentTarget.previousElementSibling
      : e.currentTarget.nextElementSibling);
    if(next)
      next.click();
    e.preventDefault();
  }
}

function addEvents(elm) {
  elm.classList.add('edit');
  elm.addEventListener('click', itemClick);
  elm.addEventListener('blur', itemBlur);
  elm.addEventListener('input', itemInput);
  elm.addEventListener('keydown', itemKeyDown);
}

let list, empty;
let newId = 3;

window.addEventListener('DOMContentLoaded', function(event) {
  list = document.getElementById('list');
  Array.from(list.getElementsByTagName('li')).forEach(addEvents);
  empty = list.lastElementChild.cloneNode(true);
  document.getElementById('date').addEventListener('keydown', dateKeyDown);
  document.getElementById('date').addEventListener('blur', newDateEntered);
  document.getElementById('date').addEventListener('click', newDatePrepare);
});
