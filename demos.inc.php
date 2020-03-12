<?php
$demo = array_key_exists('demo', $_GET) ? $_GET['demo'] : '';

if(!preg_match('/^[a-z0-9_-]+/', $demo) || !is_dir('demos/' . $demo))
  $demo = '';

if($demo == '')
  include 'demos-intro.inc.php';
else {
  $demodir = 'demos/' . $demo;
  $demofn = "$demodir/$demo.inc.php";
  if(!file_exists($demofn)) {
    include 'hard-error.inc.php';
    return;
  }
  $modtime = filemtime($demofn);

  if($early) {
    include $demofn;
    return;
  }

  $sql = "select title_$prilang as title, details_$prilang as details from demos where name='$demo'";
  $result = $db->query($sql);
  if($result->num_rows == 0) {
    include 'hard-error.inc.php';
    return;
  }
  $demorow = $result->fetch_assoc();

  $demotitle = $demorow['title'];
  include $demofn;

  $text = $en ? 'See also' : 'Další';
  print_indent(4, '<h2>' . $text . '</h2>');
  print_indent(4, '<ul>');
  if($demorow['details']) {
    $text = $en ? 'More details (PDF)' : 'Další informace (PDF)';
    print_indent(5, '<li><a href="' . $demorow['details'] . '">' . $text . '</a></li>');
  }
  $text = $en ? "Source code" : "Zdrojový kód";
  print_indent(5, '<li><a href="https://github.com/vasekp/kf-stranky/tree/demos/demos/' . $demo . '" '
    . 'target="_blank">' . $text . '</a></li>');
  $text = $en ? 'Back to list' : 'Zpět na seznam';
  print_indent(5, '<li><a href="' . query('demos.php', array()) . '">' . $text . '</a></li>');
  print_indent(4, '</ul>');
}
?>
