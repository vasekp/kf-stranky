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
  $sql = "select name, text, timestamp from discussion where dld_ID='$dldid' order by timestamp";
  $result = $db->query($sql);
  $count = 0;
  echo '<div class="discussion" id="discussion' . $dldid . '">' . PHP_EOL;
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
  <div class="item">
    <span class="date">$date</span>
    $namespan
    $text
  </div>\n
HTML;
  }
  $url = query('', array('discuss' => $dldid));

  if($data !== null && $data['dldid'] == $dldid) {
    $text = htmlspecialchars($data['text']);
    $name = htmlspecialchars($data['name']);
    $mText = $data['status'] == STATUS_INCOMPLETE && in_array('text', $data['missing']) ? ' class="missing"' : '';
    $mCaptcha = $data['status'] == STATUS_INCOMPLETE && in_array('captcha', $data['missing']) ? ' class="missing"' : '';
  } else
    $text = $name = $mText = $mCaptcha = '';

  print <<<HTML
  <div class="item">
    <form action="$url" method="post">
      <textarea name="text"$mText id="text">$text</textarea>
      <p>Iniciály (nepovinné): <input name="name" type="text" maxlength="3" value="$name"/></p>
      <p>Opište první slovo ze strany 423: <input name="captcha" id="captcha" type="text"$mCaptcha/></p>
      <input type="hidden" name="class_ID" value="$cid"/>
      <input type="hidden" name="dld_ID" value="$dldid"/>
      <input type="submit" id="send" value="Odeslat">
    </form>
  </div>
</div>\n
HTML;

  return array(
    'count' => $count,
    'html' => ob_get_clean()
  );
}

function discussion_submit($post) {
  global $secrets;
  if(!array_key_exists('dld_ID', $post) || !array_key_exists('class_ID', $post))
    return array('status' => STATUS_FAIL, 'error' => 'Invalid IDs');
  $cid = $post['class_ID'];
  $dldid = $post['dld_ID'];

  $missing = array();
  if(!array_key_exists('text', $post) || trim($post['text']) == '')
    $missing[] = 'text';
  if(!array_key_exists('captcha', $post) || trim($post['captcha']) == '')
    $missing[] = 'captcha';
  $text = trim($post['text']);
  $name = array_key_exists('name', $post) ? strtoupper($post['name']) : '';
  $captcha = $post['captcha'];
  $addr = $_SERVER['REMOTE_ADDR'];
  /*if(!(ctype_alpha($name) && strlen($name) <= 3))
    $name = '';*/
  if($name == 'VP' && $captcha != $secrets['vpcaptcha'])
    $name = '';

  /* This will be useful in case we need to refill user-entered data for corrections. */
  $ret = array(
    'dldid' => $dldid,
    'text' => $text,
    'name' => $name,
  );

  if(!validate_dldid($cid, $dldid)) {
    $ret['status'] = STATUS_FAIL;
    return $ret;
  }

  if(!empty($missing)) {
    $ret['status'] = STATUS_INCOMPLETE;
    $ret['missing'] = $missing;
    return $ret;
  }

  global $db;
  $sql = 'insert into discussion (dld_ID, name, text, address) values (?, ?, ?, ?)';
  $st = $db->prepare($sql);
  $st->bind_param('isss', $dldid, $name, $text, $addr);
  $success = $st->execute();
  $success = true;

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
