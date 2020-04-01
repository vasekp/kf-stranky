'use strict';

function Ajax(url, onSuccess, onError, timeout) {
  this.url = url;

  this.onSuccess = onSuccess;
  this.onError = this.onTimeout = onError;
  this.timeout = timeout || 500;

  this.sendRequest = function(requestData, callbackData) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', this.url, true);
    var xhrData = new FormData();
    for(let item in requestData)
      xhrData.append(item, requestData[item]);
    xhr.responseType = 'json';
    xhr.onload = function() {
      if(xhr.readyState != 4 || xhr.status !== 200) {
        if(this.onError)
          this.onError(callbackData);
        return;
      }
      this.onSuccess(xhr.response, callbackData);
    }.bind(this);
    xhr.timeout = this.timeout;
    xhr.ontimeout = function() {
      this.onTimeout(callbackData);
    }.bind(this);
    xhr.send(xhrData);
  };
}

function modifyQuery(key, func) {
  var url = new URL(document.URL);
  var sp = new URLSearchParams(url.search);
  if(func)
    sp.set(key, func(sp.get(key)));
  else
    sp.delete(key);
  url.search = sp;
  return url;
}

function addToQuery(key, val) {
  return modifyQuery(key, function() { return val; });
}

function updateURL(url) {
  history.replaceState(null, '', url);
  var otherLang = function(l) {
    return l === 'en' ? 'cz' : 'en';
  };
  document.getElementById('flag').href = modifyQuery('l', otherLang);
}
