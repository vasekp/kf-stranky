<?php
include 'shared.inc.php';
include 'ajax-common.inc.php';
include 'class-discussion-common.inc.php';

ajax_setup(['query' => [
  'get' => ['dld_ID'],
  'submit']]);

$query = $_POST['query'];

if($query == 'get') {
  $dldid = $_POST['dld_ID'];
  echo json_encode(get_discussion($dldid));
} else if($query == 'submit')
  echo json_encode(discussion_submit($_POST));
?>
