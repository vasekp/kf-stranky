<?php
include 'class-notes-common.inc.php';

$r = get_records(array_key_exists('date', $_GET) ? $_GET['date'] : '', true);
if(!$r) {
  include 'class-intro.inc.php';
  return;
}

echo '<h1>Poznámky k přednáškám 02KFA</h1>' . PHP_EOL;
echo '<div class="switch larger" id="date-buttons">' . PHP_EOL;
$text = '<a id="prev"';
if($r->date_prev) {
  $text .= ' href="' . query('', array('s' => 'notes', 'date' => $r->date_prev)) . '"';
  $text .= ' data-date="' . $r->date_prev . '"';
}
$text .= '>«</a>';
echo $text . PHP_EOL;
echo '<span id="date" data-date="' . $r->date . '">' . $r->date_text . '</span>' . PHP_EOL;
$text = '<a id="next"';
if($r->date_next) {
  $text .= ' href="' . query('', array('s' => 'notes', 'date' => $r->date_next)) . '"';
  $text .= ' data-date="' . $r->date_next . '"';
}
$text .= '>»</a>';
echo $text . PHP_EOL;
echo '</div>' . PHP_EOL;

echo '<ul id="list">' . PHP_EOL;
foreach($r->records as $row) {
  if($admin)
    echo '<li data-id="' . $row['id'] . '" '
      . 'data-text="' . $row['text'] . '">'
      . toHTML($row['text']) . '</li>' . PHP_EOL;
  else
    echo '<li>' . toHTML($row['text']) . '</li>' . PHP_EOL;
}
if($admin)
  echo '<li class="last"></li>' . PHP_EOL;
echo '</ul>' . PHP_EOL;

if($admin)
  echo '<input type="hidden" id="admin" value="' . $_GET['admin'] . '"/>' . PHP_EOL;

if($r->mod_time)
  $modtime = strtotime($r->mod_time);
else
  $modtime = filemtime(__FILE__);
?>
