<?php
include 'shared.inc.php';
include 'class-discussion-common.inc.php';

if($_SERVER['REQUEST_METHOD'] != 'POST') {
  http_response_code(400);
  return;
}

if(!array_key_exists('dld_ID', $_POST)) {
  http_response_code(400);
  return;
}

$dldid = $_POST['dld_ID'];

$db = open_db();
echo json_encode(get_discussion($dldid));
?>
