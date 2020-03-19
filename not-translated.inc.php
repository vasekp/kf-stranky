<?php
if(!$early)
  echo '<span class="warn">This page has not yet been translated to English, displaying the Czech version.</span>' . PHP_EOL;

include str_replace('-en', '', $filename);
?>
