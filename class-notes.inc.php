<?php
include 'class-notes-common.inc.php';

$r = get_records(array_key_exists('date', $_GET) ? $_GET['date'] : '', true);
if(!$r) {
  include 'class-intro.inc.php';
  return;
}

print_indent(4, '<h1>Poznámky k přednáškám 02KFA</h1>');
print_indent(4, '<div class="switch larger" id="date-buttons">');
$text = '<a id="prev"';
if($r->date_prev) {
  $text .= ' href="' . query('', array('s' => 'notes', 'date' => $r->date_prev)) . '"';
  $text .= ' data-date="' . $r->date_prev . '"';
}
$text .= '>«</a>';
print_indent(5, $text);
print_indent(5, '<span id="date" data-date="' . $r->date . '">' . $r->date_text . '</span>');
$text = '<a id="next"';
if($r->date_next) {
  $text .= ' href="' . query('', array('s' => 'notes', 'date' => $r->date_next)) . '"';
  $text .= ' data-date="' . $r->date_next . '"';
}
$text .= '>»</a>';
print_indent(5, $text);
print_indent(4, '</div>');

print_indent(4, '<ul id="list">');
foreach($r->records as $row) {
  if($admin)
    print_indent(5, '<li data-id="' . $row['id'] . '" '
      . 'data-text="' . $row['text'] . '">'
      . toHTML($row['text']) . '</li>');
  else
    print_indent(5, '<li>' . toHTML($row['text']) . '</li>');
}
if($admin)
  print_indent(5, '<li class="last"></li>');
print_indent(4, '</ul>');

if($admin)
  print_indent(4, '<input type="hidden" id="admin" value="' . $_GET['admin'] . '"/>');

if($r->mod_time)
  $modtime = strtotime($r->mod_time);
else
  $modtime = filemtime(__FILE__);
?>
