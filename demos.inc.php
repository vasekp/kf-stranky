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
  echo '<h2>' . $text . '</h2>' . PHP_EOL;
  echo '<ul>' . PHP_EOL;
  if($demorow['details']) {
    $text = $en ? 'More details (PDF)' : 'Další informace (PDF)';
    echo '<li><a href="' . $demorow['details'] . '">' . $text . '</a></li>' . PHP_EOL;
  }
  $text = $en ? "Source code" : "Zdrojový kód";
  echo '<li><a href="https://github.com/vasekp/kf-stranky/tree/demos/demos/' . $demo . '" '
    . 'target="_blank">' . $text . '</a></li>' . PHP_EOL;
  $text = $en ? 'Back to list' : 'Zpět na seznam';
  echo '<li><a href="' . query('demos.php', array()) . '">' . $text . '</a></li>' . PHP_EOL;
  echo '</ul>' . PHP_EOL;
}
?>
