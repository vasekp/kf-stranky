<?php
function indent($text) {
  global $debug;
  $in = 0;
  $arr = explode(PHP_EOL, $text);
  $out = '';
  foreach($arr as $line) {
    $diff = 0;
    $line = trim($line);
    if($line == '')
      continue;
    preg_match_all('/<(.)/', $line, $matches);
    foreach($matches[1] as $m) {
      $diff++;
      if($m == '!') continue;
      if($m == '/') $diff--;
      else $diff++;
    }
    preg_match_all('/(\/)?>/', $line, $matches);
    foreach($matches[1] as $m) {
      $diff--;
      if($m == '/') $diff--;
    }
    if($diff < 0 && $line[0] == '<') {
      $in += $diff;
      $diff = 0;
    }
    if($in < 0) {
      if($debug)
        $out .= '<!-- INDENT ERR: in < 0 -->';
      $in = 0;
    }
    $out .= str_repeat('  ', $in) . $line . PHP_EOL;
    $in += $diff;
  }
  if($in > 0 && $debug)
    $out .= '<!-- INDENT ERR: in > 0 -->';
  return $out;
}
?>
