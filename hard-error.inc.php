<?php
if($early)
  return;

$url = 'https://github.com/vasekp/kf-stranky/issues';
$dne = $en ? 'This page does not exist.' : 'Tato stránka neexistuje.';
$rep = $en
  ? 'Please report this error on <a href="' . $url . '" target="_blank">GitHub.</a>'
  : 'Prosím nahlašte chybu na <a href="' . $url . '" target="_blank">GitHubu.</a>';

print <<<HTML
<div class="error">
  $dne
  <br/>
  $rep
</div>\n
HTML;
?>
