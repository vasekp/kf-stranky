<?php
include 'secret.inc.php';

setlocale(LC_ALL, 'cs_CZ.utf8');
date_default_timezone_set('Europe/Prague');

function open_db() {
  global $secrets;
  $conn = new mysqli($secrets['dbserver'], 'potocvac', $secrets['dbpw'], 'potocvac');

  if($conn->connect_error)
    return null;
  $conn->set_charset('utf8');
  return $conn;
}

function print_indent($offset, $text) {
  echo str_repeat('  ', $offset);
  echo $text;
  echo "\n";
}

function indent($text) {
  $in = 0;
  $arr = explode(PHP_EOL, $text);
  $out = '';
  foreach($arr as $line) {
    $diff = 0;
    preg_match_all('/<(.)/', $line, $matches);
    foreach($matches[1] as $m) {
      if($m == '!') continue;
      if($m == '/') $diff--;
      else $diff++;
    }
    preg_match_all('/\/>/', $line, $matches);
    foreach($matches[0] as $m) {
      $diff--;
    }
    if($diff < 0)
      $in += $diff;
    if($in < 0) {
      if($debug)
        $out .= '<!-- INDENT ERR: in < 0 -->';
      $in = 0;
    }
    $out .= str_repeat('  ', $in) . trim($line) . PHP_EOL;
    if($diff > 0)
      $in += $diff;
  }
  if($in > 0 && $debug)
    $out .= '<!-- INDENT ERR: in > 0 -->';
  return $out;
}

function query($script, $array = array()) {
  global $en;
  if($en && !array_key_exists('l', $array))
    $array['l'] = 'en';
  $q = http_build_query($array, '', '&amp;');
  $ret = $script . ($q ? '?' . $q : '');
  return $ret ? $ret : '#';
}
?>
