<?php
include 'shared.inc.php';
include 'ajax-common.inc.php';

ajax_setup([
  'which' => ['intro', 'announces'],
  'text'
], true);

$cid = 'kf19';

$which = $_POST['which'];
$text = $_POST['text'];
$st = $db->prepare('update classes set ' . $which . ' = ? where ID = ?');
$st->bind_param('ss', $text, $cid);
$success = $st->execute();

if($success)
  $result = 'OK; ' . $st->affected_rows . ' row affected';
else
  $result = $db->error;

echo json_encode($result);
?>
