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
    xhr.onload = function() {
      if(xhr.readyState != 4 || xhr.status !== 200) {
        if(this.onError)
          this.onError(callbackData);
        return;
      }
      this.onSuccess(JSON.parse(xhr.response), callbackData);
    }.bind(this);
    xhr.timeout = this.timeout;
    xhr.ontimeout = function() {
      this.onTimeout(callbackData);
    }.bind(this);
    xhr.send(xhrData);
  };
}

function modifyQuery(key, func) {
  var split = splitQuery();
  var params = split.params;
  if(func)
    params[key] = func(params[key]);
  else
    delete params.key;
  var queryArray = [];
  for(key in params)
    queryArray.push(key + '=' + params[key]);
  return '?' + queryArray.join('&');
}

function addToQuery(key, val) {
  return modifyQuery(key, function() { return val; });
}

function splitQuery() {
  var querySplit = document.URL.split('?');
  var params = {};
  if(querySplit.length > 1) {
    var queryParts = querySplit[1].split('&');
    for(let i = 0; i < queryParts.length; i++) {
      let keyVal = queryParts[i].split('=');
      params[keyVal[0]] = keyVal[1];
    }
  }
  return {
    'base': querySplit[0],
    'params': params
  };
}

function updateURL(url) {
  history.replaceState(null, '', url);
  var otherLang = function(l) {
    return l === 'en' ? 'cz' : 'en';
  };
  document.getElementById('flag').href = modifyQuery('l', otherLang);
}

function forEach(iterable, fn) {
  for(let i = 0; i < iterable.length; i++)
    fn(iterable[i]);
}

function toggleClass(classList, cls, force) {
  if(force)
    classList.add(cls);
  else
    classList.remove(cls);
}
