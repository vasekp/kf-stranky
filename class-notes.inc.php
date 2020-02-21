<?php
include 'class-notes-common.inc.php';

$r = get_records(array_key_exists('date', $_GET) ? $_GET['date'] : '', true);
if(!$r) {
  include 'class-intro.inc.php';
  return;
}

$admin = (array_key_exists('admin', $_GET) && $_GET['admin'] == $secrets['adminpw']);

print_indent(4, '<h1>Poznámky k přednáškám 02KFA</h1>');
print_indent(4, '<div class="switch larger">');
$text = '<a id="prev"'
  . ($r->date_prev ? ' href="?notes&amp;date=' . $r->date_prev . '" data-date="' . $r->date_prev . '"' : '')
  . '>«</a>';
print_indent(5, $text);
print_indent(5, '<span id="date" data-date="' . $r->date . '">' . $r->date_text . '</span>');
$text = '<a id="next"'
  . ($r->date_next ? ' href="?notes&amp;date=' . $r->date_next . '" data-date="' . $r->date_next . '"' : '')
  . '>»</a>';
print_indent(5, $text);
print_indent(4, '</div>');

print_indent(4, '<ul id="list">');
foreach($r->records as $row) {
  print_indent(5, '<li data-id="' . $row['id'] . '">' . toHTML($row['text']) . '</li>');
}
if($admin)
  print_indent(5, '<li class="last"></li>');
print_indent(4, '</ul>');

if($admin)
  print_indent(4, '<input type="hidden" id="admin" value="' . $_GET['admin'] . '"/>');
?>
