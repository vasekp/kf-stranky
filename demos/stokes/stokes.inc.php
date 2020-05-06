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
  $desc = 'Stokes parameters describe the polarization state of an electromagnetic wave (in this demonstration only fully polarized waves are considered). They make a three-dimensional vector on the Poincaré sphere, which shows the topological relations between various trajectories of the electric field vector E. We can also characterize polarization by the amplitudes of oscillations of the E<sub>x</sub> a E<sub>y</sub> components and their phase difference, or via the geometry of the polarization ellipse.';
  $try = 'Tips for trying:';
  $tips = [
    'What parts of the Poincaré sphere correspond to linear, circular, elliptic polarizations?',
    'How are the E<sub>x</sub> a E<sub>y</sub> oscillations affected by the spherical angles ϑ, ϕ?',
    'Which parameters of the ellipse are conserved in rotations of the vector around x, y, z axes? (You can try that by tapping and holding the axis tips.)'
  ];
} else {
  $desc = 'Stokesovy parametry popisují polarizační stav světelné vlny (zde v ukázce uvažujeme pouze zcela polarizované vlny). Tvoří trojrozměrný vektor ležící na tzv. Poincarého sféře. Ta ukazuje topologické vztahy mezi možnými trajektoriemi opisovanými vektorem elektrické intenzity E. Polarizaci také můžeme charakterizovat pomocí amplitud oscilací složek E<sub>x</sub> a E<sub>y</sub> a jejich fázového rozdílu či pomocí geometrických vlastností polarizační elipsy.';
  $try = 'Zkuste si:';
  $tips = [
    'Jakým částem Poincarého sféry odpovídají lineární polarizace? Kruhové? Eliptické?',
    'Jaký vliv na oscilace x- a y-složky elektrické intenzity mají sférické úhly ϑ, ϕ?',
    'Jaké parametry trajektorie elektrické intenzity se zachovávají při rotacích Stokesových parametrů kolem x, y, z? (Stokesův vektor bude rotovat, stisknete-li a přidržíte špičky os.)'
  ];
}

$list = [];
foreach($tips as $tip)
  $list[] = '<li>' . $tip . '</li>';
$tips = join(PHP_EOL, $list);

print <<<HTML
<h1>$demotitle</h1>
<p>$desc</p>
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
        <marker id="move-ms" viewbox="-1 -1 2 2" markerUnits="userSpaceOnUse"
            markerWidth=".2" markerHeight=".2" orient="auto">
          <use xlink:href="#apath" transform="scale(-1, 1)"/>
        </marker>
        <marker id="move-me" viewbox="-1 -1 2 2" markerUnits="userSpaceOnUse"
            markerWidth=".2" markerHeight=".2" orient="auto">
          <use xlink:href="#apath"/>
        </marker>
        <marker id="move" viewbox="-.6 -.6 1.2 1.2" markerUnits="userSpaceOnUse"
            markerWidth=".6" markerHeight=".6" orient="auto">
          <path d="M -.15 -.15 H .15 V .15 H -.15 z"/>
          <path d="M -.5 0 H .5" marker-start="url(#move-ms)" marker-end="url(#move-me)"/>
          <path d="M 0 -.5 V .5" marker-start="url(#move-ms)" marker-end="url(#move-me)"/>
        </marker>
      </defs>
      <path class="coord-line" d="M -1.3 0 H 1.3" marker-end="url(#coord-arrow)"/>
      <path class="coord-line" d="M 0 1.3 V -1.3" marker-end="url(#coord-arrow)"/>
      <text class="filled text" x="1.3" y="-.1">E<tspan class="sub" dy=".2em">x</tspan></text>
      <text class="filled text" x=".1" y="-1.3">E<tspan class="sub" dy=".2em">y</tspan></text>
      <path id="semiaxis1" d="M 0 0" marker-end="url(#move)"/>
      <path id="semiaxis2" d="M 0 0" marker-end="url(#move)"/>
      <path id="semiaxis3" d="M 0 0" marker-end="url(#move)"/>
      <path id="semiaxis4" d="M 0 0" marker-end="url(#move)"/>
    </svg>
  </div>
</div>
<h2>$try</h2>
<ul>
  $tips
</ul>
HTML;
?>
