<?php
$css[] = 'css/classes.css';
$scripts[] = 'shared.js';
$scripts[] = 'classes.js';
if($admin) {
  $css[] = 'css/classes-admin.css';
  $scripts[] = 'shared-admin.js';
  $scripts[] = 'classes-admin.js';
}

$cid = isset($_GET['c']) ? $_GET['c'] : 'kf19';

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
