'use strict';

function applyFilter(filter) {
  forEach(document.getElementById('list').children, function(e) {
    if(filter === 'all')
      e.classList.remove('hide');
    else {
      e.classList.add('hide');
      var sets = e.getAttribute('data-sets').split(' ');
      for(let i = 0; i < sets.length; i++)
        if(sets[i] === filter) {
          e.classList.remove('hide');
          break;
        }
    }
  });
};

window.addEventListener('DOMContentLoaded', function(event) {
  var filter = splitQuery().params.filter || 'selected';
  makeSwitch('pub-filter', function(elm) { applyFilter(elm.id); }, filter);
});
