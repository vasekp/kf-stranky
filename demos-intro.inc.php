<?php
$title = $en ? 'Physical demonstrations' : 'Fyzikální ukázky';
$github_url = 'https://github.com/vasekp/kf-stranky/issues';
$intro_text = $en
  ? 'This is a growing list of interactive demonstrations from various parts of physics.'
  : 'Na této stránce se budou postupně objevovat interaktivní ukázky z různých oblastí fyziky.';
$report_bugs = $en
  ? 'The demos should work in most modern browsers including mobile. If something does not display correctly or the interactive elements are not responsive, please use the bug reporting link.'
  : 'Ukázky by měly fungovat na většině moderních prohlížečů včetně mobilních zařízení. Pokud se něco nezobrazuje správně nebo interakční prvky nereagují, použijte prosím možnosti pro nahlášení chyb.';

$sql = "select id, title_$prilang as title from demo_topics order by title";
$result = $db->query($sql);
$topics = [];
while($row = $result->fetch_assoc())
  $topics[$row['id']] = [
    'title' => $row['title'],
    'demos' => []
  ];

$sql = "select name, topic_ID as tid, title_$prilang as title from demos order by timestamp";
$result = $db->query($sql);
while($row = $result->fetch_assoc()) {
  if(file_exists("demos/$row[name]/$row[name].inc.php"))
    $topics[$row['tid']]['demos'][] = [
      'title' => $row['title'],
      'url' => modifyQuery(['demo' => $row['name']])
    ];
}

foreach($topics as &$topic) {
  $list = [];
  foreach($topic['demos'] as $demo)
    $list[] = '<li><a href="' . $demo['url'] . '" class="classic">' . $demo['title'] . '</a></li>';
  $topic['list'] = join(PHP_EOL, $list);
}

print <<<HTML
<h1>$title</h1>
<p>$intro_text</p>
<p>$report_bugs</p>\n
HTML;

foreach($topics as &$topic) {
  if(count($topic['demos']) == 0)
    continue;
  print <<<HTML
<h2>$topic[title]</h2>
<ul>
  $topic[list]
</ul>\n
HTML;
}

$sql = 'select max(timestamp) from demos';
$result = $db->query($sql);
if($result->num_rows > 0)
  $modtime = strtotime($result->fetch_row()[0]);
else
  $modtime = filemtime(__FILE__);
?>
