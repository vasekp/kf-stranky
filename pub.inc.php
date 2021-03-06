<?php
$css[] = 'css/pub.css';

$title = $en ? 'Publication list' : 'Seznam publikací';
$filters = [
  'selected' => $en ? 'Selected' : 'Vybrané',
  'recent' => $en ? 'Recent' : 'Nedávné',
  'all' => $en ? 'All' : 'Všechny'
];

$list1 = [];
$list2 = [];
foreach($filters as $key => $name) {
  $selected = $key == 'selected' ? ' checked' : '';
  $list1[] = <<<HTML
<input type="radio" name="category" id="$key"$selected/>
HTML;
  $list2[] = <<<HTML
<label for="$key">$name</label>
HTML;
}
$filters_cb = join(PHP_EOL, $list1);
$filters_label = join(PHP_EOL, $list2);

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
  $lines[] = '<li data-sets="' . join(' ', $sets) . '">';

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
$filters_cb
<div class="switch" id="pub-filter">
  $filters_label
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
