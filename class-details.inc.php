<?php
$css[] = 'css/comments.css';
$scripts[] = 'comments.js';
if($admin)
  $scripts[] = 'class-details-admin.js';

include 'comments-common.inc.php';
include 'class-upload.inc.php';
include_once 'class-notes-common.inc.php';

$announces_title = $classLang == 'en' ? 'Announcements' : 'Aktuality';
$downloads_title = $classLang == 'en' ? 'Downloads' : 'Ke stažení';
$notes_title = $classLang == 'en' ? 'Class notes' : 'Zápis z hodin';
$tutorials_title = $classLang == 'en' ? 'Tutorials' : 'Stránky cvičení';

$postProcessed = null;
if($_SERVER['REQUEST_METHOD'] == 'POST') {
  if(@$_POST['context'] == 'upload')
    process_upload();
  else
    $postProcessed = comments_submit($_POST);
}

$sql = "select title, KOS, intro, announces, tutorials from classes where ID='$cid'";
$result = $db->query($sql);
$classInfo = $result->fetch_assoc();
$classInfo['title'] = htmlspecialchars($classInfo['title']);
$selLink = modifyQuery(['c' => 'sel']);

print <<<HTML
<h1>
$classInfo[title] <span class="smaller">($classInfo[KOS])</span>
<a href="$selLink"><img id="more" class="inline-img" src="images/more.svg"/></a>
</h1>
<div id="intro">
  $classInfo[intro]
</div>\n
HTML;

if($classInfo['announces'] || $admin)
  print <<<HTML
<h2>$announces_title</h2>
<div id="announces">
  $classInfo[announces]
</div>\n
HTML;

$sql = "select ID, thread_ID, filename, description from download where class_ID = '$cid'";
$result = $db->query($sql);
if($result->num_rows > 0)
  echo "<h2>$downloads_title</h2>\n";
while($row = $result->fetch_assoc()) {
  $id = $row['ID'];
  $data = get_comments_static($row['thread_ID'], $postProcessed, $row['thread_ID'] === @$_GET['comments']);
  $desc = htmlspecialchars($row['description']);
  if(!$admin) {
  print <<<HTML
<div class="comments-host" data-tid="$row[thread_ID]" data-count="$data[count]">
  <div class="download">
    <a href="download/$row[filename]"><img class="icon" src="images/download.svg" alt="$row[filename]"/></a>
    <a class="text" href="download/$row[filename]">$desc</a>
    <div class="comments-bubble">
      $data[bubble]
    </div>
  </div>
  <div class="comments-container">
    $data[comments]
  </div>
</div>\n
HTML;
  } else {
    print <<<HTML
<form method="post" enctype="multipart/form-data">
  <div class="comments-host" data-tid="$row[thread_ID]" data-count="$data[count]">
    <div class="download">
      <label for="file$id">
        <img class="icon empty" src="images/file-update.svg" alt="Replace file"/>
      </label>
      <input class="hide" type="file" name="file" id="file$id" accept=".pdf"/>
      <input class="text" type="text" name="desc" value="$desc"/>
      <input type="hidden" name="context" value="upload"/>
      <input type="hidden" name="admin_pass" value="$_GET[admin]"/>
      <input type="hidden" name="dld_ID" value="$id"/>
      <button type="submit" name="query" value="edit"/><img src="images/edit.svg"/></button>
      <button type="submit" name="query" value="delete"/><img src="images/cross.svg"/></button>
      <div class="comments-bubble">
        $data[bubble]
      </div>
    </div>
    <div class="comments-container">
      $data[comments]
    </div>
  </div>
</form>\n
HTML;
  }
}

if($admin)
  print <<<HTML
<form method="post" enctype="multipart/form-data">
  <div class="download">
    <label for="file-new">
      <img class="icon empty" src="images/upload.svg" id="upload-icon" alt="Upload"/>
    </label>
    <input class="hide" type="file" name="file" id="file-new" accept=".pdf"/>
    <input class="text" type="text" name="desc"/>
    <input type="hidden" name="context" value="upload"/>
    <input type="hidden" name="query" value="upload"/>
    <input type="hidden" name="admin_pass" value="$_GET[admin]"/>
    <input type="hidden" name="class_ID" value="$cid"/>
    <input type="hidden" name="lang" value="$classLang"/>
    <input type="submit" id="upload-submit" value="Upload" disabled/>
  </div>
</form>
HTML;


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
