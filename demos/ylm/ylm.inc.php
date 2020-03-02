<?php
if($early) {
  array_push($css, $demodir . '/ylm.css');
  array_push($css, 'css/switch.css');
  array_push($scripts, 'switch.js');
  array_push($scripts, 'demo-helpers.js');
  array_push($scripts, $demodir . '/ylm.js');
  array_push($files, $demodir . '/background.vert');
  array_push($files, $demodir . '/background.frag');
  array_push($files, $demodir . '/sphere.vert');
  array_push($files, $demodir . '/sphere.frag');
  array_push($files, $demodir . '/arrow.vert');
  array_push($files, $demodir . '/arrow.frag');
  return;
}

if($en) {
  $desc = 'Various fundamental systems of spaces of functions defined on the unit sphere. '
    . 'Equivalently we can perceive them as functions of the unit directional vector. '
    . 'This leads to two natural means of their visualisation.';
  $proj = 'Projection';
  $models = array('Sphere', 'Traditional');
  $type = 'Function type';
  $types = array(
     'ylm' => 'Harmonic',
     'ri' => 'Y<sub>l,m</sub> ± Y<sub>l,-m</sub>',
     'cart' => 'Cartesian',
     'random' => 'Random'
  );
  $new = 'New';
  $expl = 'Explanation';
  $explItems = array(
    'Complex-valued spherical harmonic functions Y<sub>l,m</sub> form the most commonly used orthonormal basis of L<sup>2</sup>(S<sub>2</sub>, d<sup>2</sup>Ω). They are also eigenfunctions of L<sub>z</sub>.',
    'Functions Y<sub>l,m</sub> a Y<sub>l,-m</sub> only differ in sign of their real or imaginary parts, so using their sums and differences we can find a real-valued ON basis.',
    'Each Y<sub>l,m</sub> is some simple polynomial in the components of the directional vector. We can alternatively find spherical functions in this form, without a preferred rotation axis. This forms an overcomplete set.',
    'The last button generates a random superposition of various m but constant l.'
  );
} else {
  $desc = 'Různé fundamentální systémy prostoru funkcí definovaných na jednotkové sféře. '
    . 'Ekvivalentně je můžeme uvažovat jako funkce směru od počátku souřadnic. '
    . 'Odtud plynou dva přirozené způsoby jejich vizualizace.';
  $proj = 'Projekce';
  $models = array('Sférická', 'Tradiční');
  $type = 'Typ funkce';
  $types = array(
     'ylm' => 'Harmonická',
     'ri' => 'Y<sub>l,m</sub> ± Y<sub>l,-m</sub>',
     'cart' => 'Kartézská',
     'random' => 'Náhodná'
  );
  $new = 'Nová';
  $expl = 'Vysvětlivky';
  $explItems = array(
    'Komplexní sférické harmonické funkce Y<sub>l,m</sub> tvoří ortonormální bázi L<sup>2</sup>(S<sub>2</sub>, d<sup>2</sup>Ω) v nejznámějším tvaru. Jsou též vlastními funkcemi L<sub>z</sub>.',
    'Funkce Y<sub>l,m</sub> a Y<sub>l,-m</sub> se liší pouze znaménkem reálné nebo imaginární části, takže jejich součtem a rozdílem můžeme dosáhnout ON báze tvořené reálnými funkcemi.',
    'Každá Y<sub>l,m</sub> je jednoduchý polynom složek směrového vektoru. Sférické funkce můžeme alternativně hledat jako takové polynomy bez volby preferované rotační osy. Dostaneme ovšem neortogonální soubor.',
    'Poslední tlačítko vygeneruje náhodnou kombinaci funkcí různého m, ale stejného l.'
  );
}

print <<<HTML
        <h1>$demotitle</h1>
        $desc
        <table>
          <tr>
            <td>$proj:</td>
            <td>
              <div class="inline switch" id="model">
                <a href="#" data-model="1">$models[0]</a>
                <a href="#" data-model="2">$models[1]</a>
              </div>
            </td>
          </tr>
          <tr>
            <td>$type:</td>
            <td>
              <div class="inline switch" id="family">
                <a href="#" data-family="ylm">{$types['ylm']}</a>
                <a href="#" data-family="ri">{$types['ri']}</a>
                <a href="#" data-family="cart">{$types['cart']}</a>
                <a href="#" data-family="random">{$types['random']}</a>
              </div>
            </td>
          </tr>
        </table>
        <button id="random" class="button">$new</button>
        <canvas id="canvas"></canvas>
        <h2>$expl</h2>
HTML;

print_indent(4, '<ul>');
foreach($explItems as $item)
  print_indent(5, '<li>' . $item . '</li>');
print_indent(4, '</ul>');
?>
