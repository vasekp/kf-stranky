<?php
$css[] = 'css/comments.css';
$scripts[] = 'comments.js';
if($admin)
  $scripts[] = 'class-details-admin.js';

include 'comments-common.inc.php';
include_once 'class-notes-common.inc.php';

$announces_title = $classLang == 'en' ? 'Announcements' : 'Aktuality';
$downloads_title = $classLang == 'en' ? 'Downloads' : 'Ke stažení';
$notes_title = $classLang == 'en' ? 'Class notes' : 'Zápis z hodin';
$tutorials_title = $classLang == 'en' ? 'Tutorials' : 'Stránky cvičení';
$comments_title = $classLang == 'en' ? 'Comments' : 'Diskuze';

if($_SERVER['REQUEST_METHOD'] == 'POST')
  $data = comments_submit($_POST);
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

if($classInfo['announces'] || $admin) print <<<HTML
<h2>$announces_title</h2>
<div id="announces">
  $classInfo[announces]
</div>\n
HTML;

$sql = <<<SQL
select dld.thread_ID as tid, filename, description, count(comm.ID) as count
  from download as dld
  left join comments as comm on comm.thread_ID = dld.thread_ID
  where class_ID = '$cid'
  group by dld.thread_ID
SQL;
if($result->num_rows > 0)
  echo "<h2>$downloads_title</h2>\n";
$result = $db->query($sql);
while($row = $result->fetch_assoc()) {
  $url = modifyQuery(['comments' => $row['tid']]);
  $count = $row['count'] ? $row['count'] : 0;
  if(array_key_exists('comments', $_GET) && $_GET['comments'] == $row['tid'])
    $comments = get_comments($row['tid'], $data)['html'];
  else
    $comments = '';

  print <<<HTML
<div class="comments-host" data-tid="$row[tid]" data-count="$count">
  <div class="download">
    <div class="icon">
      <a href="download/$row[filename]"><img src="images/download.svg" alt="$row[filename]"/></a>
    </div>
    <div class="text">
      <a href="download/$row[filename]">$row[description]</a>
    </div>
    <div class="comments-enter">
      <a href="$url">
        $comments_title ($count)
      </a>
    </div>
  </div>
  <div class="comments-container">
    $comments
  </div>
</div>\n
HTML;
}

print <<<HTML
<div class="buttons">
HTML;

if($admin || get_records($cid, '', true, false)) {
  $notes_url = modifyQuery(['s' => 'notes', 'comments' => null]);
  print <<<HTML
  <a class="button" href="$notes_url">$notes_title</a>
HTML;
}

if($classInfo['tutorials'])
print <<<HTML
  <a class="button" href="$classInfo[tutorials]" target="_blank">$tutorials_title</a>
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
