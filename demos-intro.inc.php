<?php
if($early)
  return;

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
      print_indent(4, '</ul>');
    print_indent(4, '<h2>' . $topics[$row['tid']] . '</h2>');
    $lasttid = $row['tid'];
    print_indent(4, '<ul>');
  }
  print_indent(5, '<li><a href="' . query('', array('demo' => $row['name'])) . '">' . $row['title'] . '</a></li>');
}
if($lasttid != -1)
  print_indent(4, '</ul>');

$sql = 'select max(timestamp) from demos';
$result = $db->query($sql);
if($result->num_rows > 0)
  $modtime = strtotime($result->fetch_row()[0]);
else
  $modtime = filemtime(__FILE__);
?>
