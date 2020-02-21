<?php
if(array_key_exists('s', $_GET) && $_GET['s'] == 'notes')
  include 'class-notes.inc.php';
else
  include 'class-intro.inc.php';
?>
