<?php
$page_not_found = $en
  ? 'Page not found. Please continue by choosing one of the menu items.'
  : 'Požadovaná stránka nebyla nalezena. Vyberte si prosím z menu výše.';
$please_report_on = $en
  ? 'If you think this is an error, please report it on'
  : 'Jestliže Vás sem dovedl některý odkaz, nahlašte prosím chybu na';
$github = $en ? 'GitHub' : 'GitHubu';
$url = 'https://github.com/vasekp/kf-stranky/issues';

print <<<HTML
<div class="warn">
  $page_not_found
  <br/>
  $please_report_on <a href="$url" target="_blank">$github</a>.
</div>
HTML;
?>
