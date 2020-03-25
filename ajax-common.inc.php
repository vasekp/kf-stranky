<?php
function check_presence($test, $key) {
  if(!array_key_exists($key, $test))
    return "$key missing";
}

function check_values($test, $key, $values) {
  if(!array_key_exists($key, $test))
    return "$key missing";
  $success = 0;
  $value = $test[$key];
  foreach($values as $k => $v) {
    if(is_numeric($k) && $value === $v)
      $success = true;
    else if($value === $k) {
      $ret = test_fields($test, $v);
      if($ret !== null)
        return $ret;
      else
        $success = true;
    }
  }
  if(!$success)
    return "$key has unknown value";
}

function test_fields($test, $req) {
  foreach($req as $k => $v) {
    if(is_numeric($k))
      $ret = check_presence($test, $v);
    else
      $ret = check_values($test, $k, $v);
    if($ret !== null)
      return $ret;
  }
}

function ajax_setup($req = [], $pass = false) {
  if($_SERVER['REQUEST_METHOD'] != 'POST') {
    http_response_code(400);
    exit();
  }

  $ret = test_fields($_POST, $req);
  if($ret !== null) {
    echo $ret;
    http_response_code(400);
    exit();
  }

  if($pass) {
    global $secrets;
    if(!array_key_exists('pass', $_POST) || $_POST['pass'] != $secrets['adminpw']) {
      echo "Password doesn't match.";
      http_response_code(403);
      exit();
    }
  }

  global $db;
  $db = open_db();
  if(!$db) {
    echo "Database connection failed";
    http_response_code(500);
    exit();
  }

  header('Content-type: application/json');
}
?>
