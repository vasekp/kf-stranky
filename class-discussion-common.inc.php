<?php
$cid = 'kf19';

const STATUS_OK = 'ok';
const STATUS_INCOMPLETE = 'incomplete';
const STATUS_ALERT = 'alert';
const STATUS_FAIL = 'fail';

function validate_dldid($cid, $dldid) {
  global $db;
  $sql = 'select id from download where id=? and class_ID=?';
  $st = $db->prepare($sql);
  $st->bind_param('is', $dldid, $cid);
  $st->execute();
  $st->bind_result($dummy);
  return $st->fetch(); // bool
}

function get_discussion($dldid, $data = null) {
  global $db;
  global $cid;
  global $secrets;
  if(!validate_dldid($cid, $dldid))
    return null;
  ob_start();
  $sql = "select id, name, text, auth_public, auth_private, timestamp from discussion where dld_ID='$dldid' order by id";
  $result = $db->query($sql);
  $count = 0;
  $editing = false;
  $form_url = query('', ['discuss' => $dldid]);
  $skip_checks = @$data['admin_pass'] == $secrets['adminpw'];

  print <<<HTML
<div class="discussion" id="discussion$dldid" data-dldid="$dldid">\n
HTML;

  while($row = $result->fetch_assoc()) {
    $count++;
    $name = htmlspecialchars($row['name']);
    $text = nl2br(htmlspecialchars($row['text']));
    if($name)
      $namespan = '<span class="name' . ($name == 'VP' ? ' vp' : '') . '">' . $name . ':</span>';
    else
      $namespan = '';
    $date = date('j.n.Y G:i', strtotime($row['timestamp']));

    if(@$data['id'] == $row['id']
        && ($skip_checks || @$data['auth_private'] == $row['auth_private'])) {
      $editing = true;
      print <<<HTML
  <div class="item form">
    <form action="$form_url" method="post">
      <textarea name="text" id="text">$text</textarea>
      <input type="hidden" name="class_ID" value="$cid"/>
      <input type="hidden" name="dld_ID" value="$dldid"/>
      <input type="hidden" name="ID" value="$data[id]"/>
      <input type="hidden" name="auth_private" value="$data[auth_private]"/>
      <input type="hidden" name="query" value="edit"/>
      <p>&nbsp;</p>
      <input type="submit" id="send" value="Odeslat"/>
    </form>
  </div>\n
HTML;
    } else {
      print <<<HTML
  <div class="item" data-id="$row[id]">
    <div class="header">
      $date
      <span class="edittools hide" data-auth="$row[auth_public]">
        <a href="#" class="a-edit"><img src="images/edit.svg"/></a>
        <a href="#" class="a-delete"><img src="images/delete.svg"/></a>
      </span>
    </div>
    $namespan
    $text
  </div>\n
HTML;
    }
  }

  if(!$editing) {
    $attempt = 0;
    if($data !== null && @$data['dldid'] == $dldid) {
      $name = htmlspecialchars($data['name']);
      $text = nl2br(htmlspecialchars($data['text']));
      $mText = $data['status'] == STATUS_INCOMPLETE && in_array('text', $data['missing']) ? ' class="missing"' : '';
      $mCaptcha = $data['status'] == STATUS_INCOMPLETE && in_array('captcha', $data['missing']) ? ' class="missing"' : '';
      $attempt = $data['attempt'];
    } else
      $text = $name = $mText = $mCaptcha = '';

    $sql = "select challenge from captcha where class_ID='$cid' order by id";
    $result = $db->query($sql);
    $result->data_seek(gen_captcha($dldid, $count, $attempt, $result->num_rows));
    $challenge = $result->fetch_row()[0];

    print <<<HTML
  <div class="item form">
    <form action="$form_url" method="post">
      <textarea name="text"$mText id="text">$text</textarea>
      <p>Iniciály (nepovinné): <input name="name" type="text" maxlength="3" value="$name"/></p>
      <p>Opište první slovo ze strany <span id="challenge">$challenge</span>: <input name="captcha" id="captcha" type="text"$mCaptcha/></p>
      <input type="hidden" name="class_ID" value="$cid"/>
      <input type="hidden" name="dld_ID" value="$dldid"/>
      <input type="hidden" name="serial" value="$count"/>
      <input type="hidden" name="attempt" id="attempt" value="$attempt"/>
      <input type="hidden" name="query" value="new"/>
      <input type="submit" id="send" value="Odeslat"/>
    </form>
  </div>\n
HTML;
  }

  print "</div>\n";

  return [
    'count' => $count,
    'html' => ob_get_clean()
  ];
}

function discussion_submit($post) {
  if($post['query'] == 'edit')
    return discussion_submit_edit($post);
  if($post['query'] == 'delete')
    return discussion_submit_delete($post);
  else
    return discussion_submit_new($post);
}

function discussion_submit_new($post) {
  global $secrets;
  if(!array_key_exists('dld_ID', $post) || !array_key_exists('class_ID', $post) || !array_key_exists('serial', $post))
    return ['status' => STATUS_FAIL, 'error' => 'Invalid IDs'];
  $cid = $post['class_ID'];
  $dldid = $post['dld_ID'];
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

  if(!validate_dldid($cid, $dldid)) {
    $ret['status'] = STATUS_FAIL;
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
    $sql = "select challenge, response from captcha where class_ID='$cid' order by id";
    $result = $db->query($sql);
    $result->data_seek(gen_captcha($dldid, $serial, $attempt, $result->num_rows));
    $accept_re = preg_replace('/[^a-z]/u', '.', mb_strtolower($result->fetch_row()[1]));
  } else
    $accept_re = $secrets['vpcaptcha'];

  if(!preg_match("/^$accept_re$/u", mb_strtolower($captcha))) {
    $ret['status'] = STATUS_INCOMPLETE;
    $ret['missing'] = ['captcha'];
    $attempt = ($attempt + 1) % 3;
    $ret['attempt'] = $attempt;
    if($name != 'VP') {
      $result->data_seek(gen_captcha($dldid, $serial, $attempt, $result->num_rows));
      $ret['challenge'] = $result->fetch_row()[0];
    }
    return $ret;
  }

  $sql = 'insert into discussion (dld_ID, name, text, hash, address, auth_public, auth_private) values (?, ?, ?, ?, ?, ?, ?) on duplicate key update name=name';
  $st = $db->prepare($sql);
  $st->bind_param('ississs', $dldid, $name, $text, $hash, $addr, $auth_public, $auth_private);
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

function discussion_submit_edit($post) {
  global $db, $secrets;

  $id = $post['ID'];
  $dldid = $post['dld_ID'];
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
    $sql = 'select not exists(select ID from discussion where ID > ? and dld_ID = ?)';
    $st = $db->prepare($sql);
    $st->bind_param('ii', $id, $dldid);
    $st->execute();
    $st->bind_result($newest);
    $st->fetch();
    $st->close();

    if(!$newest) {
      $ret['status'] = STATUS_FAIL;
      $ret['error'] = 'Cannot modify comment that already has reactions.';
      return $ret;
    }

    $sql = 'update discussion set text = ?, timestamp = current_timestamp() where ID = ? and auth_private = ?';
    $st = $db->prepare($sql);
    $st->bind_param('sis', $text, $id, $auth);
    $success = $st->execute();
  } else {
    $sql = 'update discussion set text = ?, timestamp = current_timestamp() where ID = ?';
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

function discussion_submit_delete($post) {
  global $db, $secrets;

  $id = $post['ID'];
  $dldid = $post['dld_ID'];
  $auth = $post['auth_private'];
  $skip_checks = @$post['admin_pass'] == $secrets['adminpw'];
  $ret = [];

  if(!$skip_checks) {
    $sql = 'select not exists(select ID from discussion where ID > ? and dld_ID = ?)';
    $st = $db->prepare($sql);
    $st->bind_param('ii', $id, $dldid);
    $st->execute();
    $st->bind_result($newest);
    $st->fetch();
    $st->close();

    if(!$newest) {
      $ret['status'] = STATUS_FAIL;
      $ret['error'] = 'Cannot delete comment that already has reactions.';
      return $ret;
    }

    $sql = 'delete from discussion where ID = ? and auth_private = ?';
    $st = $db->prepare($sql);
    $st->bind_param('is', $id, $auth);
    $success = $st->execute();
  } else {
    $sql = 'delete from discussion where ID = ?';
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
