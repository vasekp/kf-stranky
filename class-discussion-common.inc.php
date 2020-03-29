<?php
$cid = 'kf19';

const STATUS_OK = 0;
const STATUS_INCOMPLETE = 1;
const STATUS_FAIL = 2;

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
  if(!validate_dldid($cid, $dldid))
    return null;
  ob_start();
  $sql = "select id, name, text, timestamp from discussion where dld_ID='$dldid' order by timestamp";
  $result = $db->query($sql);
  $count = 0;

  print <<<HTML
<div class="discussion" id="discussion$dldid">\n
HTML;

  while($row = $result->fetch_assoc()) {
    $count++;
    $name = htmlspecialchars($row['name']);
    $text = htmlspecialchars($row['text']);
    if($name)
      $namespan = '<span class="name' . ($name == 'VP' ? ' vp' : '') . '">' . $name . ':</span>';
    else
      $namespan = '';
    $date = date('j.n.Y G:i', strtotime($row['timestamp']));

    print <<<HTML
  <div class="item" data-id="$row[id]">
    <div class="header">
      $date
      <span class="edittools hide">
        <img src="images/edit.svg"/>
        <img src="images/delete.svg"/>
      </span>
    </div>
    $namespan
    $text
  </div>\n
HTML;
  }

  $url = query('', ['discuss' => $dldid]);
  $attempt = 0;
  if($data !== null && $data['dldid'] == $dldid) {
    $text = htmlspecialchars($data['text']);
    $name = htmlspecialchars($data['name']);
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
    <form action="$url" method="post">
      <textarea name="text"$mText id="text">$text</textarea>
      <p>Iniciály (nepovinné): <input name="name" type="text" maxlength="3" value="$name"/></p>
      <p>Opište první slovo ze strany <span id="challenge">$challenge</span>: <input name="captcha" id="captcha" type="text"$mCaptcha/></p>
      <input type="hidden" name="class_ID" value="$cid"/>
      <input type="hidden" name="dld_ID" value="$dldid"/>
      <input type="hidden" name="serial" value="$count"/>
      <input type="hidden" name="attempt" id="attempt" value="$attempt"/>
      <input type="submit" id="send" value="Odeslat"/>
    </form>
  </div>
</div>\n
HTML;

  return [
    'count' => $count,
    'html' => ob_get_clean()
  ];
}

function discussion_submit($post) {
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

  /* This will be useful in case we need to refill user-entered data for corrections. */
  $ret = [
    'dldid' => $dldid,
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

  $sql = 'insert into discussion (dld_ID, name, text, hash, address) values (?, ?, ?, ?, ?) on duplicate key update name=name';
  $st = $db->prepare($sql);
  $st->bind_param('issis', $dldid, $name, $text, $hash, $addr);
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
?>
