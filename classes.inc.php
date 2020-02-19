<?php
if(array_key_exists('notes', $_GET))
  include 'class-notes.inc.php';
else
  include 'class-intro.inc.php';
?>
