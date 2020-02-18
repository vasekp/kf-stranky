<?php
$cid = 1;

$date_sql = null;
if(key_exists("id", $_GET)) {
  $id = $_GET["id"];
  $sql = "select date from class_notes where class_ID = $cid and id = $id";
  $result = $db->query($sql);
  if($result->num_rows > 0)
    $date_sql = $result->fetch_row()[0];
}
/* Fall back to newest if CID/ID not found */
if(!$date_sql) {
  $sql = "select max(date) from class_notes where class_ID = $cid";
  $result = $db->query($sql);
  if($result->num_rows > 0)
    $date_sql = $result->fetch_row()[0];
}
/* Fail if still no match: CID does not exist */
if(!$date_sql) {
  include "class-intro.inc.php";
  return;
}
$date_php = strtotime($date_sql);
setlocale(LC_ALL, "cs_CZ.utf8");

$sql = "select min(id) from class_notes where class_ID = $cid and " .
  "date < \"$date_sql\" group by date order by date desc";
$result = $db->query($sql);
if($result->num_rows > 0)
  $id_prev = $result->fetch_row()[0];
else
  $id_prev = null;

$sql = "select min(id) from class_notes where class_ID = $cid and " .
  "date > \"$date_sql\" group by date order by date";
$result = $db->query($sql);
if($result->num_rows > 0)
  $id_next = $result->fetch_row()[0];
else
  $id_next = null;

/*****/

print_indent(4, "<h1>Poznámky k přednáškám 02KFA</h1>");
print_indent(4, "<div class=\"switch larger\">");
if($id_prev)
  $href = " href=\"?notes&id=$id_prev\"";
else
  $href = "";
$text = "<a id=\"prev\"$href>«</a>";
print_indent(5, $text);
print_indent(5, "<span id=\"date\">" . strftime("%a ", $date_php) . date("j. n. Y", $date_php) . "</span>");
if($id_next)
  $href = " href=\"?notes&id=$id_next\"";
else
  $href = "";
$text = "<a id=\"next\"$href>»</a>";
print_indent(5, $text);
print_indent(4, "</div>");

print_indent(4, "<ul>");
$sql = "select text from class_notes where class_ID = $cid and date = \"$date_sql\"";
$result = $db->query($sql);
while($row = $result->fetch_assoc()) {
  $text = preg_replace("/{([^}]*)}/", "<span class=\"litref\">$1</span>", $row["text"]);
  print_indent(5, "<li>" . $text . "</li>");
}
print_indent(4, "</ul>");
?>
