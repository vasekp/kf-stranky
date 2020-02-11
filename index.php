<?php
function print_indent($offset, $text) {
  echo str_repeat("  ", $offset);
  echo $text;
  echo "\n";
}

function open_db() {
  include "secret.inc.php";
  $conn = new mysqli($servername, $username, $password, $dbname);

  if($conn->connect_error)
    return null;
  $conn->set_charset("utf8");
  return $conn;
}

$curr = basename($_SERVER["SCRIPT_FILENAME"], ".php");
if($curr == "error")
  $en = (strpos($_SERVER["REDIRECT_QUERY_STRING"], "l=en") !== false);
else
  $en = array_key_exists("l", $_GET) && $_GET["l"] == "en";

if($en) {
  $prilang = "en";
  $seclang = "cz";
  $langquery = "?l=en";
} else {
  $prilang = "cz";
  $seclang = "en";
  $langquery = "";
}

$stranky = array(
  "landing" => $en ? "Intro" : "Úvod",
  "classes" => $en ? "Classes" : "Výuka",
  "theses" => $en ? "Theses" : "Školení",
  "pub" => $en ? "Publications" : "Publikace",
  "personal" => $en ? "Personal" : "Osobní"
);

if(!array_key_exists($curr, $stranky) && $curr != "error")
  $curr = key($stranky);
$filename = $curr . ($en ? "-en" : "") . ".inc.php";
/**********/
?>
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width"/>
    <link rel="stylesheet" type="text/css" href="style.css"/>
<?php
if(file_exists($curr . ".js"))
  print_indent(2, "<script type=\"text/javascript\" src=\"$curr.js\"></script>");
?>
    <title>
      Václav Potoček
    </title>
  </head>
  <body>
    <div class="body">
      <div class="navbar">
<?php
foreach($stranky as $name => $text) {
  print_indent(4, "<span class=\"hide\">[</span>");
  print_indent(4, "<a href=\"$name.php$langquery\"" . ($name==$curr ? " class=\"emph\"" : "") . ">$text</a>");
  print_indent(4, "<span class=\"hide\">]</span>");
}
?>
      </div>
      <div class="main">
<?php
if(!file_exists($filename)) {
  print_indent(4, "<div class=\"error\">");
  print_indent(5, $en ? "This page does not exist." : "Tato stránka neexistuje.");
  print_indent(5, "<br/>");
  $report = $en ? "Please report this error on " : "Prosím nahlašte chybu na ";
  $report .= "<a href=\"https://github.com/vasekp/kf-stranky/issues\" target=\"_blank\">";
  $report .= $en ? "GitHub" : "GitHubu";
  $report .= "</a>.";
  print_indent(5, $report);
  print_indent(4, "</div>");
} else {
  $db = open_db();
  if(!$db) {
    print_indent(4, "<div class=\"error\">Nepodařilo se připojit k databázi. Stránky mimo provoz.</div>");
  } else {
    include $filename;
    $db->close();
  }
}
?>
        <div class="lastmod">
<?php
if(file_exists($filename)) {
  $lastmod = $en ? "Last modified" : "Poslední úprava";
  $lastmod .= ": " . date("j.n.Y G:i", filemtime($filename));
  print_indent(5, $lastmod);
}
?>
        </div>
        <div class="lang">
          <p class="hide"></p>
          <span class="hide">Switch language:</span>
          <a href="?l=<?php echo $seclang; ?>">
            <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="30" height="20">
              <image href="<?php echo $prilang; ?>.svg" x="0" y="0" width="100%" height="100%" class="primary"/>
              <image href="<?php echo $seclang; ?>.svg" x="0" y="0" width="100%" height="100%" class="secondary"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  </body>
</html>
