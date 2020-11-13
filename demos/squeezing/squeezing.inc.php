<?php
$css[] = $demodir . '/squeezing.css';
$scripts[] = 'demo-helpers.js';
$scripts[] = $demodir . '/squeezing.js';

if($en) {
  $desc = 'Displacement and squeezing are two fundamental transformations of the quantum state of a single optical mode. Together with the time evolution operator they generate all possible linear transformations of the creation and annihilation operator preserving the canonical commutation relation, and consequently, e.g., the Gaussian shape of wavefunction and Wigner function and the product of uncertainties in its main axes. In this demo you can explore two measures of nonclassicality, the mandel Q parameter and the squeezing parameter S<sub>θ</sub>.';
  $apply = 'Apply an operator:';
  $try = 'Tips for trying:';
  $tips = [
    'Displacements and time evolution alone cannot create any nonclassical features (starting from the vacuum state). With the measures of nonclassicality shown, is any squeezed state nonclassical or can some combination of transformations mask this?',
    'What properties do squeezed vacuum, phase- and amplitude-squeezed states have?',
    'Choose some combination of operators and try to reach the same result applying them in the other order. Did you need equal α, ζ, t, or different?'
  ];
} else {
  $desc = 'Posun a stlačení stavu jsou dvě základní transformace kvantového stavu optického módu. Spolu s operátorem časového vývoje generují všechny možnosti lineárních transformací kreačního a anihilačního operátoru zachovávajících kanonické komutační relace a tedy mimojiné gaussovský tvar vlnové funkce a Wignerovy funkce a součinu neurčitostí v hlavních osách. V této ukázce můžete zkoumat dvě míry neklasičnosti stavu, Mandelův parametr Q a parametr stlačení S<sub>θ</sub>.';
  $apply = 'Aplikovat operátor:';
  $try = 'Zkuste si:';
  $tips = [
    'Přesvědčte se, že samotné posuny a časový vývoj nezpůsobí žádné neklasické vlastnosti, vycházíme-li z vakua. Naopak, je každý stlačený stav neklasický nebo nějaká kombinace dokáže toto zamaskovat?',
    'Jaké vlastnosti má stlačené vakuum, fázově, amplitudově stlačený stav?',
    'Vyberte si z operací některé dvě a zkuste dojít ke stejnému stavu jejich použitím v různém pořadí. Potřebovali jste stejné nebo jiné α, ζ, t?',
  ];
}

$list = [];
foreach($tips as $tip)
  $list[] = '<li>' . $tip . '</li>';
$tips = join(PHP_EOL, $list);

print <<<HTML
<p>$desc</p>
<h2>$apply</h2>
<div class="row">
  <div class="operator">
    <div class="op-container" id="op-d"></div>
    <button id="reset-d">Reset</button>
  </div>
  <div class="operator">
    <div class="op-container" id="op-s"></div>
    <button id="reset-s">Reset</button>
  </div>
  <div class="operator">
    <div class="op-container" id="op-u"></div>
  </div>
</div>
<div id="pq"></div>
<div class="row">
  <div class="properties">
    <div class="prop-container" id="graph-n"></div>
    <span class="value" id="val-qm" data-value="0.00">Q<sub>M</sub> = </span>
  </div>
  <div class="properties">
    <div class="prop-container" id="graph-sq"></div>
    <span class="value" id="val-sq" data-value="0.00">min S<sub>θ</sub> = </span>
  </div>
</div>
<h2>$try</h2>
<ul>
  $tips
</ul>
HTML;
?>
