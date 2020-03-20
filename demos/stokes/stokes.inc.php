<?php
$css[] = $demodir . '/stokes.css';
$scripts[] = 'demo-helpers.js';
$scripts[] = $demodir . '/stokes.js';
$files[] = $demodir . '/background.vert';
$files[] = $demodir . '/background.frag';
$files[] = $demodir . '/sphere.vert';
$files[] = $demodir . '/sphere.frag';
$files[] = $demodir . '/solid.vert';
$files[] = $demodir . '/solid.frag';
$files[] = $demodir . '/flat.vert';
$files[] = $demodir . '/flat.frag';

if($en) {
  $desc = 'Description in English';
  $try = 'Tips for trying:';
  $tips = [
    'tips'
  ];
} else {
  $desc = 'Popis';
  $try = 'Zkuste si:';
  $tips = [
    'Jakým částem Poincarého sféry odpovídají lineární polarizace? Kruhové? Eliptické?',
    'Jaký vliv na oscilace x- a y-složky elektrické intenzity mají sférické úhly ϑ, ϕ?',
    'Jaké parametry trajektorie elektrické intenzity se zachovávají při rotacích Stokesových parametrů kolem x, y, z?'
  ];
}

$list = [];
foreach($tips as $tip)
  $list[] = '<li>' . $tip . '</li>';
$tips = join(PHP_EOL, $list);

print <<<HTML
<h1>$demotitle</h1>
$desc
<div class="row">
  <div class="container"><canvas id="sphere"></canvas></div>
  <div class="container"><canvas id="vector"></canvas></div>
</div>
<h2>$try</h2>
<ul>
  $tips
</ul>
HTML;
?>
