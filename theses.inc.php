<?php
$types = [
  'BP' => ($en ? 'Bachelor\'s thesis' : 'bakalářská práce'),
  'VU' => ($en ? 'Research project' : 'výzkumný úkol'),
  'DP' => ($en ? 'Master\'s thesis' : 'diplomová práce'),
  'PhD' => ($en ? 'Doctoral thesis' : 'disertační práce')
];

$languages = [
  'cz' => 'Czech',
  'sk' => 'Slovak'
];

$title = $en ? 'Project supervision' : 'Školení';
$curr_header = $en ? 'Current projects' : 'Současní studenti';
$past_header = $en ? 'Past projects' : 'Obhájené práce';

$open_intro = $en
  ? 'At present I am offering two topics, suitable for a Bachelor\'s project:'
  : 'V současnosti jsou otevřena dvě témata, vhodná pro bakalářskou práci:';

$open_outro = $en
  ? 'Further topics for students of Mathematical Physics can be found at <a href="https://physics.fjfi.cvut.cz/en/q3" target="_blank">the Q³ group website</a>.'
  : 'Studenti Matematické fyziky se mohou dále inspirovat na stránce <a href="https://physics.fjfi.cvut.cz/q3" target="_blank">naší skupiny</a>.';

$open_list = [];
$sql = "select url, title_$prilang as title from theses where state='open'";
$result = $db->query($sql);
while($row = $result->fetch_assoc())
  $open_list[] = '<li><a href="' . $row['url'] . '" target="_blank">' . $row['title'] . '</a></li>';
$open_list = join(PHP_EOL, $open_list);

$curr_list = [];
$sql = "select student_name, title_$prilang as title, type, year from theses where state='current'";
$result = $db->query($sql);
while($row = $result->fetch_assoc())
  $curr_list[] = '<li>' . $row['student_name'] . ', <i>' . $row['title'] . '</i> (' . $types[$row['type']] . ')</li>';
$curr_list = join(PHP_EOL, $curr_list);

$past_list = [];
$sql = "select student_name, title_$prilang as title, type, year, language, url from theses where state='past' order by year desc";
$result = $db->query($sql);
while($row = $result->fetch_assoc()) {
  $line = '<li>' . $row['student_name'] . ', <i>';
  if($row['url'])
    $line .= '<a href="' . $row['url'] . '">' . $row['title'] . '</a>';
  else
    $line .= $row['title'];
  if($row['url'] && $en && $row['language'] && $row['language'] != 'en')
    $inlang = ', in ' . $languages[$row['language']];
  else
    $inlang = '';
  $line .= '</i> (' . $types[$row['type']] . ' ' . $row['year'] . '/' . ($row['year']%100 + 1) . $inlang . ')</li>';
  $past_list[] = $line;
}
$past_list = join(PHP_EOL, $past_list);

print <<<HTML
<h1>$title</h1>
$open_intro
<ul>
  $open_list
</ul>
$open_outro

<h2>$curr_header</h2>
<ul>
  $curr_list
</ul>

<h2>$past_header</h2>
<ul>
  $past_list
</ul>
HTML;

$sql = 'select max(timestamp) from theses';
$result = $db->query($sql);
if($result->num_rows > 0)
  $modtime = strtotime($result->fetch_row()[0]);
?>
