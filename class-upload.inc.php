<?php
function try_upload_file($unique = true) {
  $basename = basename($_FILES['file']['name']);
  if(!preg_match('/^[a-z0-9_+-]*\.pdf$/', $basename))
    throw new Exception('Invalid filename.');

  $filename = 'download/' . $basename;

  if($unique && file_exists($filename))
    throw new Exception('File already exists.');

  move_uploaded_file($_FILES['file']['tmp_name'], $filename);
  return $basename;
}

function process_upload() {
  global $secrets, $db;
  $has_file = !empty($_FILES['file']['name']);
  try {
    if(@$_POST['admin_pass'] !== $secrets['adminpw'])
      throw new Exception('Wrong password.');

    $q = @$_POST['query'];
    if($q == 'edit') {
      if(!isset($_POST['dld_ID']) || !isset($_POST['desc']))
        throw new Exception('Missing fields.');
      if($has_file) {
        $basename = try_upload_file(false);
        $st = $db->prepare('update download set filename=?, description=? where ID=?');
        $st->bind_param('ssi', $basename, $_POST['desc'], $_POST['dld_ID']);
      } else {
        $st = $db->prepare('update download set description=? where ID=?');
        $st->bind_param('si', $_POST['desc'], $_POST['dld_ID']);
      }
    } else if($q == 'delete') {
      if(!isset($_POST['dld_ID']))
        throw new Exception('Missing fields.');
      $st = $db->prepare('delete from download where ID=?');
      $st->bind_param('i', $_POST['dld_ID']);
    } else if($q == 'upload') {
      if(!isset($_POST['class_ID']) || !isset($_POST['desc']))
        throw new Exception('Missing fields.');
      if(!$has_file)
        throw new Exception('No file selected.');
      $basename = try_upload_file();

      $lang = @$_POST['lang'] == 'en' ? 'en' : 'cz';
      $sql = "insert into comment_threads (lang) values ('$lang')";
      $db->query($sql);
      $sql = 'select last_insert_id()';
      $result = $db->query($sql);
      $tid = $result->fetch_row()[0];

      $sql = 'insert into download (class_ID, filename, description, thread_ID) values (?, ?, ?, ?)';
      $st = $db->prepare($sql);
      $st->bind_param('sssi', $_POST['class_ID'], $basename, $_POST['desc'], $tid);
    } else
      throw new Exception('Unknown request.');
    $st->execute();
  } catch(Exception $e) {
    $err = $e->getMessage();
    print <<<HTML
<div class="error">
  $err
</div>
HTML;
  }
}
?>
