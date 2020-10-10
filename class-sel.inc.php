<?php
$title = $en ? 'Select class' : 'Výběr předmětu';

$sql = "select id, kos, title, year, semester from classes where year is not null order by year desc, semester desc";
$result = $db->query($sql);

$lastYear = 0;
$out = ['<ul>'];
while($row = $result->fetch_assoc()) {
  if($lastYear == 0) { // Initialize
    $curYear = $row['year'];
    $curSemester = $row['semester'];
    $lastYear = $curYear;
    $current = true;
  }
  if($row['year'] != $lastYear || $current == true && $row['year'] == $curYear && $row['semester'] != $curSemester) {
    $out[] = '</ul>';
    $out[] = '<h2>' . $row['year'] . '/' . ($row['year'] + 1) . '</h2>';
    $out[] = '<ul>';
    $current = false;
    $lastYear = $row['year'];
  }
  $href = modifyQuery(['c' => $row['id']]);
  $out[] = '<li><a href="' . $href . '" class="classic">' . htmlspecialchars($row['title'])
    . ' (' . $row['kos'] . ')</a></li>';
}
$out[] = '</ul>';
$list = join(PHP_EOL, $out);

print <<<HTML
<h1>$title</h1>
$list
HTML;
?>
