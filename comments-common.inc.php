<?php
const STATUS_OK = 'ok';
const STATUS_INCOMPLETE = 'incomplete';
const STATUS_ALERT = 'alert';
const STATUS_FAIL = 'fail';

function validate_tid($tid) {
  return is_numeric($tid);
}

function validate_tid_get_lang($tid) {
  global $db;
  $sql = 'select lang from comment_threads where id=?';
  $st = $db->prepare($sql);
  $st->bind_param('i', $tid);
  $st->execute();
  $st->bind_result($lang);
  if(!$st->fetch())
    return null;
  else
    return $lang;
}

function gen_captcha($tid, $count, $attempt, $result) {
  $random = secret_pseudorandom($tid, $count, $attempt);
  $result->data_seek($random % $result->num_rows);
  $word = $result->fetch_row()[0];
  $len = mb_strlen($word);
  $i1 = ($random % ($len - 2)) + 1;
  $i2 = ($random % ($len - 3)) + 1;
  $i3 = ($random % ($len - 4)) + 1;
  if($i2 >= $i1) $i2++;
  if($i3 >= min($i1, $i2)) $i3++;
  if($i3 >= max($i1, $i2)) $i3++;
  //Assertion: $i1, $i2, $i3 three different indices from [1, length-1)
  $indices = [$i1, $i2, $i3];
  sort($indices);
  $letters = preg_split('//u', $word, null, PREG_SPLIT_NO_EMPTY);
  $response = '';
  foreach($indices as $i) {
    $response .= $letters[$i];
    $letters[$i] = '?';
  }
  $challenge = join($letters);
  return [$challenge, $response];
}

function get_comments($tid, $dataPOST = null) {
  global $db, $secrets;
  $lang = validate_tid_get_lang($tid);
  if(!$lang)
    return null;

  $ret = '';
  $sql = "select id, name, text, auth_public, auth_private, timestamp from comments where thread_ID=$tid order by id";
  $result = $db->query($sql);
  $count = 0;
  $editing = false;
  $skip_checks = @$dataPOST['admin_pass'] == $secrets['adminpw'];

  while($row = $result->fetch_assoc()) {
    $count++;
    $dataHTML = [
      'name' => htmlspecialchars($row['name']),
      'text' => nl2br(htmlspecialchars($row['text'])),
      'date' => date('j.n.Y G:i', strtotime($row['timestamp'])),
      'auth_private' => $row['auth_private'],
      'auth_public' => $row['auth_public'],
      'id' => $row['id'],
      'tid' => $tid
    ];

    if(@$dataPOST['edit_id'] == $row['id']
        && ($skip_checks || @$dataPOST['auth_private'] == $row['auth_private'])) {
      $editing = true;
      $ret .= format_comment_edit($dataHTML, $lang);
    } else
      $ret .= format_comment_item($dataHTML, $lang);
  }

  if(!$editing) {
    $attempt = isset($dataPOST['attempt']) ? $dataPOST['attempt'] : 0;
    $dataHTML = [
      'name' => htmlspecialchars(@$dataPOST['name']),
      'text' => nl2br(htmlspecialchars(@$dataPOST['text'])),
      'missing' => @$dataPOST['missing'],
      'attempt' => $attempt,
      'serial' => $count,
      'tid' => $tid
    ];
    $sql = "select challenge from captcha where lang='$lang' order by id";
    $result = $db->query($sql);
    list($challenge, $response) = gen_captcha($tid, $count, $attempt, $result);
    $dataHTML['captcha'] = $challenge;
    $ret .= format_comment_new($dataHTML, $lang);
  }

  return [
    'count' => $count,
    'html' => $ret
  ];
}

function get_comments_static($tid, $post, $open) {
  global $db;
  if($open) {
    $ret = get_comments($tid, $post); // contains validation
    $comments = $ret['html'];
    $count = $ret['count'];
  } else {
    if(!validate_tid($tid))
      return null;
    $sql = "select count(*) from comments where thread_ID=$tid";
    $result = $db->query($sql);
    $count = $result->fetch_row()[0];
    $comments = '';
  }

  $url = buildQuery($_SERVER['REQUEST_URI'], ['comments' => $open ? null : $tid]);
  ob_start();
  print <<<HTML
<a href="$url">
  <span class="bubble-count">$count</span><span class="bubble-count-plus"></span>
</a>
HTML;
  $bubble = ob_get_clean();

  return [
    'count' => $count,
    'comments' => $comments,
    'bubble' => $bubble
  ];
}

function format_comment_item($data, $lang) {
  if($data['name'])
    $namespan = '<span class="name' . ($data['name'] == 'VP' ? ' vp' : '') . '">'
        . $data['name'] . ':</span>';
  else
    $namespan = '';
  ob_start();
  print <<<HTML
<div class="item" data-id="$data[id]">
  <div class="header">
    $data[date]
    <span class="edittools hide" data-auth="$data[auth_public]">
      <a href="#" class="a-edit"><img src="images/edit.svg"/></a>
      <a href="#" class="a-delete"><img src="images/cross.svg"/></a>
    </span>
  </div>
  $namespan
  $data[text]
</div>\n
HTML;
  return ob_get_clean();
}

function format_comment_edit($data, $lang) {
  if($lang == 'en') {
    $editing = 'Editing comment';
    $by = 'by';
    $from = 'from';
    $submit = 'Submit';
  } else {
    $editing = 'Editujete příspěvek';
    $by = 'od';
    $from = 'z';
    $submit = 'Odeslat';
  }
  $header = $editing
    . ($data['name'] ? " $by <b>$data[name]</b>" : '')
    . " $from $data[date]";
  ob_start();
  print <<<HTML
<div class="item form">
  <form method="post">
    <a class="header" href="#" id="cancel"><img src="images/cross.svg"/></a>
    $header:
    <textarea name="text" id="text" autofocus>$data[text]</textarea>
    <input type="hidden" name="thread_ID" value="$data[tid]"/>
    <input type="hidden" name="ID" value="$data[id]"/>
    <input type="hidden" name="auth_private" value="$data[auth_private]"/>
    <input type="hidden" name="query" value="edit"/>
    <input type="submit" class="float" id="send" value="$submit"/>
    <p class="clearfix">&nbsp;</p>
  </form>
</div>\n
HTML;
  return ob_get_clean();
}

function format_comment_new($data, $lang) {
  if($lang == 'en') {
    $initials = 'Initials (optional)';
    $submit = 'Submit';
    $challengePre = 'Enter the three missing letters from “';
    $challengePost = '”';
  } else {
    $initials = 'Iniciály (nepovinné)';
    $submit = 'Odeslat';
    $challengePre = 'Napište tři chybějící písmena ze slova „';
    $challengePost = '“';
  }
  $mText = @in_array('text', $data['missing']) ? ' class="missing"' : '';
  $mCaptcha = @in_array('captcha', $data['missing']) ? ' class="missing"' : '';
  ob_start();
  print <<<HTML
<div class="item form">
  <form method="post">
    <textarea name="text"$mText id="text" autofocus>$data[text]</textarea>
    <p>$initials:
      <input name="name" type="text" maxlength="3" value="$data[name]"/>
    </p>
    <input type="hidden" name="thread_ID" value="$data[tid]"/>
    <input type="hidden" name="serial" value="$data[serial]"/>
    <input type="hidden" name="attempt" id="attempt" value="$data[attempt]"/>
    <input type="hidden" name="query" value="new"/>
    <input type="submit" class="float" id="send" value="$submit"/>
    <p class="clearfix">$challengePre<span id="challenge">$data[captcha]</span>$challengePost:
      <input name="captcha" type="text" id="captcha" maxlength="3"$mCaptcha/>
    </p>
  </form>
</div>\n
HTML;
  return ob_get_clean();
}

function comments_submit($post) {
  if($post['query'] == 'edit')
    return comments_submit_edit($post);
  if($post['query'] == 'delete')
    return comments_submit_delete($post);
  else
    return comments_submit_new($post);
}

function comments_submit_new($post) {
  global $secrets;
  if(!array_key_exists('thread_ID', $post) || !array_key_exists('serial', $post))
    return ['status' => STATUS_FAIL, 'error' => 'Invalid IDs'];
  $tid = $post['thread_ID'];
  $serial = $post['serial'];

  $missing = [];
  if(!array_key_exists('text', $post) || trim($post['text']) == '')
    $missing[] = 'text';
  if(!array_key_exists('captcha', $post) || trim($post['captcha']) == '')
    $missing[] = 'captcha';
  $text = trim($post['text']);
  $name = array_key_exists('name', $post) ? mb_strtoupper($post['name']) : '';
  $captcha = $post['captcha'];
  $attempt = array_key_exists('attempt', $post) ? $post['attempt'] : 0;
  $auth_public = array_key_exists('auth_public', $post) ? $post['auth_public'] : '';
  $auth_private = array_key_exists('auth_private', $post) ? $post['auth_private'] : '';

  /* This will be useful in case we need to refill user-entered data for corrections. */
  $ret = [
    'text' => $text,
    'name' => $name,
    'attempt' => $attempt
  ];

  $lang = validate_tid_get_lang($tid);
  if(!$lang) {
    $ret['status'] = STATUS_FAIL;
    $ret['error'] = 'Nonexistent thread_ID';
    return $ret;
  }

  if(!empty($missing)) {
    $ret['status'] = STATUS_INCOMPLETE;
    $ret['missing'] = $missing;
    return $ret;
  }

  $addr = $_SERVER['REMOTE_ADDR'];
  if(!preg_match('/^[\p{Latin}]+$/u', $name))
    $name = '';
  $name = mb_substr($name, 0, 3);
  $ret['name'] = $name;
  // A simple double-insert prevention. If the same request is received twice (from a time-outed AJAX followed by a form POST),
  // it will get the same CRC and will only be recorded once (without error). Should the user later decide to write the same
  // text, for some reason, it will get a higher serial and a collision will not happen.
  $hash = crc32($serial . $text);

  global $db;
  if($name != 'VP') {
    $sql = "select challenge from captcha where lang='$lang' order by id";
    $result = $db->query($sql);
    list($challenge, $response) = gen_captcha($tid, $serial, $attempt, $result);
    $accept_re = preg_replace('/[^a-z]/u', '.', $response);
  } else
    $accept_re = $secrets['vpcaptcha'];

  if(!preg_match("/^$accept_re$/u", mb_strtolower($captcha))) {
    $ret['status'] = STATUS_INCOMPLETE;
    $ret['missing'] = ['captcha'];
    $attempt = ($attempt + 1) % 3;
    $ret['attempt'] = $attempt;
    if($name != 'VP') {
      list($challenge, $response) = gen_captcha($tid, $serial, $attempt, $result);
      $ret['challenge'] = $challenge;
    }
    return $ret;
  }

  $sql = 'insert into comments (thread_ID, name, text, hash, address, auth_public, auth_private) values (?, ?, ?, ?, ?, ?, ?) on duplicate key update name=name';
  $st = $db->prepare($sql);
  $st->bind_param('ississs', $tid, $name, $text, $hash, $addr, $auth_public, $auth_private);
  $success = $st->execute();

  if($success) {
    $ret['status'] = STATUS_OK;
    $ret['text'] = '';
  } else {
    $ret['status'] = STATUS_FAIL;
    $ret['error'] = $db->error;
  }

  return $ret;
}

function comments_submit_edit($post) {
  global $db, $secrets;

  $id = $post['ID'];
  $tid = $post['thread_ID'];
  $auth = $post['auth_private'];
  $skip_checks = @$post['admin_pass'] == $secrets['adminpw'];

  $missing = [];
  if(!array_key_exists('text', $post) || trim($post['text']) == '')
    $missing[] = 'text';
  $text = trim($post['text']);

  $ret = [];

  if(!empty($missing)) {
    $ret['status'] = STATUS_INCOMPLETE;
    $ret['missing'] = $missing;
    return $ret;
  }

  if(!$skip_checks) {
    $sql = 'select not exists(select ID from comments where ID > ? and thread_ID = ?)';
    $st = $db->prepare($sql);
    $st->bind_param('ii', $id, $tid);
    $st->execute();
    $st->bind_result($newest);
    $st->fetch();
    $st->close();

    if(!$newest) {
      $ret['status'] = STATUS_FAIL;
      $ret['error'] = 'Cannot modify comment that already has reactions.';
      return $ret;
    }

    $sql = 'update comments set text = ?, timestamp = current_timestamp() where ID = ? and auth_private = ?';
    $st = $db->prepare($sql);
    $st->bind_param('sis', $text, $id, $auth);
    $success = $st->execute();
  } else {
    $sql = 'update comments set text = ?, timestamp = current_timestamp() where ID = ?';
    $st = $db->prepare($sql);
    $st->bind_param('si', $text, $id);
    $success = $st->execute();
  }

  if($success && $st->affected_rows != 0) {
    $ret['status'] = STATUS_OK;
    $ret['text'] = '';
  } else if($st->affected_rows == 0) {
    $ret['status'] = STATUS_FAIL;
    $ret['error'] = 'Record not found or authentication token mismatch';
  } else {
    $ret['status'] = STATUS_FAIL;
    $ret['error'] = $db->error;
  }

  return $ret;
}

function comments_submit_delete($post) {
  global $db, $secrets;

  $id = $post['ID'];
  $tid = $post['thread_ID'];
  $auth = $post['auth_private'];
  $skip_checks = @$post['admin_pass'] == $secrets['adminpw'];
  $ret = [];

  if(!$skip_checks) {
    $sql = 'select not exists(select ID from comments where ID > ? and thread_ID = ?)';
    $st = $db->prepare($sql);
    $st->bind_param('ii', $id, $tid);
    $st->execute();
    $st->bind_result($newest);
    $st->fetch();
    $st->close();

    if(!$newest) {
      $ret['status'] = STATUS_FAIL;
      $ret['error'] = 'Cannot delete comment that already has reactions.';
      return $ret;
    }

    $sql = 'delete from comments where ID = ? and auth_private = ?';
    $st = $db->prepare($sql);
    $st->bind_param('is', $id, $auth);
    $success = $st->execute();
  } else {
    $sql = 'delete from comments where ID = ?';
    $st = $db->prepare($sql);
    $st->bind_param('i', $id);
    $success = $st->execute();
  }

  if($success && $st->affected_rows != 0) {
    $ret['status'] = STATUS_OK;
    $ret['text'] = '';
  } else if($st->affected_rows == 0) {
    $ret['status'] = STATUS_FAIL;
    $ret['error'] = 'Record not found or authentication token mismatch';
  } else {
    $ret['status'] = STATUS_FAIL;
    $ret['error'] = $db->error;
  }

  return $ret;
}
?>
