<?php
include "pub-header-$prilang.inc.php";

$sql = 'select * from publications order by id desc';
$result = $db->query($sql);
$counter = 0;

print_indent(4, '<ol>');
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
  print_indent(5, '<li class="filter ' . join(' ', $filters) . '">' . $output. '</li>');
}
print_indent(4, '</ol>');
?>
