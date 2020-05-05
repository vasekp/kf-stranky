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
$files[] = $demodir . '/line.vert';

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
  <div class="container">
    <canvas id="vector"></canvas>
    <svg id="coords"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        version="1.1" viewBox="-1.5 -1.5 3 3">
      <defs>
        <marker class="filled" id="coord-arrow" viewbox="-1 -1 2 2" markerUnits="userSpaceOnUse"
            markerWidth=".1" markerHeight=".1" orient="auto">
          <path id="apath" d="M -1 -1 L 1 0 L -1 1 z"/>
        </marker>
      </defs>
      <path class="coord-line" d="M -1.3 0 H 1.3" marker-end="url(#coord-arrow)"/>
      <path class="coord-line" d="M 0 1.3 V -1.3" marker-end="url(#coord-arrow)"/>
      <text class="filled text" x="1.3" y="-.1">E<tspan class="sub" dy=".2em">x</tspan></text>
      <text class="filled text" x=".1" y="-1.3">E<tspan class="sub" dy=".2em">y</tspan></text>
    </svg>
  </div>
</div>
<h2>$try</h2>
<ul>
  $tips
</ul>
HTML;
?>
