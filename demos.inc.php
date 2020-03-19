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

  $seealso = $en ? 'See also' : 'Další';
  $more = $en ? 'More details (PDF)' : 'Další informace (PDF)';
  $source = $en ? "Source code" : "Zdrojový kód";
  $back = $en ? 'Back to list' : 'Zpět na seznam';
  if($demorow['details'])
    $morerow = '<li><a href="' . $demorow['details'] . '">' . $more . '</a></li>';
  else
    $morerow = '';

print <<<HTML
<h2>$seealso</h2>
<ul>
$morerow
<li><a href="https://github.com/vasekp/kf-stranky/tree/demos/demos/$demo" target="_blank">$source</a></li>
<li><a href="{query('demos.php', array())}">$back</a></li>
</ul>\n
HTML;
}
?>
