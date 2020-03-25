<?php
include 'shared.inc.php';
include 'ajax-common.inc.php';
include 'class-notes-common.inc.php';

ajax_setup();

$date = array_key_exists('date', $_POST) ? $_POST['date'] : '';
echo json_encode(get_records($date, false));
?>
