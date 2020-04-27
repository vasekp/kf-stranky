'use strict';

function applyFilter(filter) {
  forEach(document.getElementById('list').children, function(e) {
    if(filter === 'all')
      e.classList.remove('hide');
    else {
      var show = false;
      var sets = e.getAttribute('data-sets').split(' ');
      for(let i = 0; i < sets.length; i++)
        if(sets[i] === filter) {
          show = true;
          break;
        }
      e.classList.toggle('hide', !show);
    }
  });
};

window.addEventListener('DOMContentLoaded', function(event) {
  var filter = splitQuery().params.filter || 'selected';
  makeSwitch('pub-filter', function(elm) { applyFilter(elm.id); }, filter);
});
