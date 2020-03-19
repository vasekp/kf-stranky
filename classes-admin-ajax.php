<?php
include 'shared.inc.php';

$cid = 'kf19';

if($_SERVER['REQUEST_METHOD'] != 'POST' || !array_key_exists('type', $_POST)) {
  http_response_code(400);
  return;
}
if(!array_key_exists('pass', $_POST) || $_POST['pass'] != $secrets['adminpw']) {
  http_response_code(403);
  return;
}

header('Content-type: application/json');

$type = $_POST['type'];
if(in_array($type, array('html'))) {
  $which = array_key_exists('which', $_POST) ? $_POST['which'] : '';
  if(!in_array($which, array('intro', 'announces'))) {
    http_response_code(400);
    return;
  }

  $db = open_db();
  $text = array_key_exists('text', $_POST) ? $_POST['text'] : '';
  $st = $db->prepare('update classes set ' . $which . ' = ? where ID = ?');
  $st->bind_param('ss', $text, $cid);
  $success = $st->execute();

  if($success)
    $result = 'OK; ' . $st->affected_rows . ' row affected';
  else
    $result = $db->error;

  echo json_encode($result);
} else if(in_array($type, array('insert', 'update', 'delete'))) {
  include 'class-notes-common.inc.php';

  $db = open_db();
  $text = array_key_exists('text', $_POST) ? $_POST['text'] : '';
  $id = array_key_exists('id', $_POST) ? $_POST['id'] : 0;
  $date = array_key_exists('date', $_POST) ? $_POST['date'] : '';
  if($type == 'update') {
    $st = $db->prepare('update class_notes set text = ? where id = ?');
    $st->bind_param("si", $text, $id);
  } else if($type == 'insert') {
    $st = $db->prepare('insert into class_notes (class_ID, date, text) values (?, ?, ?)');
    $st->bind_param("sss", $cid, $date, $text);
  } else if($type == 'delete') {
    $st = $db->prepare('delete from class_notes where id = ?');
    $st->bind_param("i", $id);
  }
  $st->execute();

  if($type == 'insert') {
    $result = $db->query('select last_insert_id()');
    if($result->num_rows == 0)
      return;
    $id = $result->fetch_row()[0];
  }

  if($type == 'insert' || $type == 'update') {
    $response = array(
      'text' => $text,
      'html' => toHTML($text),
      'id' => $id
    );
    echo json_encode($response);
  }
} else
  http_response_code(400);
