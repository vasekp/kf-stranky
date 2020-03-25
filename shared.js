function Ajax(url, onSuccess) {
  this.url = url;

  this.onSuccess = onSuccess;

  this.sendRequest = function(requestData, callbackData) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', this.url, true);
    var xhrData = new FormData();
    for(item in requestData)
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
    if(this.onTimeout) {
      xhr.timeout = this.timeout || 500;
      xhr.ontimeout = function() {
        this.onTimeout(callbackData);
      }.bind(this);
    }
    xhr.send(xhrData);
  };
}

function addToQuery(key, val) {
  var url = new URL(document.URL);
  var sp = new URLSearchParams(url.search);
  sp.set(key, val);
  url.search = sp;
  return url;
}
