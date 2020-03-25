'use strict';

function applyFilter(element) {
  Array.from(document.getElementsByClassName('filter')).forEach(function(e) {
    var show = e.classList.contains("f-" + element.id);
    if(show)
      e.classList.remove('hide');
    else
      e.classList.add('hide');
  });
};

window.addEventListener('DOMContentLoaded', function(event) {
  document.getElementById('pub-filter').classList.remove('hide');
  makeSwitch('pub-filter', applyFilter, 0);
});
