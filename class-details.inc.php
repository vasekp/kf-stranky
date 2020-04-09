<?php
$scripts[] = 'class-discussion.js';
if($admin)
  $scripts[] = 'class-details-admin.js';

include 'class-discussion-common.inc.php';
include_once 'class-notes-common.inc.php';

if($_SERVER['REQUEST_METHOD'] == 'POST')
  $data = discussion_submit($_POST);
else
  $data = null;

$sql = "select title, KOS, intro, announces, tutorials from classes where ID='$cid'";
$result = $db->query($sql);
$classInfo = $result->fetch_assoc();

print <<<HTML
<h1>$classInfo[title] <span class="smaller">($classInfo[KOS])</span></h1>
<div id="intro">
  $classInfo[intro]
</div>\n
HTML;

if($classInfo['announces'] || $admin)
  print <<<HTML
<h2>Aktuality</h2>
<div id="announces">
  $classInfo[announces]
</div>\n
HTML;

$sql = <<<SQL
select dld.ID as id, filename, description, count(dis.ID) as count
  from download as dld
  left join discussion as dis on dis.dld_ID = dld.ID
  where class_ID = '$cid'
  group by dld.ID
SQL;
if($result->num_rows > 0)
  echo '<h2>Ke stažení</h2>' . PHP_EOL;
$result = $db->query($sql);
while($row = $result->fetch_assoc()) {
  $url = query('', ['discuss' => $row['id']]);
  $count = $row['count'] ? $row['count'] : '';
  $ccount = $row['count'] ? $row['count'] : 0;
  ob_start();
  include 'images/discussion.svg.php';
  $bubble = ob_get_clean();
  if(array_key_exists('discuss', $_GET) && $_GET['discuss'] == $row['id'])
    $discussion = get_discussion($cid, $row['id'], $data)['html'];
  else
    $discussion = '';

  print <<<HTML
<div class="download" id="download$row[id]" data-dldid="$row[id]" data-count="$ccount">
  <div class="icon">
    <a href="download/$row[filename]"><img src="images/download.svg" alt="$row[filename]"/></a>
  </div>
  <div class="text">
    <a href="download/$row[filename]">$row[description]</a>
  </div>
  <div class="bubble">\n
    <a href="$url" id="bubble$row[id]">
      $bubble
    </a>
  </div>
</div>
$discussion\n
HTML;
}

print <<<HTML
<div class="buttons">
HTML;

if($admin || get_records($cid, '', true, false)) {
  $notes_url = query('', ['c' => $cid, 's' => 'notes']);
  print <<<HTML
  <a class="button" href="$notes_url">Zápis z hodin</a>
HTML;
}

if($classInfo['tutorials'])
print <<<HTML
  <a class="button" href="$classInfo[tutorials]" target="_blank">Stránky cvičení</a>
HTML;

print <<<HTML
</div>
$admin_row
HTML;

$sql = <<<SQL
select coalesce(greatest(c1,c2),c1) from
  (select
    (select modified from classes where id="$cid") as c1,
    (select max(timestamp) from download where class_ID="$cid") as c2
  ) as sub
SQL;
$result = $db->query($sql);
if($result->num_rows > 0)
  $modtime = strtotime($result->fetch_row()[0]);
?>
