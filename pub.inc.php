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

print <<<HTML
<h1>$title</h1>
<div class="switch hide" id="pub-filter">
  <a id="selected" href="#">{$filters['selected']}</a>
  <a id="recent" href="#">{$filters['recent']}</a>
  <a id="all" href="#">{$filters['all']}</a>
</div>\n
HTML;

$sql = 'select * from publications order by id desc';
$result = $db->query($sql);
$counter = 0;

echo '<ol>' . PHP_EOL;
while($row = $result->fetch_assoc()) {
  $filters = array('f-all');
  if($counter++ < 5)
    array_push($filters, 'f-recent');
  if($row['selected'])
    array_push($filters, 'f-selected');
  $output = str_replace('V. Potoček', '<b>V. Potoček</b>', $row['authors']) . '. ';
  if($row['fullurl'])
    $output .= '<a href="' . $row['fullurl'] . '"><i>' . $row['title'] . '</i></a>. ';
  else
    $output .= '<i>' . $row['title'] . '</i>. ';
  if($row['journal']) {
    $output .= $row['journal'] . '&nbsp;<b>' . $row['volume'] . '</b>, ' . $row['ref'];
    $output .= ' (' . $row['year'] . ')';
    if($row['comment'])
      $output .= ' ★ ' . $row['comment'];
    if($row['doi'])
      $output .= ', doi: <a href="https://dx.doi.org/' . $row['doi'] . '" target="_blank">'
        . str_replace('/', '/<wbr/>', $row['doi']) . '</a>';
  }
  else if($row['type'] == 'preprint')
    $output .= 'Preprint at <a href="https://arxiv.org/abs/' . $row['arxiv'] . '" target="_blank">'
        . 'arXiv:' . $row['arxiv'] . ' [' . $row['arxiv2'] . ']</a>';
  echo '<li class="filter ' . join(' ', $filters) . '">' . $output. '</li>' . PHP_EOL;
}
echo '</ol>' . PHP_EOL;

$sql = 'select max(timestamp) from publications';
$result = $db->query($sql);
if($result->num_rows > 0)
  $modtime = strtotime($result->fetch_row()[0]);
?>
