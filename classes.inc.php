<?php
$css[] = 'css/classes.css';
$scripts[] = 'shared.js';
$scripts[] = 'classes.js';
if($admin) {
  $css[] = 'css/classes-admin.css';
  $scripts[] = 'shared-admin.js';
  $scripts[] = 'classes-admin.js';
}

if(isset($_GET['c']))
  $cid = $_GET['c'];
else {
  $sql = 'select id, year, semester from classes where year is not null order by year desc, semester desc limit 2';
  $result = $db->query($sql);
  if($result->num_rows == 1) {
    $row = $result->fetch_assoc();
    $cid = $row['id'];
  } else {
    $row1 = $result->fetch_assoc();
    $row2 = $result->fetch_assoc();
    if($row1['year'] != $row2['year'] || $row1['semester'] != $row2['semester'])
      $cid = $row1['id'];
  }
}

if(!isset($cid) || $cid == 'sel') {
  include 'class-sel.inc.php';
  return;
}

$sql = 'select language from classes where ID=?';
$st = $db->prepare($sql);
$st->bind_param('s', $cid);
$st->execute();
$st->bind_result($classLang);
if(!$st->fetch()) {
  include 'error.inc.php';
  return;
}
$st->close();

if($prilang == 'en' && $classLang == 'cz')
  $warn = 'This class, and all its associated materials, are in Czech.';
else if($prilang == 'cz' && $classLang == 'en')
  $warn = 'Tento předmět a všechny příslušné materiály jsou v anglickém jazyce.';
else
  $warn = '';
if($warn)
  print <<<HTML
<span class="warn">$warn</span>\n
HTML;

if(array_key_exists('s', $_GET) && $_GET['s'] == 'notes')
  include 'class-notes.inc.php';
else
  include 'class-details.inc.php';

print <<<HTML
<input type="hidden" id="class_ID" value="$cid"/>
HTML;
?>
