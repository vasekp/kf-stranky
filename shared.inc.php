<?php
include 'secret.inc.php';

setlocale(LC_ALL, 'cs_CZ.utf8');
date_default_timezone_set('Europe/Prague');

function open_db() {
  global $secrets;
  $conn = new mysqli('kmlinux.fjfi.cvut.cz', 'potocvac', $secrets['dbpw'], 'potocvac');

  if($conn->connect_error)
    return null;
  $conn->set_charset('utf8');
  return $conn;
}
?>
