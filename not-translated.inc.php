<?php
if(!$early)
  print_indent(4, '<span class="warn">This page has not yet been translated to English, displaying the Czech version.</span>');

include str_replace('-en', '', $filename);
?>
