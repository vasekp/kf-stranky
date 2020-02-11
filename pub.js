filterClicked = function(element) {
  Array.from(element.parentNode.getElementsByTagName('a')).forEach(function(child) {
    child.classList.remove('selected');
  });
  element.classList.add('selected');
  applyFilter(element.id);
}

filterEvent = function(event) {
  filterClicked(event.currentTarget);
}

applyFilter = function(id) {
  Array.from(document.getElementsByClassName('filter')).forEach(function(element) {
    show = element.classList.contains("f-" + id);
    if(show)
      element.classList.remove('hide');
    else
      element.classList.add('hide');
  });
};

window.addEventListener('DOMContentLoaded', function(event) {
  document.getElementById('pub-filter').classList.remove('hide');
  Array.from(document.getElementById('pub-filter').getElementsByTagName('a')).forEach(function(child) {
    child.addEventListener('click', filterEvent);
  });
  filterClicked(document.getElementById('selected'));
});
