<?php
print_indent(4, '<div class="error">');
print_indent(5, $en ? 'This page does not exist.' : 'Tato stránka neexistuje.');
print_indent(5, '<br/>');
$text = $en ? 'Please report this error on ' : 'Prosím nahlašte chybu na ';
$text .= '<a href="https://github.com/vasekp/kf-stranky/issues" target="_blank">';
$text .= $en ? 'GitHub' : 'GitHubu';
$text .= '</a>.';
print_indent(5, $text);
print_indent(4, '</div>');
?>
