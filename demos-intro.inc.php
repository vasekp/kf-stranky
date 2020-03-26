<?php
$title = $en ? 'Physical demonstrations' : 'Fyzikální ukázky';
$github = 'https://github.com/vasekp/kf-stranky/issues';
$l1 = $en
  ? 'This is a growing list of interactive demonstrations from various parts of physics. Some demos may not work in older browsers or on mobile devices.'
  : 'Na této stránce se budou postupně objevovat interaktivní ukázky z různých oblastí fyziky. Ukázky nemusejí fungovat ve starších prohlížečích nebo na mobilních zařízeních.';
$l2 = $en
  ? 'This is a test deployment, please report any bugs and suggestions on'
  : 'Jedná se o testovací nasazení, případné chyby a náměty prosím přidávejte na';

print <<<HTML
<h1>$title</h1>
<p>$l1</p>
<p>$l2 <a href="$github" target="_blank">GitHub</a>.</p>\n
HTML;

$sql = "select id, title_$prilang as title from demo_topics order by title";
$result = $db->query($sql);
$topics = array();
while($row = $result->fetch_assoc())
  $topics[$row['id']] = array(
    'title' => $row['title'],
    'demos' => array()
  );

$sql = "select name, topic_ID as tid, title_$prilang as title from demos order by timestamp";
$result = $db->query($sql);
while($row = $result->fetch_assoc()) {
  if(file_exists("demos/{$row['name']}/{$row['name']}.inc.php"))
    $topics[$row['tid']]['demos'][] = array(
      'title' => $row['title'],
      'url' => query('', array('demo' => $row['name']))
    );
}

foreach($topics as $topic) {
  if(count($topic['demos']) == 0)
    continue;
  echo '<h2>' . $topic['title'] . '</h2>' . PHP_EOL;
  echo '<ul>' . PHP_EOL;
  foreach($topic['demos'] as $demo)
    echo '<li><a href="' . $demo['url'] . '">' . $demo['title'] . '</a></li>' . PHP_EOL;
  echo '</ul>' . PHP_EOL;
}

$sql = 'select max(timestamp) from demos';
$result = $db->query($sql);
if($result->num_rows > 0)
  $modtime = strtotime($result->fetch_row()[0]);
else
  $modtime = filemtime(__FILE__);
?>
