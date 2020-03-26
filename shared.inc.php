<?php
include 'secret.inc.php';

setlocale(LC_ALL, 'cs_CZ.utf8');
mb_internal_encoding('UTF-8');
date_default_timezone_set('Europe/Prague');

function open_db() {
  global $secrets;
  $conn = @new mysqli($secrets['dbserver'], 'potocvac', $secrets['dbpw'], 'potocvac');

  if($conn->connect_error)
    return null;
  $conn->set_charset('utf8');
  return $conn;
}

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

function query($script /*, ...$arrays*/) {
  global $en;
  if($en)
    $array = ['l' => 'en'];
  else
    $array = [];
  for($i = 1; $i < func_num_args(); $i++)
    $array = array_merge($array, func_get_arg($i));
  $q = http_build_query($array, '', '&amp;');
  $ret = $script . ($q ? '?' . $q : '');
  return $ret ? $ret : '#';
}
?>
