<?php
include 'shared.inc.php';
include 'class-notes-common.inc.php';

header('Content-type: application/json');

if($_SERVER['REQUEST_METHOD'] != 'POST') {
  http_response_code(400);
  return;
}

header('Content-type: application/json');

$db = open_db();
if(!$db) {
  http_response_code(500);
  return;
}

$date = array_key_exists('date', $_POST) ? $_POST['date'] : '';
echo json_encode(get_records($date, false));
?>
