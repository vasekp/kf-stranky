<?php
$css[] = 'css/switch.css';
$css[] = $demodir . '/evan.css';
$scripts[] = 'demo-helpers.js';
$scripts[] = 'switch.js';
$scripts[] = $demodir . '/evan.js';
$files[] = $demodir . '/prepare.vert';
$files[] = $demodir . '/prep-above.frag';
$files[] = $demodir . '/prep-below.frag';
$files[] = $demodir . '/draw.vert';
$files[] = $demodir . '/draw.frag';

if($en) {
  $desc = 'Evanescent waves';
  $type = 'Initial state';
  $types = ['vacuum' => 'Vacuum', 'fock' => '1 photon', 'cat' => '"Cat" state'];
  $reset = 'Reset';
  $plotType = 'Plot';
  $plotTypes = ['prob' => 'Density', 'wave' => 'Wave function'];
  $try = 'Tips for trying:';
  $tips = [
  ];
} else {
  $desc = 'Evanescentní vlny';
  $type = 'Výchozí stav';
  $types = ['vacuum' => 'Vakuum', 'fock' => '1 foton', 'cat' => '"Cat" stav'];
  $reset = 'Reset';
  $plotType = 'Vykreslit';
  $plotTypes = ['prob' => 'Hustota', 'wave' => 'Vlnová funkce'];
  $try = 'Zkuste si:';
  $tips = [
  ];
}

$list = [];
foreach($tips as $tip)
  $list[] = '<li>' . $tip . '</li>';
$tips = join(PHP_EOL, $list);

$list = [];
$count = 0;
foreach($types as $id => $name)
  $list[] = '<a href="#" id="' . $id . '" data-func="' . $count++ . '">' . $name . '</a>';
$types = join(PHP_EOL, $list);

$list = [];
$count = 0;
foreach($plotTypes as $id => $name)
  $list[] = '<a href="#" id="' . $id . '">' . $name . '</a>';
$plotTypes = join(PHP_EOL, $list);

print <<<HTML
<h1>$demotitle</h1>
<p>$desc</p>
<div id="container">
  <canvas id="canvas"></canvas>
</div>
<h2>$try</h2>
<ul>
  $tips
</ul>
HTML;
?>
