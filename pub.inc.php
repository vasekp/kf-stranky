<?php
$css[] = 'css/switch.css';
$scripts[] = 'shared.js';
$scripts[] = 'switch.js';
$scripts[] = 'pub.js';

$title = $en ? 'Publication list' : 'Seznam publikací';
$filters = [
  'selected' => $en ? 'Selected' : 'Vybrané',
  'recent' => $en ? 'Recent' : 'Nedávné',
  'all' => $en ? 'All' : 'Všechny'
];

$filter = array_key_exists('filter', $_GET) && in_array($_GET['filter'], array_keys($filters)) ? $_GET['filter'] : 'selected';

$list = [];
foreach($filters as $key => $name) {
  $href = modifyQuery(['filter' => $key]);
  $selected = $key == $filter ? ' class="selected"' : '';
  $list[] = <<<HTML
<a id="$key" href="$href"$selected>$name</a>
HTML;
}
$filters = join(PHP_EOL, $list);

$sql = 'select * from publications order by id desc';
$result = $db->query($sql);
$counter = 0;

$lines = [];
while($row = $result->fetch_assoc()) {
  $sets = [];
  if($counter++ < 5)
    $sets[] = 'recent';
  if($row['selected'])
    $sets[] = 'selected';
  if($filter != 'all' && !in_array($filter, $sets))
    $hide = ' class="hide"';
  else
    $hide = '';
  $lines[] = '<li data-sets="' . join(' ', $sets) . '"' . $hide . '>';

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
<div class="switch" id="pub-filter">
  $filters
</div>
<ol id="list">
  $list
</ol>
HTML;

$sql = 'select max(timestamp) from publications';
$result = $db->query($sql);
if($result->num_rows > 0)
  $modtime = strtotime($result->fetch_row()[0]);
?>
