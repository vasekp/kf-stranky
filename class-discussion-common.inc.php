<?php
$cid = 'kf19';

function validate_dldid($cid, $dldid) {
  global $db;
  $sql = 'select id from download where id=? and class_ID=?';
  $st = $db->prepare($sql);
  $st->bind_param('is', $dldid, $cid);
  $st->execute();
  $st->bind_result($dummy);
  return $st->fetch(); // bool
}

function get_discussion($dldid) {
  global $db;
  global $cid;
  if(!validate_dldid($cid, $dldid))
    return null;
  ob_start();
  $sql = "select name, text, timestamp from discussion where dld_ID='$dldid'";
  $result = $db->query($sql);
  $count = 0;
  echo '<div class="discussion" id="discussion' . $dldid . '">' . PHP_EOL;
  while($row = $result->fetch_assoc()) {
    $count++;
    $name = $row['name'];
    if($name)
      $namespan = '<span class="name' . ($name == 'VP' ? ' vp' : '') . '">' . $name . ':</span>';
    else
      $namespan = '';
    $date = date('j.n.Y G:i', strtotime($row['timestamp']));
    print <<<HTML
  <div class="item">
    <span class="date">$date</span>
    $namespan
    {$row['text']}
  </div>\n
HTML;
  }
  print <<<HTML
  <div class="item">
    <textarea></textarea>
    <button id="send">Odeslat</button>
    <p>Iniciály (nepovinné): <input id="name" type="text" maxlength="3" pattern="[a-zA-Z]{0,3}"/></p>
    <p>Opište první slovo ze strany 423: <input id="captcha" type="text"/></p>
  </div>
</div>\n
HTML;

  return array(
    'count' => $count,
    'html' => ob_get_clean()
  );
}
?>
