<?php
include 'db.inc.php';

$cid = 1;

if($_SERVER['REQUEST_METHOD'] != 'POST')
  return;
$type = $_POST['type'];

$db = open_db();
$text = $_POST['text'];
$id = $_POST['id'];
$date = $_POST['date'];
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
?>
