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
    element.style.display = element.classList.contains("f-" + id) ? "list-item" : "none";
  });
};

window.addEventListener('DOMContentLoaded', function(event) {
  Array.from(document.getElementById('filter').getElementsByTagName('a')).forEach(function(child) {
    child.addEventListener('click', filterEvent);
  });
  filterClicked(document.getElementById('selected'));
});
