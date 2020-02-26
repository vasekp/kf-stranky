<?php
include 'shared.inc.php';

$curr = basename($_SERVER['SCRIPT_FILENAME'], '.php');
if($curr == 'error') {
  $en = array_key_exists('REDIRECT_QUERY_STRING', $_SERVER) && (strpos($_SERVER['REDIRECT_QUERY_STRING'], 'l=en') !== false);
  $addr_prefix = dirname($_SERVER['PHP_SELF']) . '/';
} else {
  $en = array_key_exists('l', $_GET) && $_GET['l'] == 'en';
  $addr_prefix = '';
}

$admin = (array_key_exists('admin', $_GET) && $_GET['admin'] == $secrets['adminpw']);

if($en) {
  $prilang = 'en';
  $seclang = 'cz';
} else {
  $prilang = 'cz';
  $seclang = 'en';
}

$stranky = array(
  'landing' => $en ? 'Intro' : 'Úvod',
  'classes' => $en ? 'Classes' : 'Výuka',
  'theses' => $en ? 'Theses' : 'Školení',
  'pub' => $en ? 'Publications' : 'Publikace',
  'personal' => $en ? 'Personal' : 'Osobní'
);

if(!array_key_exists($curr, $stranky) && $curr != 'error')
  $curr = key($stranky);
$title = $stranky[$curr];
$filename = $curr . ($en ? '-en' : '') . '.inc.php';

$scripts = array();
$css = array();
if(file_exists($filename)) {
  $early = 1;
  include $filename;
  $early = 0;
}
/**********/
?>
<!DOCTYPE html>
<html lang='cs'>
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width"/>
    <link rel="stylesheet" type="text/css" href="<?php print $addr_prefix; ?>css/main.css"/>
<?php
foreach($css as $url)
  print_indent(2, '<link rel="stylesheet" type="text/css" href="' . $url . '"/>');
foreach($scripts as $url)
  print_indent(2, '<script type="text/javascript" src="' . $url . '"></script>');
?>
    <title>
      Václav Potoček<?php if($title) echo ' - ' . $title; echo "\n"; ?>
    </title>
  </head>
  <body>
    <nav>
<?php
foreach($stranky as $name => $text) {
  print_indent(3, '<span class="hide">[</span>');
  print_indent(3, '<a href="' . $addr_prefix . query($name . '.php') . '"'
    . ($name==$curr ? ' class="emph">' : '>') . $text . '</a>');
  print_indent(3, '<span class="hide">]</span>');
}
?>
    </nav>
    <div id="main">
      <main>
<?php
if(!file_exists($filename)) {
  print_indent(4, '<div class="error">');
  print_indent(5, $en ? 'This page does not exist.' : 'Tato stránka neexistuje.');
  print_indent(5, '<br/>');
  $text = $en ? 'Please report this error on ' : 'Prosím nahlašte chybu na ';
  $text .= '<a href="https://github.com/vasekp/kf-stranky/issues" target="_blank">';
  $text .= $en ? 'GitHub' : 'GitHubu';
  $text .= '</a>.';
  print_indent(5, $text);
  print_indent(4, '</div>');
} else {
  $db = open_db();
  if(!$db) {
    print_indent(4, '<div class="error">Nepodařilo se připojit k databázi. Stránky mimo provoz.</div>');
  } else {
    include $filename;
    $db->close();
  }
}
?>
      </main>
      <footer>
        <div id="lastmod">
<?php
if(file_exists($filename)) {
  $text = $en ? 'Last modified: ' : 'Poslední úprava: ';
  $text .= '<span id="modtime">';
  $text .= date('j.n.Y G:i', isset($modtime) ? $modtime : filemtime($filename));
  $text .= '</span>';
  print_indent(5, $text);
}
?>
        </div>
        <div id="lang">
          <p class="hide"></p>
<?php
$g = $_GET;
$g['l'] = $seclang;
print_indent(5, '<a href="' . query('', $g) . '">');
?>
            <span class="hide">Switch language:</span>
            <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="30" height="20">
              <image href="<?php print $addr_prefix; ?>images/<?php echo $prilang; ?>.svg" x="0" y="0" width="100%" height="100%" class="primary"/>
              <image href="<?php print $addr_prefix; ?>images/<?php echo $seclang; ?>.svg" x="0" y="0" width="100%" height="100%" class="secondary"/>
            </svg>
          </a>
        </div>
      </footer>
    </div>
  </body>
</html>
