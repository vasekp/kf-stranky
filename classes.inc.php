<?php
if($early) {
  array_push($css, 'css/classes.css');
  if($admin)
    array_push($css, 'css/classes-admin.css');
  array_push($scripts, 'classes.js');
  if($admin)
    array_push($scripts, 'classes-admin.js');
  return;
}
if(array_key_exists('s', $_GET) && $_GET['s'] == 'notes')
  include 'class-notes.inc.php';
else
  include 'class-intro.inc.php';
?>
