<?php
include 'shared.inc.php';

$cid = 'kf19';

if($_SERVER['REQUEST_METHOD'] != 'POST' || !array_key_exists('type', $_POST)) {
  http_response_code(400);
  return;
}
$type = $_POST['type'];
if(!in_array($type, array('intro', 'announces'))) {
  http_response_code(400);
  return;
}
if(!array_key_exists('pass', $_POST) || $_POST['pass'] != $secrets['adminpw']) {
  http_response_code(403);
  return;
}

header('Content-type: text/plain');

$db = open_db();
if(in_array($type, array('intro', 'announces'))) {
  $text = array_key_exists('text', $_POST) ? $_POST['text'] : '';
  $st = $db->prepare('update classes set ' . $type . ' = ? where ID = ?');
  $st->bind_param('ss', $text, $cid);
  $success = $st->execute();

  if($success)
    $result = 'OK; ' . $st->affected_rows . ' row affected';
  else
    $result = $db->error;

  echo $result;
}
?>
