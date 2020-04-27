'use strict';

function applyFilter(filter) {
  forEach(document.getElementById('list').children, function(e) {
    var show = filter == 'all' || e.getAttribute('data-sets').split(' ').includes(filter);
    e.classList.toggle('hide', !show);
  });
};

window.addEventListener('DOMContentLoaded', function(event) {
  var filter = splitQuery().params.filter || 'selected';
  makeSwitch('pub-filter', function(elm) { applyFilter(elm.id); }, filter);
});
