<?php
include 'shared.inc.php';

$url = parse_url($_SERVER['REQUEST_URI']);
$is_error = array_key_exists('REDIRECT_STATUS', $_SERVER) ? $_SERVER['REDIRECT_STATUS'] != 200 : false;
$addr_prefix = $is_error ? dirname($_SERVER['PHP_SELF']) . '/' : '';
$curr = $is_error ? 'error' : basename($url['path'], '.php');

if(array_key_exists('query', $url)) {
  parse_str($url['query'], $search);
  $en = array_key_exists('l', $search) ? $search['l'] == 'en' : false;
} else
  $en = false;
$prilang = $en ? 'en' : 'cz';
$seclang = $en ? 'cz' : 'en';
$seclang_url = query('', $_GET, ['l' => $seclang]);

$stranky = [
  'landing' => $en ? 'Intro' : 'Úvod',
  'classes' => $en ? 'Classes' : 'Výuka',
  'demos' => $en ? 'Demonstrations' : 'Ukázky',
  'theses' => $en ? 'Theses' : 'Školení',
  'pub' => $en ? 'Publications' : 'Publikace',
  'personal' => $en ? 'Personal' : 'Osobní'
];

if(!array_key_exists($curr, $stranky) && !$is_error)
  $curr = key($stranky);
$title_append = !$is_error ? ' - ' . $stranky[$curr] : '';
$filename = $curr . '.inc.php';

$admin = (array_key_exists('admin', $_GET) && $_GET['admin'] == $secrets['adminpw']);
$admin_row = $admin ? '<input type="hidden" id="admin" value="' . $_GET['admin'] . '"/>' : '';

$nav_links = [];
foreach($stranky as $name => $text) {
  $url = query($name . '.php');
  $emph = $name==$curr ? ' class="emph"' : '';
  $nav_links[] = <<<HTML
<span class="hide">[</span>
<a href="$addr_prefix$url"$emph>$text</a>
<span class="hide">]</span>
HTML;
}
$nav_links = join(PHP_EOL, $nav_links);

$css = [];
$files = [];
$scripts = [];

ob_start();
if(file_exists($filename)) {
  if($db = open_db()) {
    include $filename;
    $db->close();
  } else
    include 'db-error.inc.php';
} else
  include 'hard-error.inc.php';
$content = ob_get_clean();

$links = [];
foreach($css as $url)
  $links[] = '<link rel="stylesheet" type="text/css" href="' . $url . '"/>';
foreach($files as $url)
  $links[] ='<link rel="preload" as="fetch" href="' . $url . '" crossorigin/>';
foreach($scripts as $url)
  $links[] = '<script type="text/javascript" src="' . $url . '"></script>';
$links = join(PHP_EOL, $links);

$last_modified = $en ? 'Last modified' : 'Poslední úprava';
if(!isset($modtime))
  $modtime = filemtime(file_exists($filename) ? $filename : __FILE__);
$modtime_formatted = date('j.n.Y G:i', $modtime);

ob_start('indent');

print <<<HTML
<!DOCTYPE html>
<html lang='cs'>
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width"/>
    <link rel="stylesheet" type="text/css" href="${addr_prefix}css/main.css"/>\n
    $links
    <link rel="icon" type="image/png" href="images/fjfi.png"/>
    <title>
      Václav Potoček$title_append
    </title>
  </head>
  <body>
    <nav>
      $nav_links
    </nav>
    <div id="main">
      <main>
        $content
      </main>
      <footer>
        <div id="lastmod">
          $last_modified:
          <span id="modtime">$modtime_formatted</span>
        </div>
        <div id="lang">
          <p class="hide"></p>
          <a href="$seclang_url">
            <span class="hide">Switch language:</span>
            <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="30" height="20">
              <image href="${addr_prefix}images/$prilang.svg" x="0" y="0" width="100%" height="100%" class="primary"/>
              <image href="${addr_prefix}images/$seclang.svg" x="0" y="0" width="100%" height="100%" class="secondary"/>
            </svg>
          </a>
        </div>
      </footer>
    </div>
  </body>
</html>
HTML;
?>
