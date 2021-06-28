<?php
$css[] = $demodir . '/ylm.css';
$css[] = 'css/switch.css';
$scripts[] = 'shared.js';
$scripts[] = 'demo-helpers.js';
$scripts[] = $demodir . '/ylm.js';
$files[] = $demodir . '/background.vert';
$files[] = $demodir . '/background.frag';
$files[] = $demodir . '/sphere.vert';
$files[] = $demodir . '/sphere.frag';
$files[] = $demodir . '/arrow.vert';
$files[] = $demodir . '/arrow.frag';

if($en) {
  $desc = 'Various fundamental systems of spaces of functions defined on the unit sphere. '
    . 'Equivalently we can perceive them as functions of the unit directional vector. '
    . 'This leads to two natural means of their visualisation.';
  $proj = 'Projection';
  $models = ['Sphere', 'Traditional'];
  $type = 'Function type';
  $types = [
     'ylm' => 'Harmonic',
     'ri' => 'Y<sub>l,m</sub> ± Y<sub>l,-m</sub>',
     'cart' => 'Cartesian',
     'random' => 'Generic'
  ];
  $new = 'Random';
  $expl = 'Explanation';
  $explItems = [
    'Complex-valued spherical harmonic functions Y<sub>l,m</sub> form the most commonly used orthonormal basis of L<sup>2</sup>(S<sub>2</sub>, d<sup>2</sup>Ω). They are also eigenfunctions of L<sub>z</sub>.',
    'Functions Y<sub>l,m</sub> a Y<sub>l,-m</sub> only differ in sign of their real or imaginary parts, so using their sums and differences we can find a real-valued ON basis.',
    'Each Y<sub>l,m</sub> is some simple polynomial in the components of the directional vector. We can alternatively find spherical functions in this form, without a preferred rotation axis. This forms an overcomplete set.',
    'The last button generates a random superposition of various m but constant l.',
    'Attention: all normalization factors are left out from the functions above.'
  ];
  $functions = ['Spherical', 'Cartesian'];
} else {
  $desc = 'Různé fundamentální systémy prostoru funkcí definovaných na jednotkové sféře. '
    . 'Ekvivalentně je můžeme uvažovat jako funkce směru od počátku souřadnic. '
    . 'Odtud plynou dva přirozené způsoby jejich vizualizace.';
  $proj = 'Projekce';
  $models = ['Sférická', 'Tradiční'];
  $type = 'Typ funkce';
  $types = [
     'ylm' => 'Harmonická',
     'ri' => 'Y<sub>l,m</sub> ± Y<sub>l,-m</sub>',
     'cart' => 'Kartézská',
     'random' => 'Obecná'
  ];
  $new = 'Náhodná';
  $expl = 'Vysvětlivky';
  $explItems = [
    'Komplexní sférické harmonické funkce Y<sub>l,m</sub> tvoří ortonormální bázi L<sup>2</sup>(S<sub>2</sub>, d<sup>2</sup>Ω) v nejznámějším tvaru. Jsou též vlastními funkcemi L<sub>z</sub>.',
    'Funkce Y<sub>l,m</sub> a Y<sub>l,-m</sub> se liší pouze znaménkem reálné nebo imaginární části, takže jejich součtem a rozdílem můžeme dosáhnout ON báze tvořené reálnými funkcemi.',
    'Každá Y<sub>l,m</sub> je jednoduchý polynom složek směrového vektoru. Sférické funkce můžeme alternativně hledat jako takové polynomy bez volby preferované rotační osy. Dostaneme ovšem neortogonální soubor.',
    'Poslední tlačítko vygeneruje náhodnou kombinaci funkcí různého m, ale stejného l.',
    'Upozornění: všechny funkce jsou zobrazovány bez normalizačních konstant.'
  ];
  $functions = ['Sféricky', 'Kartézsky'];
}

$list = [];
foreach($explItems as $item) {
  $list[] = '<li>' . $item . '</li>';
}
$explanations = join(PHP_EOL, $list);

print <<<HTML
<p>$desc</p>
<div class="settings">
  <div>$type:</div>
  <div class="inline switch" id="family">
    <input type="radio" name="family" id="ylm" checked/><label for="ylm">$types[ylm]</label>
    <input type="radio" name="family" id="ri"/><label for="ri">$types[ri]</label>
    <input type="radio" name="family" id="cart"/><label for="cart">$types[cart]</label>
    <input type="radio" name="family" id="random"/><label for="random">$types[random]</label>
  </div>
  <div>$proj:</div>
  <div class="inline switch" id="model">
    <input type="radio" name="model" id="sph" data-model="1" checked/><label for="sph">$models[0]</label>
    <input type="radio" name="model" id="trad" data-model="2"/><label for="trad">$models[1]</label>
  </div>
</div>
<div class="switch" id="controls">
  <button id="l-">«l</button>
  <button id="m-">«m</button>
  <button id="random">$new</button>
  <button id="m+">m»</button>
  <button id="l+">l»</button>
</div>
<div id="container">
  <canvas id="canvas"></canvas>
  <div id="functions">
    $functions[0]: <span id="formula-ylm"></span>
    <br/>
    $functions[1]: <span id="formula-cart"></span>
  </div>
</div>
<h2>$expl</h2>
<ul>
  $explanations
</ul>
HTML;
?>
