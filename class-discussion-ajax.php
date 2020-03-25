<?php
include 'shared.inc.php';
include 'class-discussion-common.inc.php';

header('Content-type: application/json');

if($_SERVER['REQUEST_METHOD'] != 'POST' || !array_key_exists('query', $_POST)) {
  http_response_code(400);
  return;
}

$query = $_POST['query'];

if($query == 'get') {
  if(!array_key_exists('dld_ID', $_POST)) {
    http_response_code(400);
    return;
  }

  $dldid = $_POST['dld_ID'];

  $db = open_db();
  if(!$db) {
    http_response_code(500);
    return;
  }
  echo json_encode(get_discussion($dldid));
} else if($query == 'submit') {
  $db = open_db();
  if(!$db) {
    http_response_code(500);
    return;
  }
  echo json_encode(discussion_submit($_POST));
} else {
  http_response_code(400);
}
?>
