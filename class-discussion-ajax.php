<?php
include 'shared.inc.php';
include 'ajax-common.inc.php';
include 'class-discussion-common.inc.php';

ajax_setup(['query' => [
  'get' => ['class_ID', 'dld_ID'],
  'new',
  'edit' => ['ID', 'dld_ID', 'auth_private'],
  'delete' => ['ID', 'dld_ID', 'auth_private']]]);

$query = $_POST['query'];

if($query == 'get') {
  echo json_encode(get_discussion($_POST['class_ID'], $_POST['dld_ID'], $_POST));
} else
  echo json_encode(discussion_submit($_POST));
?>
