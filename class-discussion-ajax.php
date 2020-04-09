<?php
include 'shared.inc.php';
include 'ajax-common.inc.php';
include 'class-discussion-common.inc.php';

ajax_setup(['query' => [
  'get' => ['thread_ID'],
  'new',
  'edit' => ['ID', 'thread_ID', 'auth_private'],
  'delete' => ['ID', 'thread_ID', 'auth_private']]]);

$query = $_POST['query'];

if($query == 'get') {
  echo json_encode(get_discussion($_POST['thread_ID'], $_POST));
} else
  echo json_encode(discussion_submit($_POST));
?>
