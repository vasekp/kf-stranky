<?php
if($early) {
  if($admin) {
    array_push($css, 'css/classes-admin.css');
    array_push($scripts, 'classes-admin.js');
    array_push($scripts, 'class-details-admin.js');
  }
  return;
}

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
$notes_url = query('', array('s' => 'notes'));

print <<<HTML
</table>
$adminrow
<div class="buttons">
  <a class="button" href="$notes_url">Zápis z hodin</a>
  <a class="button" href="https://physics.fjfi.cvut.cz/studium/predmety/292-02kfa" target="_blank">Stránky cvičení</a>
</div>\n
HTML;

$sql = <<<SQL
select coalesce(greatest(c1,c2),c1) from
  (select
    (select modified from classes) as c1,
    (select max(timestamp) from download) as c2
  ) as sub
SQL;

$result = $db->query($sql);
if($result->num_rows > 0)
  $modtime = strtotime($result->fetch_row()[0]);
?>
