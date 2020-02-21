<?php
function open_db() {
  include 'secret.inc.php';
  $conn = new mysqli($servername, $username, $password, $dbname);

  if($conn->connect_error)
    return null;
  $conn->set_charset('utf8');
  return $conn;
}
?>
