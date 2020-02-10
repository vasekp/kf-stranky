        <h1>Školení</h1>
<?php
$sql = "select url, title_cs as title from theses where state='open'";
$result = $db->query($sql);
?>
        V současnosti jsou otevřena dvě témata, vhodná pro bakalářskou práci:
        <ul>
<?php
while($row = $result->fetch_assoc())
  print_indent(5, "<li><a href=\"" . $row["url"] . "\" target=\"_blank\">" . $row["title"] . "</a></li>");
?>
        </ul>
        Studenti Matematické fyziky se mohou dále inspirovat na stránce <a href="https://physics.fjfi.cvut.cz/q3" target="_blank">naší skupiny</a>.
        <h2>Současní studenti</h2>
        <ul>
<?php
$types = array(
  "BP" => "bakalářská práce",
  "VU" => "výzkumný úkol",
  "DP" => "diplomová práce",
  "PhD" => "disertační práce"
);

$sql = "select student_name, title_cs as title, type, year from theses where state='current'";
$result = $db->query($sql);
while($row = $result->fetch_assoc()) {
  $output = "<li>" . $row["student_name"] . ", <i>" . $row["title"] . "</i> ";
  $output .= "(" . $types[$row["type"]] . ")</li>";
  print_indent(5,  $output);
}
?>
        </ul>
        <h2>Obhájené práce</h2>
        <ul>
<?php
$sql = "select student_name, title_cs as title, type, year, url from theses where state='past' order by year desc";
$result = $db->query($sql);
while($row = $result->fetch_assoc()) {
  $output = "<li>" . $row["student_name"] . ", <i>";
  if($row["url"])
    $output .= "<a href=\"" . $row["url"] . "\">" . $row["title"] . "</a>";
  else
    $output .= $row["title"];
  $output .= "</i> (" . $types[$row["type"]] . " " . $row["year"] . "/" . ($row["year"]%100 + 1) . ")</li>";
  print_indent(5,  $output);
}
?>
        </ul>
