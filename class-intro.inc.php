<?php
$cid = 'kf19';

$sql = "select title, KOS, intro, announces from classes where ID='$cid'";
$result = $db->query($sql);
$row = $result->fetch_assoc();

print <<<HTML
<h1>{$row['title']} <span class="smaller">({$row['KOS']})</span></h1>
<div id="intro">
{$row['intro']}
</div>
<h2>Aktuality</h2>
<div id="announces">
{$row['announces']}
</div>
<h2>Ke stažení</h2>
<table>\n
HTML;

$sql = 'select filename, description, timestamp from download';
$result = $db->query($sql);
while($row = $result->fetch_assoc())
  print <<<HTML
<tr>
<td><a href="download/{$row['filename']}"><img class="filetype" src="images/download.svg" alt="{$row['filename']}"/></a></td>
<td>{$row['description']}</td>
</tr>\n
HTML;

if($admin)
  $adminrow = '<input type="hidden" id="admin" value="' . $_GET['admin'] . '"/>';
else
  $adminrow = '';

print <<<HTML
</table>
$adminrow
<div class="buttons">
  <a class="button" href="{echo query('', array('s' => 'notes'))}">Zápis z hodin</a>
  <a class="button" href="https://physics.fjfi.cvut.cz/studium/predmety/292-02kfa" target="_blank">Stránky cvičení</a>
</div>\n
HTML;

$modtime = filemtime(__FILE__);
?>
