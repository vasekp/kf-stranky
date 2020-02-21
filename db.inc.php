<?php
include 'secret.inc.php';

function open_db() {
  global $secrets;
  $conn = new mysqli('kmlinux.fjfi.cvut.cz', 'potocvac', $secrets['dbpw'], 'potocvac');

  if($conn->connect_error)
    return null;
  $conn->set_charset('utf8');
  return $conn;
}
?>
