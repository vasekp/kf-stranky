'use strict';

window.addEventListener('DOMContentLoaded', function(event) {
  var elm = document.getElementById('email');
  var email = elm.textContent + getComputedStyle(elm.firstElementChild, '::after').content.slice(1, -1);
  elm.innerHTML = '<a href="mailto:' + email + '">' + email + '</a>';
});
