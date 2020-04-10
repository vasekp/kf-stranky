<?php
include 'shared.inc.php';
include 'ajax-common.inc.php';
include 'comments-common.inc.php';

ajax_setup(['query' => [
  'get' => ['thread_ID'],
  'new',
  'edit' => ['ID', 'thread_ID', 'auth_private'],
  'delete' => ['ID', 'thread_ID', 'auth_private']]]);

$query = $_POST['query'];

if($query == 'get') {
  echo json_encode(get_comments($_POST['thread_ID'], $_POST));
} else
  echo json_encode(comments_submit($_POST));
?>
