window.addEventListener('DOMContentLoaded', function(event) {
  email = "vaclav.potocek" + String.fromCharCode(64) + "fjfi.cvut.cz";
  document.getElementById("email").innerHTML = "<a href=\"mailto:" + email + "\">" + email + "</a>";
});
