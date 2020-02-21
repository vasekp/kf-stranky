<?php
$cid = 1;
$admin = 1;

$date_sql = null;
if(key_exists('date', $_GET)) {
  $date_get = $_GET['date'];
  if(preg_match('/^\d{4}-\d{2}-\d{2}$/', $date_get)) {
    $sql = "select date from class_notes where class_ID = $cid and date = '$date_get' limit 1";
    $result = $db->query($sql);
    if($result->num_rows > 0)
      $date_sql = $date_get;
  }
}
/* Fall back to newest if date invalid or not found */
if(!$date_sql) {
  $sql = "select max(date) from class_notes where class_ID = $cid";
  $result = $db->query($sql);
  if($result->num_rows > 0)
    $date_sql = $result->fetch_row()[0];
}
/* Fail if still no match: CID does not exist */
if(!$date_sql) {
  include 'class-intro.inc.php';
  return;
}
$date_php = strtotime($date_sql);
setlocale(LC_ALL, 'cs_CZ.utf8');

$sql = "select max(date) from class_notes where class_ID = $cid and date < '$date_sql'";
$result = $db->query($sql);
if($result->num_rows > 0)
  $date_prev = $result->fetch_row()[0];
else
  $date_prev = null;

$sql = "select min(date) from class_notes where class_ID = $cid and date > '$date_sql'";
$result = $db->query($sql);
if($result->num_rows > 0)
  $date_next = $result->fetch_row()[0];
else
  $date_next = null;

/*****/

print_indent(4, '<h1>Poznámky k přednáškám 02KFA</h1>');
print_indent(4, '<div class="switch larger">');
$text = '<a id="prev"' . ($date_prev ? ' href="?notes&amp;date=' . $date_prev . '">' : '>') . '«</a>';
print_indent(5, $text);
print_indent(5, '<span id="date" data-date="' . $date_sql . '">' .
  strftime('%a ', $date_php) . date('j. n. Y', $date_php) . '</span>');
$text = '<a id="next"' . ($date_next ? ' href="?notes&amp;date=' . $date_next . '">' : '>') . '»</a>';
print_indent(5, $text);
print_indent(4, '</div>');

print_indent(4, '<ul id="list">');
$sql = "select id, text from class_notes where class_ID = $cid and date = '$date_sql'";
$result = $db->query($sql);
while($row = $result->fetch_assoc()) {
  $text = htmlspecialchars($row['text']);
  $text = preg_replace('/{([^}]*)}/', '<span class="litref">$1</span>', $text);
  print_indent(5, '<li data-id="' . $row['id'] . '">' . $text . '</li>');
}
if($admin)
  print_indent(5, '<li class="last"></li>');
print_indent(4, '</ul>');
?>
