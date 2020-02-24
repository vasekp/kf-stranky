function makeSwitch(id, callback, defaultChild) {
  children = Array.from(document.getElementById(id).getElementsByTagName('a'));
  children.forEach(function(child) {
    child.addEventListener('click', function(e) { switchClick(e.currentTarget, callback); }); });
  switchClick(children[defaultChild], callback);
}

function switchClick(element, callback) {
  Array.from(element.parentNode.getElementsByTagName('a')).forEach(function(child) {
    child.classList.remove('selected');
  });
  element.classList.add('selected');
  callback(element);
}
