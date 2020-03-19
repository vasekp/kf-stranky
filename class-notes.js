var swtch, list;

function get_records_async(date_sql) {
  list.classList.add('loading');
  swtch.classList.add('loading');
  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'class-notes-ajax.php', true);
  var data = new FormData();
  data.append('type', 'get');
  data.append('date', date_sql);
  xhr.responseType = 'json';
  xhr.onload = function() {
    if(xhr.readyState != 4 || xhr.status !== 200)
      return;
    recordsArrived(xhr.response);
    list.classList.remove('loading');
    swtch.classList.remove('loading');
  };
  xhr.ontimeout = function() {
    var url = new URL(document.URL);
    var sp = new URLSearchParams(url.search);
    sp.set('date', date_sql);
    url.search = sp;
    window.location.replace(url);
  }
  xhr.timeout = 500;
  xhr.send(data);
}

function recordsArrived(r) {
  var elm = document.getElementById('date');
  elm.innerText = r.date_text;
  elm.setAttribute('data-date', r.date);
  elm = document.getElementById('prev');
  if(r.date_prev) {
    elm.setAttribute('href', '#');
    elm.setAttribute('data-date', r.date_prev);
  } else
    elm.removeAttribute('href');
  elm = document.getElementById('next');
  if(r.date_next) {
    elm.setAttribute('href', '#');
    elm.setAttribute('data-date', r.date_next);
  } else
    elm.removeAttribute('href');
  clearList();
  r.records.forEach(function(row) {
    createRecord(row.id, row.text, row.html);
  });
  document.getElementById('modtime').innerText = r.mod_text;
}

function clearList() {
  while(list.firstChild)
    list.removeChild(list.firstChild);
}

function createRecord(id, text, html) {
  elm = document.createElement('li');
  elm.innerHTML = html;
  list.appendChild(elm);
}

function datePick(date) {
  if(!date)
    return;
  document.getElementById('date').contentEditable = 'false';
  get_records_async(date);
}

function arrowClick(e) {
  datePick(e.currentTarget.getAttribute('data-date'));
  e.preventDefault();
}

function addEventsArrow(elm) {
  if(!elm)
    return;
  if(elm.hasAttribute('href'))
    elm.href = '#';
  elm.addEventListener('click', arrowClick);
}

window.addEventListener('DOMContentLoaded', function(event) {
  swtch = document.getElementById('date-buttons');
  list = document.getElementById('list');
  addEventsArrow(document.getElementById('prev'));
  addEventsArrow(document.getElementById('next'));
});
