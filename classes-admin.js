var admin, empty;

function sendRequest(elm, type, id, text) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'class-notes-ajax.php', true);
  var data = new FormData();
  data.append('type', type);
  data.append('id', id);
  data.append('date', document.getElementById('date').getAttribute('data-date'));
  data.append('text', text);
  data.append('pass', admin.value);
  xhr.responseType = 'json';
  xhr.onload = function() {
    if(xhr.status !== 200) {
      elm.classList.add('warn');
      return;
    }
    if(type === 'insert')
      elm.setAttribute('data-id', xhr.response.id);
    if(type == 'insert' || type == 'update') {
      elm.setAttribute('data-text', xhr.response.text);
      elm.innerHTML = xhr.response.html;
    }
    elm.classList.remove('changed');
  };
  xhr.send(data);
}

var raSave = recordsArrived;
recordsArrived = function(r) {
  raSave(r);
  appendEmpty();
}

createRecord = function(id, text, html) {
  elm = document.createElement('li');
  elm.setAttribute('data-id', id);
  elm.setAttribute('data-text', text);
  elm.innerHTML = html;
  addEventsItem(elm);
  list.appendChild(elm);
}

function appendEmpty() {
  var clone = empty.cloneNode(true);
  addEventsItem(clone);
  list.appendChild(clone);
  return clone;
}

function newDatePrepare() {
  clearList();
  var date = document.getElementById('date');
  var re = /\d{1,2}\. ?\d{1,2}\. ?\d{4}/;
  var match;
  if(match = re.exec(date.innerText))
    date.innerText = match[0];
  date.removeAttribute('data-date');
  date.contentEditable = 'true';
  date.focus();
}

function newDateEntered() {
  var re = /^(\d{1,2})\. ?(\d{1,2})\. ?(\d{4})$/;
  var array;
  var date = document.getElementById('date');
  if(array = re.exec(date.innerText.trim())) {
    var date_sql = array[3] + '-' + array[2] + '-' + array[1];
    date.setAttribute('data-date', date_sql);
    date.contentEditable = 'false';
    get_records_async(date_sql);
    var clone = appendEmpty();
    clone.click();
  }
}

function dateKeyDown(e) {
  if(e.keyCode == 13) {
    e.currentTarget.blur();
    e.preventDefault();
  }
}

function itemClick(e) {
  var elm = e.currentTarget;
  if(elm.contentEditable === 'true')
    return;
  elm.setAttribute('data-html', elm.innerHTML);
  elm.innerText = elm.getAttribute('data-text');
  elm.contentEditable = 'true';
  elm.focus();
}

function itemBlur(e) {
  var elm = e.currentTarget;
  var text = elm.innerText.trim();
  elm.contentEditable = 'false';
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
  } else if(text) {
    elm.innerHTML = elm.getAttribute('data-html');
  }
}

function itemInput(e) {
  var elm = e.currentTarget;
  elm.classList.add('changed');
  if(elm.classList.contains('last') && !!elm.innerText.trim()) {
    elm.classList.remove('last');
    var clone = empty.cloneNode(true);
    addEventsItem(clone);
    list.appendChild(clone);
  }
}

function itemKeyDown(e) {
  if(e.keyCode == 13 || e.keyCode == 38 || e.keyCode == 40) {
    var next = (e.keyCode == 38
      ? e.currentTarget.previousElementSibling
      : e.currentTarget.nextElementSibling);
    if(next)
      next.click();
    e.preventDefault();
  }
}

function addEventsItem(elm) {
  elm.classList.add('edit');
  elm.addEventListener('click', itemClick);
  elm.addEventListener('blur', itemBlur);
  elm.addEventListener('input', itemInput);
  elm.addEventListener('keydown', itemKeyDown);
}

window.addEventListener('DOMContentLoaded', function(event) {
  admin = document.getElementById('admin');
  Array.from(list.getElementsByTagName('li')).forEach(addEventsItem);
  empty = list.lastElementChild.cloneNode(true);
  document.getElementById('date').addEventListener('keydown', dateKeyDown);
  document.getElementById('date').addEventListener('blur', newDateEntered);
  document.getElementById('date').addEventListener('click', newDatePrepare);
});
