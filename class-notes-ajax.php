<?php
include 'shared.inc.php';
include 'class-notes-common.inc.php';

if($_SERVER['REQUEST_METHOD'] != 'POST' || !array_key_exists('type', $_POST)) {
  http_response_code(400);
  return;
}
$type = $_POST['type'];

if($type == 'get') {
  $db = open_db();
  $date = array_key_exists('date', $_POST) ? $_POST['date'] : '';
  echo json_encode(get_records($date, false));
  return;
}

if(in_array($type, array('insert', 'update', 'delete'))) {
  if(!array_key_exists('pass', $_POST) || $_POST['pass'] != $secrets['adminpw']) {
    http_response_code(403);
    return;
  }
  $db = open_db();
  $text = array_key_exists('text', $_POST) ? $_POST['text'] : '';
  $id = array_key_exists('id', $_POST) ? $_POST['id'] : 0;
  $date = array_key_exists('date', $_POST) ? $_POST['date'] : '';
  if($type == 'update') {
    $st = $db->prepare('update class_notes set text = ? where id = ?');
    $st->bind_param("si", $text, $id);
  } else if($type == 'insert') {
    $st = $db->prepare('insert into class_notes (class_ID, date, text) values (?, ?, ?)');
    $st->bind_param("iss", $cid, $date, $text);
  } else if($type == 'delete') {
    $st = $db->prepare('delete from class_notes where id = ?');
    $st->bind_param("i", $id);
  }
  $st->execute();

  if($type == 'insert') {
    $result = $db->query('select last_insert_id()');
    if($result->num_rows > 0) {
      $response = array('id' => $result->fetch_row()[0]);
      echo json_encode($response);
    }
  }
}
?>
