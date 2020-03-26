<?php
array_push($scripts, 'shared.js');
array_push($scripts, 'class-notes.js');
if($admin) {
  array_push($css, 'css/classes-admin.css');
  array_push($scripts, 'classes-admin.js');
  array_push($scripts, 'class-notes-admin.js');
}

include 'class-notes-common.inc.php';

$r = get_records(array_key_exists('date', $_GET) ? $_GET['date'] : '', true);
if(!$r) {
  include 'class-details.inc.php';
  return;
}

$prevlink = '<a id="prev"';
if($r->date_prev) {
  $prevlink .= ' href="' . query('', array('s' => 'notes', 'date' => $r->date_prev)) . '"';
  $prevlink .= ' data-date="' . $r->date_prev . '"';
}
$prevlink .= '>«</a>';

$nextlink = '<a id="next"';
if($r->date_next) {
  $nextlink .= ' href="' . query('', array('s' => 'notes', 'date' => $r->date_next)) . '"';
  $nextlink .= ' data-date="' . $r->date_next . '"';
}
$nextlink .= '>»</a>';

print <<<HTML
<h1>Poznámky k přednáškám 02KFA</h1>
<div class="switch larger" id="date-buttons">
$prevlink
<span id="date" data-date="{$r->date}">{$r->date_text}</span>
$nextlink
</div>\n
HTML;

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
