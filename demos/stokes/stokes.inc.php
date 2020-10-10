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
    'Which parameters of the ellipse are conserved in rotations of the vector around x, y, z axes? (You can try that by tapping and holding the axis tips.) Look for horizontal, vertical, diagonal extents and the surface area of the ellipse.'
  ];
} else {
  $desc = 'Stokesovy parametry popisují polarizační stav světelné vlny (zde v ukázce uvažujeme pouze zcela polarizované vlny). Tvoří trojrozměrný vektor ležící na tzv. Poincarého sféře. Ta ukazuje topologické vztahy mezi možnými trajektoriemi opisovanými vektorem elektrické intenzity E. Polarizaci také můžeme charakterizovat pomocí amplitud oscilací složek E<sub>x</sub> a E<sub>y</sub> a jejich fázového rozdílu či pomocí geometrických vlastností polarizační elipsy.';
  $try = 'Zkuste si:';
  $tips = [
    'Jakým částem Poincarého sféry odpovídají lineární polarizace? Kruhové? Eliptické?',
    'Jaký vliv na oscilace x- a y-složky elektrické intenzity mají sférické úhly ϑ, ϕ?',
    'Jaké parametry trajektorie elektrické intenzity se zachovávají při rotacích Stokesových parametrů kolem x, y, z? (Stokesův vektor bude rotovat, stisknete-li a přidržíte špičky os.) Sledujte horizontální, vertikální, diagonální rozměry a plochu elipsy.'
  ];
}

$list = [];
foreach($tips as $tip)
  $list[] = '<li>' . $tip . '</li>';
$tips = join(PHP_EOL, $list);

print <<<HTML
<p>$desc</p>
<div class="row">
  <div class="container"><canvas id="sphere"></canvas></div>
  <div class="container" id="container2D">
    <canvas id="vector"></canvas>
  </div>
</div>
<h2>$try</h2>
<ul>
  $tips
</ul>
HTML;
?>
