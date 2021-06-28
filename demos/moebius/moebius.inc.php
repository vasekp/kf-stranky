<?php
$css[] = $demodir . '/moebius.css';
$css[] = 'css/switch.css';
$scripts[] = 'shared.js';
$scripts[] = 'demo-helpers.js';
$scripts[] = $demodir . '/moebius.js';
$files[] = $demodir . '/grid.vert';
$files[] = $demodir . '/grid.frag';
$files[] = $demodir . '/sphere.vert';
$files[] = $demodir . '/sphere.frag';
$files[] = $demodir . '/plane.vert';
$files[] = $demodir . '/plane.frag';

if($en) {
  $desc = 'Möbious transformation is a rational map on the complex plane prescribed by ζ ↦ (aζ + b)/(cζ + d) for complex coefficients a, b, c, d forming some regular matrix M. It maps circles to circles again or to lines (corresponding to the limit of infinite radius). It is conformal, bijective, orientation-preserving and different transforms form a group in which composition corresponds to matrix multiplication.';
  $preset = 'Presets';
  $presets = [
    'i' => 'Identity<sup>1,2,3</sup>',
    'sx' => 'σ<sub>x</sub><sup>1</sup>',
    'sy' => 'σ<sub>y</sub><sup>1</sup>',
    'sz' => 'σ<sub>z</sub><sup>1,3</sup>',
    'h' => 'Hadamard<sup>1</sup>',
    'cayley' => 'Cayley<sup>1</sup>',
    'icayley' => 'i× Cayley<sup>1</sup>',
    'rot' => 'rotation<sup>1,2</sup>',
    'phase' => 'relative phase<sup>1,3</sup>',
    'skewX' => 'X-skew<sup>2</sup>',
    'skewY' => 'Y-skew<sup>2</sup>',
    'sqAxes' => 'axial squeeze<sup>2</sup>',
    'sqDiag' => 'diag. squeeze<sup>2,3</sup>',
  ];
  $random = [
    'rndU' => 'random<sup>1</sup>',
    'rndR' => 'random<sup>2</sup>',
    'rndU2' => 'random<sup>3</sup>',
  ];
  $expl = 'Explanation';
  $explItems = [
    'If the matrix M is <em>unitary</em> (<sup>1</sup>), the transformation acts in stereographic projection as a rotation.',
    'If it is <em>real</em> with a <em>positive determinant</em> (<sup>2</sup>), it preserves the upper and lower complex half-planes.',
    'If it is a member of the <em>generalized rotation group</em> U(1,1) (<sup>3</sup>), the transformation maps the unit disk to itself and, if interpreted as the Poincaré disk, has a meaning of rotation in hyperbolic space.',
    'A complex prefactor of M does not affect its associated transform. That is why for example σ<sub>y</sub> induces a transform appropriate to SL(2,R) matrices even though it is not one.'
  ];
  $functions = ['Spherical', 'Cartesian'];
} else {
  $desc = 'Möbiova transformace je na komplexní rovině předepsána vzorcem ζ ↦ (aζ + b)/(cζ + d) pro komplexní koeficienty a, b, c, d tvořící nějakou regulární matici M. Zobrazuje kružnice na kružnice, případně na přímky, odpovídající limitě nekonečného poloměru. Je konformní, bijektivní, zachovává orientaci a tvoří grupu automorfismů komplexní projektivní roviny se skládáním operací daným součinem matic.';
  $preset = 'Volba matice';
  $presets = [
    'i' => 'Identita<sup>1,2,3</sup>',
    'sx' => 'σ<sub>x</sub><sup>1</sup>',
    'sy' => 'σ<sub>y</sub><sup>1</sup>',
    'sz' => 'σ<sub>z</sub><sup>1,3</sup>',
    'h' => 'Hadamard<sup>1</sup>',
    'cayley' => 'Cayley<sup>1</sup>',
    'icayley' => 'i× Cayley<sup>1</sup>',
    'rot' => 'rotace<sup>1,2</sup>',
    'phase' => 'relativní fáze<sup>1,3</sup>',
    'skewX' => 'zkosení X<sup>2</sup>',
    'skewY' => 'zkosení Y<sup>2</sup>',
    'sqAxes' => 'stlačení<sup>2</sup>',
    'sqDiag' => 'stlačení diag.<sup>2,3</sup>',
  ];
  $random = [
    'rndU' => 'náhodná<sup>1</sup>',
    'rndR' => 'náhodná<sup>2</sup>',
    'rndU2' => 'náhodná<sup>3</sup>',
  ];
  $expl = 'Vysvětlivky';
  $explItems = [
    'Pokud matice M je <em>unitární</em> (<sup>1</sup>), má transformace ve stereografické projekci význam rotace sféry.',
    'Pokud je <em>reálná s kladným determinantem</em> (<sup>2</sup>), transformace zachovává horní a spodní komplexní polorovinu.',
    'Pokud je prvkem <em>zobecněné unitární grupy</em> U(1,1) (<sup>3</sup>), transformace zachovává jednotkový kruh (Poincarého kruh) a ve stereografické projekci na vrchní plochu dvoudílného hyperboloidu má smysl SO(2,1) rotace.',
    'Případný prefaktor matice nezmění jí indukovanou transformaci. Proto například σ<sub>y</sub> dává transformaci odpovídající SL(2,R) matici, i když taková není.'
  ];
  $functions = ['Sféricky', 'Kartézsky'];
}

$list = [];
foreach($explItems as $item) {
  $list[] = '<li>' . $item . '</li>';
}
$explanations = join(PHP_EOL, $list);

$list = [];
foreach($presets as $id => $name) {
  $list[] = '<button data-preset="' . $id . '">' . $name . '</button>';
}
$preset_list = join(PHP_EOL, $list);

$list = [];
foreach($random as $id => $name) {
  $list[] = '<button data-preset="' . $id . '">' . $name . '</button>';
}
$random_list = join(PHP_EOL, $list);

print <<<HTML
<p>$desc</p>
<div>$preset:</div>
<div id="presets">
  <div class="switch separate">
    $preset_list
  </div>
  <div class="switch separate">
    $random_list
  </div>
</div>
<div>
  <svg id="matrix" xmlns="http://www.w3.org/2000/svg" viewBox="-5.7 -1.4 10.8 2.8">
    <path stroke="black" fill="none" stroke-width=".05"
      d="M -3.7 -1.3 Q -4 -1 -4 -.5 -4 0 -4 .5 -4 1 -3.7 1.3
         M 4.7 -1.3 Q 5 -1 5 -.5 5 0 5 .5 5 1 4.7 1.3"/>
    <g font-size="1">
      <text x="-4" y="0.288" text-anchor="end">M =&nbsp;</text>
      <text id="m11" text-anchor="middle" x="-1.6" y="-0.424"></text>
      <text id="m12" text-anchor="middle" x="2.6" y="-0.424"></text>
      <text id="m21" text-anchor="middle" x="-1.6" y="1"></text>
      <text id="m22" text-anchor="middle" x="2.6" y="1"></text>
    </g>
  </svg>
</div>
<div class="row">
  <div class="container"><canvas id="grid"></canvas></div>
  <div class="container"><canvas id="sphere"></canvas></div>
</div>
<h2>$expl</h2>
<ul>
  $explanations
</ul>
HTML;
?>
