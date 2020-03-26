<?php
$types = array(
  'BP' => ($en ? 'Bachelor\'s thesis' : 'bakalářská práce'),
  'VU' => ($en ? 'Research project' : 'výzkumný úkol'),
  'DP' => ($en ? 'Master\'s thesis' : 'diplomová práce'),
  'PhD' => ($en ? 'Doctoral thesis' : 'disertační práce')
);

$languages = array(
  'cz' => 'Czech',
  'sk' => 'Slovak'
);

echo '<h1>' . ($en ? 'Project supervision' : 'Školení') . '</h1>' . PHP_EOL;

$sql = "select url, title_$prilang as title from theses where state='open'";
$result = $db->query($sql);
$text = $en
  ? 'At present I am offering two topics, suitable for a Bachelor\'s project:'
  : 'V současnosti jsou otevřena dvě témata, vhodná pro bakalářskou práci:';
echo $text . PHP_EOL;
echo '<ul>' . PHP_EOL;
while($row = $result->fetch_assoc())
  echo '<li><a href="' . $row['url'] . '" target="_blank">' . $row['title'] . '</a></li>' . PHP_EOL;
echo '</ul>' . PHP_EOL;
$text = $en
  ? 'Further topics for students of Mathematical Physics can be found at <a href="https://physics.fjfi.cvut.cz/en/q3" target="_blank">the Q³ group website</a>.'
  : 'Studenti Matematické fyziky se mohou dále inspirovat na stránce <a href="https://physics.fjfi.cvut.cz/q3" target="_blank">naší skupiny</a>.';
echo $text . PHP_EOL;

$text = '<h2>' . ($en ? 'Current projects' : 'Současní studenti') . '</h2>';
echo $text . PHP_EOL;
$sql = "select student_name, title_$prilang as title, type, year from theses where state='current'";
$result = $db->query($sql);
echo '<ul>' . PHP_EOL;
while($row = $result->fetch_assoc()) {
  $output = '<li>' . $row['student_name'] . ', <i>' . $row['title'] . '</i> ';
  $output .= '(' . $types[$row['type']] . ')</li>';
  echo  $output . PHP_EOL;
}
echo '</ul>' . PHP_EOL;

$text = '<h2>' . ($en ? 'Past projects' : 'Obhájené práce') . '</h2>';
echo $text . PHP_EOL;
$sql = "select student_name, title_$prilang as title, type, year, language, url from theses where state='past' order by year desc";
$result = $db->query($sql);
echo '<ul>' . PHP_EOL;
while($row = $result->fetch_assoc()) {
  $output = '<li>' . $row['student_name'] . ', <i>';
  if($row['url'])
    $output .= '<a href="' . $row['url'] . '">' . $row['title'] . '</a>';
  else
    $output .= $row['title'];
  if($row['url'] && $en && $row['language'] && $row['language'] != 'en')
    $inlang = ', in ' . $languages[$row['language']];
  else
    $inlang = '';
  $output .= '</i> (' . $types[$row['type']] . ' ' . $row['year'] . '/' . ($row['year']%100 + 1) . $inlang . ')</li>';
  echo $output . PHP_EOL;
}
echo '</ul>' . PHP_EOL;

$sql = 'select max(timestamp) from theses';
$result = $db->query($sql);
if($result->num_rows > 0)
  $modtime = strtotime($result->fetch_row()[0]);
?>
