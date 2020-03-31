<?php
include 'shared.inc.php';
include 'ajax-common.inc.php';

ajax_setup([
  'field' => ['intro', 'announces'],
  'class_ID',
  'text'
], true);

$st = $db->prepare("update classes set $_POST[field] = ? where ID = ?");
$st->bind_param('ss', $_POST['text'], $_POST['class_ID']);
$success = $st->execute();

if($success)
  $result = 'OK; ' . $st->affected_rows . ' row affected';
else
  $result = $db->error;

echo json_encode($result);
?>
