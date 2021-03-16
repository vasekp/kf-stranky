<?php
$css[] = $demodir . '/moebius.css';
$css[] = 'css/switch.css';
$scripts[] = 'shared.js';
$scripts[] = 'switch.js';
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
     'i' => 'Identity',
     'sx' => 'σ<sub>x</sub>',
     'sy' => 'σ<sub>y</sub>',
     'sz' => 'σ<sub>z</sub>',
     'h' => 'Hadamard',
     'cayley' => 'Cayley',
     'icayley' => 'i× Cayley',
     'rot' => 'rotation',
     'phase' => 'relative phase',
     'skewX' => 'X-skew',
     'skewX' => 'Y-skew',
     'sqAxes' => 'squeezing',
     'sqDiag' => 'diag. squeeze',
  ];
  $expl = 'Explanation';
  $explItems = [
    'If the matrix M is <em>unitary</em>, the transformation acts in stereographic projection as a rotation.',
    'If it is <em>real</em> with a <em>positive determinant</em>, it preserves the upper and lower complex half-planes.',
    'If it is a member of the <em>generalized rotation group</em> U(1,1), the transformation maps the unit disk to itself and, if interpreted as the Poincaré disk, has a meaning of rotation in hyperbolic space.',
    'A complex prefactor of M does not affect its associated transform. That is why for example σ<sub>y</sub> induces a transform appropriate to SL(2,R) matrices even though it is not one.'
  ];
  $functions = ['Spherical', 'Cartesian'];
} else {
  $desc = 'Möbiova transformace je na komplexní rovině předepsána vzorcem ζ ↦ (aζ + b)/(cζ + d) pro komplexní koeficienty a, b, c, d tvořící nějakou regulární matici M. Zobrazuje kružnice na kružnice, případně na přímky, odpovídající limitě nekonečného poloměru. Je konformní, bijektivní, zachovává orientaci a tvoří grupu automorfismů komplexní projektivní roviny se skládáním operací daným součinem matic.';
  $preset = 'Volba matice';
  $presets = [
     'i' => 'Identita',
     'sx' => 'σ<sub>x</sub>',
     'sy' => 'σ<sub>y</sub>',
     'sz' => 'σ<sub>z</sub>',
     'h' => 'Hadamard',
     'cayley' => 'Cayley',
     'icayley' => 'i× Cayley',
     'rot' => 'rotace',
     'phase' => 'relativní fáze',
     'skewX' => 'zkosení X',
     'skewX' => 'zkosení Y',
     'sqAxes' => 'stlačení',
     'sqDiag' => 'stlačení diag.',
  ];
  $expl = 'Vysvětlivky';
  $explItems = [
    'Pokud matice M je <em>unitární</em>, má transformace ve stereografické projekci význam rotace sféry.',
    'Pokud je <em>reálná s kladným determinantem</em>, transformace zachovává horní a spodní komplexní polorovinu.',
    'Pokud je prvkem <em>zobecněné unitární grupy</em> U(1,1), transformace zachovává jednotkový kruh (Poincarého kruh) a ve stereografické projekci na vrchní plochu dvoudílného hyperboloidu má smysl SO(2,1) rotace.',
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
  $list[] = '<a class="separate" href="#" data-preset="' . $id . '">' . $name . '</a>';
}
$preset_list = join(PHP_EOL, $list);

print <<<HTML
<p>$desc</p>
<div>$preset:</div>
<div class="switch" id="presets">
  $preset_list
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
