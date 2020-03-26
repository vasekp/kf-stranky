<?php
include 'shared.inc.php';
include 'ajax-common.inc.php';
include 'class-notes-common.inc.php';

ajax_setup();

$date = array_key_exists('date', $_POST) ? $_POST['date'] : '';
$hidden = array_key_exists('hidden', $_POST) ? $_POST['hidden'] : false;
echo json_encode(get_records($date, false, $hidden));
?>
