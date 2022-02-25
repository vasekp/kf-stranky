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

function buildQuery($baseURL, $array) {
  $url = parse_url($baseURL);
  $basename = basename($url['path']);
  if(strpos($basename, '.php') === false)
    $basename = '.';
  parse_str(@$url['query'], $search);
  $get = array_filter(array_merge($search, $array), 'strlen');
  if(!empty($get))
    return $basename . '?' . http_build_query($get, '', '&amp;');
  else
    return $basename;
}

function modifyQuery($array) {
  return buildQuery($_SERVER['REQUEST_URI'], $array);
}
?>
