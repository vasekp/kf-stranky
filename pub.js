function applyFilter(filter) {
  Array.from(document.getElementById('list').children).forEach(function(e) {
    show = filter == 'all' || e.getAttribute('data-sets').split(' ').includes(filter);
    e.classList.toggle('hide', !show);
  });
};

window.addEventListener('DOMContentLoaded', function(event) {
  document.getElementById('pub-filter').classList.remove('hide');
  makeSwitch('pub-filter', function(elm) { applyFilter(elm.getAttribute('data-set')); }, 0);
});
