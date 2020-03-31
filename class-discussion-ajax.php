<?php
include 'shared.inc.php';
include 'ajax-common.inc.php';
include 'class-discussion-common.inc.php';

ajax_setup(['query' => [
  'get' => ['dld_ID'],
  'new',
  'edit' => ['ID', 'dld_ID', 'auth_private'],
  'delete' => ['ID', 'dld_ID', 'auth_private']]]);

$query = $_POST['query'];

if($query == 'get') {
  $dldid = $_POST['dld_ID'];
  echo json_encode(get_discussion($dldid, $_POST));
} else
  echo json_encode(discussion_submit($_POST));
?>
