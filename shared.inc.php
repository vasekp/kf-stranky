<?php
include 'secret.inc.php';

setlocale(LC_ALL, 'cs_CZ.utf8');
date_default_timezone_set('Europe/Prague');

function open_db() {
  global $secrets;
  $conn = new mysqli('kmlinux.fjfi.cvut.cz', 'potocvac', $secrets['dbpw'], 'potocvac');

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

function query($script, $array = array()) {
  global $en;
  if($en && !array_key_exists('l', $array))
    $array['l'] = 'en';
  $q = http_build_query($array, '', '&amp;');
  $ret = $script . ($q ? '?' . $q : '');
  return $ret ? $ret : '#';
}
?>
