<?php
include 'secret.inc.php';

setlocale(LC_ALL, 'cs_CZ.utf8');
mb_internal_encoding('UTF-8');
date_default_timezone_set('Europe/Prague');

function open_db() {
  global $secrets;
  $conn = @new mysqli($secrets['dbserver'], 'potocvac', $secrets['dbpw'], 'potocvac');

  if($conn->connect_error)
    return null;
  $conn->set_charset('utf8');
  return $conn;
}
?>
