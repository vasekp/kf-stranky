'use strict';

function makeSwitch(id, callback, defaultChoice) {
  var children = document.getElementById(id).getElementsByTagName('a');
  forEach(children, function(child) {
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
  forEach(element.parentNode.getElementsByTagName('a'), function(child) {
    child.classList.remove('selected');
  });
  element.classList.add('selected');
  if(element.id)
    element.parentNode.setAttribute('data-selected', element.id);
  callback(element);
}
