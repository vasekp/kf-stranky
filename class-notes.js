var swtch, list;

function get_records_async(date_sql) {
  list.classList.add('loading');
  swtch.classList.add('loading');
  var ajax = new Ajax('class-notes-ajax.php', recordsArrived);
  ajax.onError = ajax.onTimeout = function() {
    window.location.replace(addToQuery('date', date_sql));
  }
  ajax.sendRequest({
    'type': 'get',
    'date': date_sql
  });
}

function recordsArrived(r) {
  list.classList.remove('loading');
  swtch.classList.remove('loading');
  var elm = document.getElementById('date');
  elm.innerText = r.date_text;
  elm.setAttribute('data-date', r.date);
  elm = document.getElementById('prev');
  if(r.date_prev) {
    elm.setAttribute('href', addToQuery('date', r.date_prev));
    elm.setAttribute('data-date', r.date_prev);
  } else {
    elm.removeAttribute('href');
    elm.removeAttribute('data-date');
  }
  elm = document.getElementById('next');
  if(r.date_next) {
    elm.setAttribute('href', addToQuery('date', r.date_next));
    elm.setAttribute('data-date', r.date_next);
  } else {
    elm.removeAttribute('href');
    elm.removeAttribute('data-date');
  }
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
  var date = e.currentTarget.getAttribute('data-date');
  if(!date)
    return;
  e.preventDefault();
  datePick(date);
}

function addEventsArrow(elm) {
  if(!elm)
    return;
  elm.addEventListener('click', arrowClick);
}

window.addEventListener('DOMContentLoaded', function(event) {
  swtch = document.getElementById('date-buttons');
  list = document.getElementById('list');
  addEventsArrow(document.getElementById('prev'));
  addEventsArrow(document.getElementById('next'));
});
