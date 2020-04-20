<?php
function process_upload_internal() {
  global $secrets, $db;
  if(@$_POST['admin_pass'] !== $secrets['adminpw'])
    return 'Wrong password.';

  $basename = basename($_FILES['file']['name']);
  if(!preg_match('/^[a-z0-9-]*\.pdf$/', $basename))
    return 'Wrong filename.';

  $filename = 'download/' . $basename;
  if(file_exists($filename))
    return 'File already exists.';

  $lang = @$_POST['lang'] == 'en' ? 'en' : 'cz';

  move_uploaded_file($_FILES['file']['tmp_name'], $filename);

  $sql = "insert into comment_threads (lang) values ('$lang')";
  $db->query($sql);
  $sql = 'select last_insert_id()';
  $result = $db->query($sql);
  $tid = $result->fetch_row()[0];

  $sql = "insert into download (class_ID, filename, description, thread_ID) values (?, ?, ?, ?)";
  $st = $db->prepare($sql);
  $st->bind_param("sssi", $_POST['class_ID'], $basename, $_POST['desc'], $tid);
  $st->execute();
  return '';
}

function process_upload() {
  $ret = process_upload_internal();
  if($ret !== '')
    print <<<HTML
<div class="error">
  $ret
</div>
HTML;
}
?>
