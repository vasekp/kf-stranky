<?php
array_push($scripts, 'shared.js');
array_push($scripts, 'class-discussion.js');
if($admin) {
  array_push($css, 'css/classes-admin.css');
  array_push($scripts, 'classes-admin.js');
  array_push($scripts, 'class-details-admin.js');
}

include 'class-discussion-common.inc.php';

if($_SERVER['REQUEST_METHOD'] == 'POST')
  $data = discussion_submit($_POST);
else
  $data = null;

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
<h2>Ke stažení</h2>\n
HTML;

$sql = <<<SQL
select dld.ID as id, filename, description, count(dis.ID) as count
  from download as dld
  left join discussion as dis on dis.dld_ID = dld.ID
  group by dld.ID
SQL;
$result = $db->query($sql);
while($row = $result->fetch_assoc()) {
  $url = query('', array('discuss' => $row['id']));
  $count = $row['count'] ? $row['count'] : '';
  $ccount = $row['count'] ? $row['count'] : 0;
  ob_start();
  include 'images/discussion.svg.php';
  $bubble = ob_get_clean();
  if(array_key_exists('discuss', $_GET) && $_GET['discuss'] == $row['id'])
    $discussion = get_discussion($row['id'], $data)['html'];
  else
    $discussion = '';
  print <<<HTML
<div class="download" id="download{$row['id']}" data-id="{$row['id']}">
  <div class="icon">
    <a href="download/{$row['filename']}"><img src="images/download.svg" alt="{$row['filename']}"/></a>
  </div>
  <div class="text">
    <a href="download/{$row['filename']}">{$row['description']}</a>
  </div>
  <div class="bubble">\n
    <a href="$url" id="bubble{$row['id']}" data-id="{$row['id']}" data-count="$ccount">
      $bubble
    </a>
  </div>
</div>
$discussion\n
HTML;
}

if($admin)
  $adminrow = '<input type="hidden" id="admin" value="' . $_GET['admin'] . '"/>';
else
  $adminrow = '';
$notes_url = query('', array('s' => 'notes'));

print <<<HTML
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
