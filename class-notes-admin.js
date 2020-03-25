'use strict';

var admin, empty;

function notesRequest(data, elm, callback) {
  var ajax = new Ajax('class-notes-admin-ajax.php',
    function(response, elm) {
      callback(response, elm);
      elm.classList.remove('changed');
    },
    function(elm) {
      elm.classList.add('warn');
    }
  );
  ajax.sendRequest(data, elm);
}

function createNote(text, elm) {
  var date = document.getElementById('date').getAttribute('data-date');
  var data = {
    'type': 'insert',
    'text': text,
    'date': date,
    'pass': admin.value
  };
  notesRequest(data, elm, function(response) {
    elm.setAttribute('data-id', response.id);
    elm.setAttribute('data-text', response.text);
    elm.innerHTML = response.html;
  });
}

function updateNote(id, text, elm) {
  var data = {
    'type': 'update',
    'id': id,
    'text': text,
    'pass': admin.value
  };
  notesRequest(data, elm, function(response) {
    elm.setAttribute('data-text', response.text);
    elm.innerHTML = response.html;
  });
}

function deleteNote(id, elm) {
  var data = {
    'type': 'delete',
    'id': id,
    'pass': admin.value
  };
  notesRequest(data, elm, function() {
    list.removeChild(elm);
  });
}

var raSave = recordsArrived;
recordsArrived = function(r) {
  raSave(r);
  document.getElementById('date').classList.remove('changed');
  appendEmpty().click();
}

createRecord = function(id, text, html) {
  var elm = document.createElement('li');
  elm.setAttribute('data-id', id);
  elm.setAttribute('data-text', text);
  elm.innerHTML = html;
  addEvents(elm);
  list.appendChild(elm);
}

function appendEmpty() {
  var clone = empty.cloneNode(true);
  addEvents(clone);
  list.appendChild(clone);
  return clone;
}

function addEventsDate(elm) {
  function onEnter(elm) {
    clearList();
    var date = document.getElementById('date');
    var re = /\d{1,2}\. ?\d{1,2}\. ?\d{4}/;
    var match;
    if(match = re.exec(date.innerText))
      date.innerText = match[0];
    date.removeAttribute('data-date');
  }

  function onLeave(elm) {
    var re = /^(\d{1,2})\. ?(\d{1,2})\. ?(\d{4})$/;
    var array;
    var array = re.exec(elm.innerText.trim());
    if(!array) {
      elm.click();
      return;
    }
    var date_sql = array[3] + '-' + array[2] + '-' + array[1];
    elm.setAttribute('data-date', date_sql);
    get_records_async(date_sql);
  }

  function onKeyDown(elm, key) {
    if(key == 13) {
      elm.blur();
      return true;
    }
  }

  makeEditable(elm, onEnter, onLeave, onLeave, null, onKeyDown);
}


function itemEnter(elm) {
  elm.setAttribute('data-html', elm.innerHTML);
  elm.innerText = elm.getAttribute('data-text');
}

function itemLeaveUnchanged(elm) {
  elm.innerHTML = elm.getAttribute('data-html');
}

function itemLeaveChanged(elm) {
  var text = elm.innerText.trim();
  var id = elm.getAttribute('data-id');
  if(!text && id) {
    deleteNote(id, elm);
  } else {
    if(id) {
      updateNote(id, text, elm);
    } else {
      createNote(text, elm);
    }
  }
}

function itemInput(elm) {
  if(elm.classList.contains('last') && !!elm.innerText.trim()) {
    elm.classList.remove('last');
    appendEmpty();
  }
}

function itemKeyDown(elm, key) {
  const ENTER = 13;
  const UP = 38;
  const DOWN = 40;
  if(key == ENTER || key == UP || key == DOWN) {
    var next = (key == UP
      ? elm.previousElementSibling
      : elm.nextElementSibling);
    if(next)
      next.click();
    return true;
  }
}

function addEvents(elm) {
  makeEditable(elm, itemEnter, itemLeaveUnchanged, itemLeaveChanged, itemInput, itemKeyDown);
}


window.addEventListener('DOMContentLoaded', function(event) {
  admin = document.getElementById('admin');
  Array.from(list.getElementsByTagName('li')).forEach(addEvents);
  empty = list.lastElementChild.cloneNode(true);
  addEventsDate(document.getElementById('date'));
});
