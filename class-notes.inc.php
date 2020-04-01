<?php
$scripts[] = 'shared.js';
if($admin)
  $scripts[] = 'shared-admin.js';
$scripts[] = 'class-notes.js';
if($admin) {
  $css[] = 'css/classes-admin.css';
  $scripts[] = 'classes-admin.js';
  $scripts[] = 'class-notes-admin.js';
}

include 'class-notes-common.inc.php';

$r = get_records(array_key_exists('date', $_GET) ? $_GET['date'] : '', !$admin, $admin);
if(!$r) {
  include 'class-details.inc.php';
  return;
}

$prevlink = '<a id="prev"';
if($r->date_prev) {
  $prevlink .= ' href="' . query('', ['s' => 'notes', 'date' => $r->date_prev]) . '"';
  $prevlink .= ' data-date="' . $r->date_prev . '"';
}
$prevlink .= '>«</a>';

$nextlink = '<a id="next"';
if($r->date_next) {
  $nextlink .= ' href="' . query('', ['s' => 'notes', 'date' => $r->date_next]) . '"';
  $nextlink .= ' data-date="' . $r->date_next . '"';
}
$nextlink .= '>»</a>';

$notes = [];
foreach($r->records as $row) {
  if($admin)
    $notes[] = '<li data-id="' . $row['id'] . '" '
      . 'data-text="' . htmlspecialchars($row['text']) . '">'
      . toHTML($row['text']) . '</li>';
  else
    $notes[] = '<li>' . toHTML($row['text']) . '</li>';
}
if($admin)
  $notes[] = '<li class="last"></li>';
$list = join(PHP_EOL, $notes);

if($admin)
  $commit_button = <<<HTML
<div class="buttons">
  <a class="button" id="commit" href="#">Zveřejnit</a>
</div>
HTML;
else
  $commit_button = '';

print <<<HTML
<h1>Poznámky k přednáškám 02KFA</h1>
<div class="switch larger" id="date-buttons">
  $prevlink
  <span id="date" data-date="$r->date">$r->date_text</span>
  $nextlink
</div>
<ul id="list">
  $list
</ul>
$commit_button
$admin_row
HTML;

if($r->mod_time)
  $modtime = strtotime($r->mod_time);
else
  $modtime = filemtime(__FILE__);
?>
