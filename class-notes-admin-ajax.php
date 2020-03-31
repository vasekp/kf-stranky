<?php
include 'shared.inc.php';
include 'ajax-common.inc.php';
include 'class-notes-common.inc.php';

ajax_setup(['class_ID',
  'type' => [
    'insert' => ['date', 'text'],
    'update' => ['text', 'id'],
    'delete' => ['id'],
    'commit'
  ]
], true);

$cid = $_POST['class_ID'];
$type = $_POST['type'];

$text = array_key_exists('text', $_POST) ? $_POST['text'] : '';
$id = array_key_exists('id', $_POST) ? $_POST['id'] : 0;
$date = array_key_exists('date', $_POST) ? $_POST['date'] : '';
if($type == 'update') {
  $st = $db->prepare('update class_notes set text = ? where id = ?');
  $st->bind_param('si', $text, $id);
} else if($type == 'insert') {
  $st = $db->prepare('insert into class_notes (class_ID, date, text, public) values (?, ?, ?, 0)');
  $st->bind_param('sss', $cid, $date, $text);
} else if($type == 'delete') {
  $st = $db->prepare('delete from class_notes where id = ?');
  $st->bind_param('i', $id);
} else if($type == 'commit') {
  $st = $db->prepare('update class_notes set public = 1 where class_ID = ?');
  $st->bind_param('s', $cid);
}
$st->execute();

if($type == 'insert') {
  $result = $db->query('select last_insert_id()');
  if($result->num_rows == 0)
    return;
  $id = $result->fetch_row()[0];
}

if($type == 'insert' || $type == 'update') {
  $response = [
    'text' => $text,
    'html' => toHTML($text),
    'id' => $id
  ];
  echo json_encode($response);
}
?>
