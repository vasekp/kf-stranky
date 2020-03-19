<?php
include 'shared.inc.php';
include 'class-notes-common.inc.php';

if($_SERVER['REQUEST_METHOD'] != 'POST') {
  http_response_code(400);
  return;
}
$type = $_POST['type'];

$db = open_db();
$date = array_key_exists('date', $_POST) ? $_POST['date'] : '';
echo json_encode(get_records($date, false));
?>
