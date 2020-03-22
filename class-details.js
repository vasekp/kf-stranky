function sendRequest(elm, data, callback, errorCallback, timeoutCallback) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'class-discussion-ajax.php', true);
  var xhrData = new FormData();
  for(item in data)
    xhrData.append(item, data[item]);
  xhr.responseType = 'json';
  xhr.onload = function() {
    if(xhr.status !== 200) {
      if(errorCallback)
        errorCallback(elm);
      return;
    }
    callback(elm, xhr.response);
  };
  if(timeoutCallback) {
    xhr.timeout = 500;
    xhr.ontimeout = function() { timeoutCallback(elm); };
  }
  xhr.send(xhrData);
}

function addToQuery(key, val) {
  var url = new URL(document.URL);
  var sp = new URLSearchParams(url.search);
  sp.set(key, val);
  url.search = sp;
  return url;
}

function downloadParent(elm) {
  while(!elm.classList.contains('download'))
    elm = elm.parentElement;
  return elm;
}

function bubbleClick(e) {
  e.preventDefault();
  var elm = e.currentTarget;
  var pelm = downloadParent(elm);
  var id = pelm.getAttribute('data-id');
  if(document.getElementById('discussion' + id))
    return;
  requestDiscussion(id);
}

function requestDiscussion(dldid) {
  function timeOut() {
    window.location.replace(document.getElementById('bubble' + dldid).href);
  }
  sendRequest(dldid, { 'query': 'get', 'dld_ID': dldid }, discussionReceived, timeOut, timeOut);
}

function discussionReceived(dldid, response) {
  Array.from(document.getElementsByClassName('discussion')).forEach(function(elm) {
    elm.parentElement.removeChild(elm);
  });
  var content = new DOMParser().parseFromString(response.html, 'text/html').getElementsByClassName('discussion')[0];

  addEventsForm(content.getElementsByTagName('form')[0]);

  var elm = document.getElementById('download' + dldid);
  elm.parentElement.insertBefore(content, elm.nextSibling);
  elm.getElementsByTagName('text')[0].textContent = response.count ? response.count : '';
}

function onSubmit(e) {
  var elm = e.currentTarget;
  e.preventDefault();
  var data = {};
  Array.from(elm.getElementsByTagName('input')).forEach(function(e) {
    data[e.name] = e.value;
  });
  data['text'] = elm.getElementsByTagName('textarea')[0].value;
  data['query'] = 'submit';
  sendRequest(elm, data, submitSuccess, submitTimeout, submitTimeout);
}

function submitSuccess(elm, response) {
  switch(response.status) {
    case 0: // Success
      requestDiscussion(response.dldid);
      break;
    case 1: // Missing fields
      response.missing.forEach(function(s) {
        document.getElementById(s).classList.add('missing');
      });
      document.getElementById('attempt').value = response.attempt;
      if(response.challenge)
        document.getElementById('challenge').innerText = response.challenge;
      break;
    case 2: // Database error
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
  Array.from(elm.getElementsByTagName('input')).forEach(function(e) {
    e.addEventListener('focus', removeMissing);
  });
  elm.getElementsByTagName('textarea')[0].addEventListener('focus', removeMissing);
}

window.addEventListener('DOMContentLoaded', function(event) {
  Array.from(document.getElementsByClassName('bubble')).forEach(function(elm) {
    var anchor = elm.getElementsByTagName('a')[0];
    anchor.addEventListener('click', bubbleClick);

    /*const xmlns = 'http://www.w3.org/2000/svg';
    var textElm = elm.getElementsByTagName('text')[0];
    textElm.textContent = textElm.textContent.trim();
    if(!textElm.textContent)
      return;
    var newChild = document.createElementNS(xmlns, 'tspan');
    newChild.setAttributeNS(null, 'fill', 'red');
    newChild.appendChild(document.createTextNode('/+1'));
    textElm.appendChild(newChild, textElm);*/
  });

  Array.from(document.getElementsByTagName('form')).forEach(function(elm) {
    addEventsForm(elm);
  });
});
