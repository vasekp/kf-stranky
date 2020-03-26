'use strict';

function applyFilter(filter) {
  Array.from(document.getElementById('list').children).forEach(function(e) {
    var show = filter == 'all' || e.getAttribute('data-sets').split(' ').includes(filter);
    e.classList.toggle('hide', !show);
  });
};

window.addEventListener('DOMContentLoaded', function(event) {
  var url = new URL(document.URL);
  var sp = new URLSearchParams(url.search);
  makeSwitch('pub-filter', function(elm) { applyFilter(elm.id); }, sp.get('filter') || 'selected');
});
