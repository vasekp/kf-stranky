<?php
$page_does_not_exist = $en ? 'This page does not exist.' : 'Tato stránka neexistuje.';
$please_report_on = $en ? 'Please report this error on' : 'Prosím nahlašte chybu na';
$github = $en ? 'GitHub' : 'GitHubu';
$url = 'https://github.com/vasekp/kf-stranky/issues';

http_response_code(400);

print <<<HTML
<div class="error">
  $page_does_not_exist
  <br/>
  $please_report_on <a href="$url" target="_blank">$github</a>.
</div>\n
HTML;
?>
