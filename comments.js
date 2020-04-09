'use strict';

const STATUS_OK = 'ok';
const STATUS_INCOMPLETE = 'incomplete';
const STATUS_ALERT = 'alert';
const STATUS_FAIL = 'fail';

function findParent(elm, cls) {
  while(!elm.classList.contains(cls))
    elm = elm.parentElement;
  return elm;
}

function isAdmin() {
  return typeof(adminPass) !== 'undefined';
}

function bubbleClick(e) {
  e.preventDefault();
  var div = findParent(e.currentTarget, 'download');
  var tid = div.getAttribute('data-tid');
  var commentsDiv = document.getElementById('comments' + tid);
  if(commentsDiv) {
    commentsDiv.remove();
    updateURL(modifyQuery('comments', null));
  } else
    requestDiscussion(tid);
}

function requestDiscussion(tid, data = {}) {
  var anchor = document.getElementById('bubble' + tid);
  anchor.classList.add('loading');
  anchor.querySelector('.bubble-count').textContent = '...';
  var ajax = new Ajax('comments-ajax.php',
    commentsReceived,
    function() {
      location.replace(addToQuery('comments', tid));
    },
    1000
  );
  data['query'] = 'get';
  data['thread_ID'] = tid;
  ajax.sendRequest(data, tid);
}

function commentsReceived(response, tid) {
  updateURL(addToQuery('comments', tid));
  Array.from(document.getElementsByClassName('comments')).forEach(function(elm) {
    elm.parentElement.removeChild(elm);
  });
  var content = new DOMParser().parseFromString(response.html, 'text/html').querySelector('.comments');
  var elm = document.getElementById('download' + tid);
  elm.parentElement.insertBefore(content, elm.nextSibling);
  var anchor = document.getElementById('bubble' + tid);
  anchor.classList.remove('loading');
  findParent(anchor, 'download').setAttribute('data-count', response.count);
  elm.querySelector('.bubble-count').textContent = response.count;
  localStorageTouches(tid);

  addEventsForm(content.querySelector('form'));
  content.querySelector('textarea').focus();
}

function authKeys() {
  // Edit tools only available with JS & local storage
  if(typeof(Storage) === 'undefined')
    return null;
  function randomString() {
    var str = '';
    for(let i = 0; i < 8; i++)
      str += String.fromCharCode(97 + Math.floor(26 * Math.random()));
    return str;
  }
  if(!localStorage['comments-auth-private']) {
    localStorage['comments-auth-private'] = randomString();
    localStorage['comments-auth-public'] = randomString();
  }
  return {
    'private': localStorage['comments-auth-private'],
    'public': localStorage['comments-auth-public']
  };
}

// 1) Updates the bubble text to pull attention to new content if comments closed,
// 2) highlights new content if open,
// 3) shows edit tools where applicable,
// 4) adds local auth keys to forms.
function localStorageTouches(tid) {
  if(typeof(Storage) === 'undefined')
    return;

  var lsKey = 'comments-lastSeen-' + tid;
  var lastSeen = localStorage[lsKey] || 0;
  var divDiscuss = document.getElementById('comments' + tid);
  var divDownload = document.getElementById('download' + tid);
  var count = divDownload.getAttribute('data-count');
  if(!divDiscuss) {
    var newItems = count - lastSeen;
    if(newItems == 0)
      return;
    else if(newItems < 0) {
      localStorage[lsKey] = count; // silently adjust
      return;
    }
    var plus = divDownload.querySelector('.bubble-count-plus');
    plus.textContent = '/+' + newItems;
    return;
  } else {
    var children = divDiscuss.querySelectorAll('.item:not(.form)');
    localStorage[lsKey] = count;
    for(let i = lastSeen; i < children.length; i++)
      children[i].classList.add('new');

    // Edit tools only available with JS & local storage
    var keys = authKeys();
    if(!keys)
      return;

    var showEditTools = function(tools) {
      tools.classList.remove('hide');
      tools.querySelector('.a-edit').addEventListener('click', editClick);
      tools.querySelector('.a-delete').addEventListener('click', deleteClick);
    }

    if(isAdmin()) {
      Array.from(children).forEach(function(child) {
        let tools = child.querySelector('.edittools');
        if(tools)
          showEditTools(tools);
      });
    } else {
      if(count > 0 && children.length >= count) {
        let tools = children[count - 1].querySelector('.edittools');
        if(tools && tools.getAttribute('data-auth') == keys['public'])
          showEditTools(tools);
      }
    }

    let form = divDiscuss.querySelector('.item.form form');
    let ref = form.querySelector('#send');
    let input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'auth_private';
    input.value = keys['private'];
    form.insertBefore(input, ref);
    input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'auth_public';
    input.value = keys['public'];
    form.insertBefore(input, ref);
    if(isAdmin()) {
      input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'admin_pass';
      input.value = admin.value;
      form.insertBefore(input, ref);
    }

    let cancel = divDiscuss.querySelector('.item.form #cancel');
    if(cancel)
      cancel.addEventListener('click', cancelClick);
  }
}

function editClick(e) {
  var elm = e.currentTarget;
  var id = findParent(elm, 'item').getAttribute('data-id');
  var tid = findParent(elm, 'comments').getAttribute('data-tid');
  var keys = authKeys();
  if(!keys)
    return;
  requestDiscussion(tid, {
    'id': id,
    'auth_private': keys['private'],
    'admin_pass': isAdmin() ? admin.value : null
  });
  e.preventDefault();
}

function deleteClick(e) {
  var elm = e.currentTarget;
  var id = findParent(elm, 'item').getAttribute('data-id');
  var tid = findParent(elm, 'comments').getAttribute('data-tid');
  var keys = authKeys();
  if(!keys)
    return;
  var data = {
    'query': 'delete',
    'auth_private': keys['private'],
    'admin_pass': isAdmin() ? admin.value : null,
    'thread_ID': tid,
    'ID': id
  };
  var deleteTimeout = function() {
    requestDiscussion(tid);
  };
  elm.classList.add('loading');
  var ajax = new Ajax('comments-ajax.php', submitSuccess, deleteTimeout, 1000);
  ajax.sendRequest(data, elm);
  e.preventDefault();
}

function cancelClick(e) {
  var elm = e.currentTarget;
  var id = findParent(elm, 'item').getAttribute('data-id');
  var tid = findParent(elm, 'comments').getAttribute('data-tid');
  requestDiscussion(tid);
  e.preventDefault();
}

function onSubmit(e) {
  var elm = e.currentTarget;
  e.preventDefault();
  var data = {};
  Array.from(elm.querySelectorAll('input, textarea')).forEach(function(e) {
    data[e.name] = e.value;
  });
  elm.classList.add('loading');
  var ajax = new Ajax('comments-ajax.php', submitSuccess, submitTimeout, 1000);
  ajax.sendRequest(data, elm);
}

function submitSuccess(response, elm) {
  elm.classList.remove('loading');
  var tid = findParent(elm, 'comments').getAttribute('data-tid');
  switch(response.status) {
    case STATUS_OK: // Success
      requestDiscussion(tid);
      break;
    case STATUS_INCOMPLETE: // Missing fields
      response.missing.forEach(function(s) {
        document.getElementById(s).classList.add('missing');
      });
      if(response.attempt)
        document.getElementById('attempt').value = response.attempt;
      if(response.challenge)
        document.getElementById('challenge').innerText = response.challenge;
      break;
    case STATUS_ALERT: // Expectable error with some user-related message
      alert('Nastala chyba: ' + response.error);
      break;
    case STATUS_FAIL: // Database error
      alert('Nastala neznámá chyba. Prosím nahlaste tento výstup: ' + response.error);
      break;
  }
}

function submitTimeout(elm) {
  elm.removeEventListener('submit', onSubmit);
  elm.submit();
}

function addEventsForm(elm) {
  function removeMissing(e) {
    e.currentTarget.classList.remove('missing');
  }
  elm.addEventListener('submit', onSubmit);
  Array.from(elm.querySelectorAll('input, textarea')).forEach(function(e) {
    e.addEventListener('focus', removeMissing);
  });
}

window.addEventListener('DOMContentLoaded', function(event) {
  Array.from(document.getElementsByClassName('bubble')).forEach(function(elm) {
    var anchor = elm.querySelector('a');
    anchor.addEventListener('click', bubbleClick);

    if(typeof(Storage) === 'undefined')
      return;

    var div = findParent(elm, 'download');
    var tid = div.getAttribute('data-tid');
    localStorageTouches(tid);
  });

  Array.from(document.getElementsByTagName('form')).forEach(function(elm) {
    addEventsForm(elm);
  });
});
