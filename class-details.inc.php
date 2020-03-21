<?php
if($early) {
  array_push($scripts, 'class-details.js');
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
  print <<<HTML
<div class="download">
  <div class="icon">
    <a href="download/{$row['filename']}"><img src="images/download.svg" alt="{$row['filename']}"/></a>
  </div>
  <div class="text">
    {$row['description']}
  </div>
  <div class="bubble">\n
HTML;
  $content = $row['count'] ? $row['count'] : '';
  include 'images/discussion.svg.php';
  print <<<HTML
  </div>
</div>\n
HTML;

  $sql2 = "select name, text, timestamp from discussion where dld_ID='{$row['id']}'";
  $result2 = $db->query($sql2);
  while($row2 = $result2->fetch_assoc()) {
    $name = $row2['name'];
    if($name)
      $namespan = '<span class="name' . ($name == 'VP' ? ' vp' : '') . '">' . $name . ':</span>';
    else
      $namespan = '';
    $date = date('j.n.Y G:i', strtotime($row2['timestamp']));
    print <<<HTML
<div class="discussion">
  <div class="item">
    <span class="date">$date</span>
    $namespan
    {$row2['text']}
  </div>
  <div class="item">
    <textarea></textarea>
    <button id="send">Odeslat</button>
    <p>Iniciály (nepovinné): <input id="name" type="text" maxlength="3" pattern="[a-zA-Z]{0,3}"/></p>
    <p>Opište první slovo ze strany 423: <input id="captcha" type="text"/></p>
  </div>
</div>\n
HTML;
  }
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
