<?php
$cid = 1;

function date_valid($date_req) {
  return preg_match('/^\d{4}-\d{1,2}-\d{1,2}$/', $date_req);
}

function date_exists($date_req) {
  global $cid, $db;
  if(!date_valid($date_req))
    return false;
  $sql = "select date from class_notes where class_ID = $cid and date = '$date_req' limit 1";
  $result = $db->query($sql);
  return ($result->num_rows > 0);
}

function date_newest() {
  global $cid, $db;
  $sql = "select max(date) from class_notes where class_ID = $cid";
  $result = $db->query($sql);
  if($result->num_rows > 0)
    return $result->fetch_row()[0];
  else
    return null;
}

function validate_date($date_req, $newest_if_empty) {
  if($newest_if_empty)
    return date_exists($date_req) ? $date_req : date_newest();
  else
    return date_valid($date_req) ? $date_req : null;
}

function get_records($date_req, $newest_if_empty) {
  global $cid, $db;
  $ret = new stdClass;
  if(!($date = validate_date($date_req, $newest_if_empty)))
    return null;
  $ret->date = $date;

  setlocale(LC_ALL, 'cs_CZ.utf8');
  $date_php = strtotime($date);
  $ret->date_text = strftime('%a ', $date_php) . date('j. n. Y', $date_php);

  $sql = "select max(date) from class_notes where class_ID = $cid and date < '$date'";
  $result = $db->query($sql);
  if($result->num_rows > 0)
    $ret->date_prev = $result->fetch_row()[0];
  else
    $ret->date_prev = null;

  $sql = "select min(date) from class_notes where class_ID = $cid and date > '$date'";
  $result = $db->query($sql);
  if($result->num_rows > 0)
    $ret->date_next = $result->fetch_row()[0];
  else
    $ret->date_next = null;

  $sql = "select id, text from class_notes where class_ID = $cid and date = '$date'";
  $result = $db->query($sql);
  $records = array();
  while($row = $result->fetch_assoc())
    $records[] = $row;
  $ret->records = $records;

  return $ret;
}

function toHTML($text) {
  $text = htmlspecialchars($text);
  $text = preg_replace('/{([^}]*)}/', '<span class="litref">$1</span>', $text);
  return $text;
}
?>
