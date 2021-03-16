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
  $desc = 'Möbious transformation is a rational map on the complex plane prescribed by ζ ↦ (aζ + b)/(cζ + d) for complex coefficients a, b, c, d forming some regular matrix. It maps circles to circles again or to lines (corresponding to the limit of infinite radius). If, moreover, the matrix is unitary, the transformation can easily be visualised in stereographic projection, where it becomes a rotation of the sphere.';
  $preset = 'Presets';
  $presets = [
     'i' => 'Identity',
     'sx' => 'σ<sub>x</sub>',
     'sy' => 'σ<sub>y</sub>',
     'sz' => 'σ<sub>z</sub>',
     'h' => 'Hadamard',
     'cayley' => 'Cayley',
     'icayley' => 'i× Cayley',
     'test' => 'Test'
  ];
  $expl = 'Explanation';
  $explItems = [
    'Attention: all normalization factors are left out from the functions above.'
  ];
  $functions = ['Spherical', 'Cartesian'];
} else {
  $desc = 'Möbiova transformace je na komplexní rovině předepsána vzorcem ζ ↦ (aζ + b)/(cζ + d) pro komplexní koeficienty a, b, c, d tvořící nějakou regulární matici. Zobrazuje kružnice na kružnice, případně na přímky, odpovídající limitě nekonečného poloměru. Je konformní, bijektivní, zachovává orientaci a tvoří grupu automorfismů komplexní projektivní roviny se skládáním operací daným součinem matic.';
  $preset = 'Volba matice';
  $presets = [
     'i' => 'Identita',
     'sx' => 'σ<sub>x</sub>',
     'sy' => 'σ<sub>y</sub>',
     'sz' => 'σ<sub>z</sub>',
     'h' => 'Hadamard',
     'cayley' => 'Cayley',
     'icayley' => 'i× Cayley',
     'test' => 'Test'
  ];
  $expl = 'Vysvětlivky';
  $explItems = [
    'Pokud matice M je <em>unitární</em>, má transformace ve stereografické projekci význam rotace sféry.',
    'Pokud je <em>reálná s kladným determinantem</em>, transformace zachovává horní a spodní komplexní polorovinu.',
    'Pokud je prvkem <em>zobecněné unitární grupy</em> U(1,1), transformace zachovává jednotkový kruh (Poincarého kruh) a ve stereografické projekci na vrchní plochu dvoudílného hyperboloidu má smysl SO(2,1) rotace.'
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
