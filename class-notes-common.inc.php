<?php
$cid = 'kf19';

function date_valid($date_req) {
  return preg_match('/^\d{4}-\d{1,2}-\d{1,2}$/', $date_req);
}

function date_valid_nonempty($date_req, $show_hidden) {
  global $cid, $db;
  if(!date_valid($date_req))
    return false;
  $and_public = $show_hidden ? "" : "and public = 1";
  $sql = "select date from class_notes where class_ID = '$cid' and date = '$date_req' $and_public limit 1";
  $result = $db->query($sql);
  return ($result->num_rows > 0);
}

function date_newest($show_hidden) {
  global $cid, $db;
  $and_public = $show_hidden ? "" : "and public = 1";
  $sql = "select max(date) from class_notes where class_ID = '$cid' $and_public";
  $result = $db->query($sql);
  if($result->num_rows > 0)
    return $result->fetch_row()[0];
  else
    return null;
}

function validate_date($date_req, $check_nonempty, $show_hidden) {
  if(!$date_req)
    $valid = false;
  else if($check_nonempty)
    $valid = date_valid_nonempty($date_req, $show_hidden);
  else
    $valid = date_valid($date_req);
  return $valid ? $date_req : date_newest($show_hidden);
}

function get_records($date_req, $newest_if_empty, $show_hidden) {
  global $cid, $db;
  $ret = new stdClass;
  if(!($date = validate_date($date_req, $newest_if_empty, $show_hidden)))
    return null;
  $ret->date = $date;

  $sql = "select language from classes where ID = '$cid'";
  $result = $db->query($sql);
  $lang = $result->fetch_row()[0];

  $date_php = strtotime($date);
  $weekdays = $lang == 'en'
    ? ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
    : ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];
  $ret->date_text = $weekdays[idate('w', $date_php)] . date(' j.n.Y', $date_php);

  $and_public = $show_hidden ? '' : 'and public = 1';

  $sql = "select max(timestamp) from class_notes where class_ID = '$cid' $and_public";
  if($date_req)
    $sql .= " and date = '$date'";
  $result = $db->query($sql);
  if($result->num_rows > 0) {
    $ret->mod_time = $result->fetch_row()[0];
    $ret->mod_text = date('j.n.Y G:i', strtotime($ret->mod_time));
  } else
    $ret->last_mod = null;

  $sql = "select max(date) from class_notes where class_ID = '$cid' and date < '$date' $and_public";
  $result = $db->query($sql);
  if($result->num_rows > 0)
    $ret->date_prev = $result->fetch_row()[0];
  else
    $ret->date_prev = null;

  $sql = "select min(date) from class_notes where class_ID = '$cid' and date > '$date' $and_public";
  $result = $db->query($sql);
  if($result->num_rows > 0)
    $ret->date_next = $result->fetch_row()[0];
  else
    $ret->date_next = null;

  $sql = "select id, text from class_notes where class_ID = '$cid' and date = '$date' $and_public";
  $result = $db->query($sql);
  $records = [];
  while($row = $result->fetch_assoc()) {
    $row['html'] = toHTML($row['text']);
    $records[] = $row;
  }
  $ret->records = $records;

  return $ret;
}

function toHTML($text) {
  $text = htmlspecialchars($text);
  $text = preg_replace('/{([^}]*)}/', '<span class="litref">$1</span>', $text);
  $text = preg_replace('/_(.)/u', '<sub>$1</sub>', $text);
  $text = preg_replace('/\^(.)/u', '<sup>$1</sup>', $text);
  return $text;
}
?>
