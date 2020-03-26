<?php
array_push($css, 'css/switch.css');
array_push($scripts, 'switch.js');
array_push($scripts, 'pub.js');

$title = $en ? 'Publication list' : 'Seznam publikací';
$filters = array(
  'selected' => $en ? 'Selected' : 'Vybrané',
  'recent' => $en ? 'Recent' : 'Nedávné',
  'all' => $en ? 'All' : 'Všechny'
);

$sql = 'select * from publications order by id desc';
$result = $db->query($sql);
$counter = 0;

$lines = [];
while($row = $result->fetch_assoc()) {
  $classes = array('f-all');
  if($counter++ < 5)
    array_push($classes, 'f-recent');
  if($row['selected'])
    array_push($classes, 'f-selected');
  $lines[] = '<li class="filter ' . join(' ', $classes) . '">';

  $lines[] = str_replace('V. Potoček', '<b>V. Potoček</b>', $row['authors']) . '.';

  if($row['fullurl'])
    $line = '<a href="' . $row['fullurl'] . '"><i>' . $row['title'] . '</i>.</a>';
  else
    $line = '<i>' . $row['title'] . '</i>.';
  $lines[] = $line;

  if($row['journal']) {
    $line = <<<HTML
$row[journal]&nbsp;<b>$row[volume]</b>, $row[ref] ($row[year])
HTML;
    if($row['comment'])
      $line .= ' ★ ' . $row['comment'];
    if($row['doi'])
      $line .= ', doi: <a href="https://dx.doi.org/' . $row['doi'] . '" target="_blank">'
        . str_replace('/', '/<wbr/>', $row['doi']) . '</a>';
    $lines[] = $line;
  }
  else if($row['type'] == 'preprint')
    $lines[] = <<<HTML
Preprint at <a href="https://arxiv.org/abs/$row[arxiv]" target="_blank">arXiv:$row[arxiv] [$row[arxiv2]]</a>'
HTML;

  $lines[] = '</li>';
}
$list = join(PHP_EOL, $lines);

print <<<HTML
<h1>$title</h1>
<div class="switch hide" id="pub-filter">
  <a id="selected" href="#">{$filters['selected']}</a>
  <a id="recent" href="#">{$filters['recent']}</a>
  <a id="all" href="#">{$filters['all']}</a>
</div>
<ol>
  $list
</ol>
HTML;

$sql = 'select max(timestamp) from publications';
$result = $db->query($sql);
if($result->num_rows > 0)
  $modtime = strtotime($result->fetch_row()[0]);
?>
