<?php
if($early)
  return;

include "demos-header-$prilang.inc.php";

$sql = "select id, title_$prilang as title from demo_topics";
$result = $db->query($sql);
$topics = array();
while($row = $result->fetch_assoc())
  $topics[$row['id']] = $row['title'];

$sql = "select name, topic_ID as tid, title_$prilang as title from demos order by topic_ID";
$result = $db->query($sql);
$lasttid = -1;
while($row = $result->fetch_assoc()) {
  if($row['tid'] != $lasttid) {
    if($lasttid != -1)
      echo '</ul>' . PHP_EOL;
    echo '<h2>' . $topics[$row['tid']] . '</h2>' . PHP_EOL;
    $lasttid = $row['tid'];
    echo '<ul>' . PHP_EOL;
  }
  echo '<li><a href="' . query('', array('demo' => $row['name'])) . '">' . $row['title'] . '</a></li>' . PHP_EOL;
}
if($lasttid != -1)
  echo '</ul>' . PHP_EOL;

$sql = 'select max(timestamp) from demos';
$result = $db->query($sql);
if($result->num_rows > 0)
  $modtime = strtotime($result->fetch_row()[0]);
else
  $modtime = filemtime(__FILE__);
?>
