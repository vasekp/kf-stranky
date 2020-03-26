function makeSwitch(id, callback, defaultChoice) {
  children = Array.from(document.getElementById(id).getElementsByTagName('a'));
  children.forEach(function(child) {
    child.addEventListener('click', function(e) { switchClick(e.currentTarget, callback); e.preventDefault(); }); });
  var active;
  if(!isNaN(defaultChoice))
    active = children[defaultChoice];
  else if(defaultChoice)
    active = document.getElementById(defaultChoice);
  if(active)
    switchClick(active, callback);
}

function switchClick(element, callback) {
  Array.from(element.parentNode.getElementsByTagName('a')).forEach(function(child) {
    child.classList.remove('selected');
  });
  element.classList.add('selected');
  if(element.id)
    element.parentNode.setAttribute('data-selected', element.id);
  callback(element);
}
