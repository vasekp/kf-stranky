function applyFilter(element) {
  Array.from(document.getElementsByClassName('filter')).forEach(function(e) {
    show = e.classList.contains("f-" + element.id);
    if(show)
      e.classList.remove('hide');
    else
      e.classList.add('hide');
  });
};

function scriptReady() {
  document.getElementById('pub-filter').classList.remove('hide');
  makeSwitch('pub-filter', applyFilter, 0);
}

window.addEventListener('DOMContentLoaded', function(event) {
  let script = document.createElement('script');
  script.src = 'switch.js';
  script.onreadystatechange = scriptReady;
  script.onload = scriptReady;
  document.head.appendChild(script);
});
