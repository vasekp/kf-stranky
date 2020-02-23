<?php
include 'shared.inc.php';

$curr = basename($_SERVER['SCRIPT_FILENAME'], '.php');
if($curr == 'error') {
  $en = (strpos($_SERVER['REDIRECT_QUERY_STRING'], 'l=en') !== false);
  $addr_prefix = dirname($_SERVER['PHP_SELF']) . '/';
} else {
  $en = array_key_exists('l', $_GET) && $_GET['l'] == 'en';
  $addr_prefix = '';
}

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
$filename = $curr . ($en ? '-en' : '') . '.inc.php';
/**********/
?>
<!DOCTYPE html>
<html lang='cs'>
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width"/>
    <link rel="stylesheet" type="text/css" href="<?php print $addr_prefix; ?>css/style.css"/>
<?php
if(file_exists('css/' . $curr . '.css'))
  print_indent(2, '<link rel="stylesheet" type="text/css" href="' . $addr_prefix . 'css/' . $curr . '.css"/>');
if(file_exists($curr . '.js'))
  print_indent(2, '<script type="text/javascript" src="' . $addr_prefix . $curr . '.js"></script>');
?>
    <title>
      Václav Potoček
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
