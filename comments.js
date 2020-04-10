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

function findHost(elm) {
  return findParent(elm, 'comments-host');
}

function findContainer(elm) {
  return findHost(elm).querySelector('.comments-container');
}

function getID(elm) {
  return findParent(elm, 'item').getAttribute('data-id');
}

function getTID(elm) {
  return findHost(elm).getAttribute('data-tid');
}

function isAdmin() {
  return typeof(adminPass) !== 'undefined';
}

function bubbleClick(e) {
  e.preventDefault();
  var elm = e.currentTarget;
  var cont = findContainer(elm);
  if(cont.children.length > 0) {
    while(cont.firstChild)
      cont.removeChild(cont.firstChild);
    updateURL(modifyQuery('comments', null));
  } else
    requestDiscussion(getTID(elm));
}

function requestDiscussion(tid, data = {}) {
  var host = document.querySelector('.comments-host[data-tid="' + tid + '"]');
  var bubble = host.querySelector('.comments-bubble');
  bubble.classList.add('loading');
  bubble.querySelector('.bubble-count').textContent = '...';
  bubble.querySelector('.bubble-count-plus').textContent = '';
  host.setAttribute('data-count', '');
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
  Array.from(document.getElementsByClassName('comments-container')).forEach(function(elm) {
    while(elm.firstChild)
      elm.removeChild(elm.firstChild);
  });
  var host = document.querySelector('.comments-host[data-tid="' + tid + '"]');
  var content = new DOMParser().parseFromString(response.html, 'text/html').body;
  var container = host.querySelector('.comments-container');
  while(content.firstChild) {
    var child = content.firstChild;
    content.removeChild(child);
    container.appendChild(child);
  }
  var bubble = host.querySelector('.comments-bubble');
  bubble.classList.remove('loading');
  bubble.querySelector('.bubble-count').textContent = response.count;
  host.setAttribute('data-count', response.count);
  localStorageTouches(host);

  addEventsForm(container.querySelector('form'));
  container.querySelector('textarea').focus();
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
function localStorageTouches(host) {
  if(typeof(Storage) === 'undefined')
    return;

  var tid = host.getAttribute('data-tid');
  var lsKey = 'comments-lastSeen-' + tid;
  var lsKeyOld = 'discussion-lastSeen-' + tid;
  var lastSeen = localStorage[lsKey] || localStorage[lsKeyOld] || 0;
  var count = host.getAttribute('data-count');
  var container = host.querySelector('.comments-container');
  if(container.children.length == 0) {
    var newItems = count - lastSeen;
    if(newItems == 0)
      return;
    else if(newItems < 0) {
      localStorage[lsKey] = count; // silently adjust
      return;
    }
    var plus = host.querySelector('.bubble-count-plus');
    plus.textContent = '/+' + newItems;
  } else {
    var children = container.querySelectorAll('.item:not(.form)');
    localStorage[lsKey] = count;
    for(let i = lastSeen; i < children.length; i++)
      children[i].classList.add('new');

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

    let form = container.querySelector('form');
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
    let cancel = form.querySelector('#cancel');
    if(cancel)
      cancel.addEventListener('click', cancelClick);
  }
}

function editClick(e) {
  var elm = e.currentTarget;
  var keys = authKeys();
  if(!keys)
    return;
  requestDiscussion(getTID(elm), {
    'edit_id': getID(elm),
    'auth_private': keys['private'],
    'admin_pass': isAdmin() ? admin.value : null
  });
  e.preventDefault();
}

function deleteClick(e) {
  var elm = e.currentTarget;
  var tid = getTID(elm);
  var keys = authKeys();
  if(!keys)
    return;
  var data = {
    'query': 'delete',
    'auth_private': keys['private'],
    'admin_pass': isAdmin() ? admin.value : null,
    'thread_ID': tid,
    'ID': getID(elm)
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
  requestDiscussion(getTID(elm));
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
  switch(response.status) {
    case STATUS_OK: // Success
      requestDiscussion(getTID(elm));
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
  Array.from(document.getElementsByClassName('comments-bubble')).forEach(function(elm) {
    elm.querySelector('a').addEventListener('click', bubbleClick);
    localStorageTouches(findHost(elm));
  });

  Array.from(document.getElementsByTagName('form')).forEach(function(elm) {
    addEventsForm(elm);
  });
});
