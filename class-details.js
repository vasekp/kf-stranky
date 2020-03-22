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
    xhr.ontimeout = timeoutCallback;
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
  function timeOut() {
    window.location.replace(elm.href);
  }
  var pelm = downloadParent(elm);
  var id = pelm.getAttribute('data-id');
  if(document.getElementById('discussion' + id))
    return;
  sendRequest(pelm, { 'dld_ID' : id }, discussionReceived, timeOut, timeOut);
}

function discussionReceived(elm, response) {
  Array.from(document.getElementsByClassName('discussion')).forEach(function(elm) {
    elm.parentElement.removeChild(elm);
  });
  var content = new DOMParser().parseFromString(response.html, 'text/html').getElementsByClassName('discussion')[0];
  elm.parentElement.insertBefore(content, elm.nextSibling);
  elm.getElementsByTagName('text')[0].textContent = response.count ? response.count : '';
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
});
