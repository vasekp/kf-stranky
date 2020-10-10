<?php
$css[] = 'css/switch.css';
$css[] = $demodir . '/evan.css';
$scripts[] = 'shared.js';
$scripts[] = 'demo-helpers.js';
$scripts[] = 'switch.js';
$scripts[] = $demodir . '/evan.js';
$files[] = $demodir . '/prepare.vert';
$files[] = $demodir . '/prep-above.frag';
$files[] = $demodir . '/prep-below.frag';
$files[] = $demodir . '/draw.vert';
$files[] = $demodir . '/draw.frag';

if($en) {
  $desc = <<<END
The transition from refraction to total internal reflection is not instantaneous for real waves.
Finite beam width implies the presence of both sub- and supercritical incidence angles.
Also, waves incident above the critical angle still penetrate several wavelengths into the optically rarer medium in the form of an evanescent wave.
END;
  $polar = 'Polarization';
  $polars = ['s' => 'perpendicular', 'p' => 'parallel'];
  $ratio = 'IOR ratio';
  $try = 'Tips for trying:';
  $tips = [
    'Set the angle of incidence a little over critical and observe the shape of the reflected and transmitted parts of the wave.',
    'As the beam width grows, compared to wavelength, the incident wave gets more similar to a plane wave. See how the imperfections disappear but the evanescent wave broadens. In contrast, narrow beams result in strong distortions.',
    'The small lateral shift with respect to the marked axis of an ideal reflected beam is caused by the fact that the reflection does not happen strictly on the interface plane. This is known as the Goos–Hänchen effect.',
    'For <em>p</em>-polarized wave there is Brewster\'s angle in which the reflection coefficient drops to zero. Can you find it?',
    'Note for big differences in optical density how the wavelength changes for the transmitted wave. Also, what happens in normal incidence?',
    'The plot shows the magnetic field, which for μ<sub>r</sub> = 1 is continuous on a dielectric interface. You can zoom in by setting a large wavelength.',
    'The simulation won\'t let you choose beams with Rayleigh length smaller than the viewport.'
  ];
} else {
  $desc = <<<END
Přechod od lomu k totálnímu odrazu není pro reálné paprsky skokový jev.
Konečná šířka paprsku znamená přítomnost vln s nad- i podkritickými úhly.
Navíc i za kritickým úhlem vlna stále vstupuje do opticky řidšího prostředí ve formě evanescentní vlny, s typickým dosahem několika násobků vlnové délky.
END;
  $polar = 'Polarizace';
  $polars = ['s' => 'kolmá', 'p' => 'rovnoběžná'];
  $ratio = 'Poměr indexů lomu';
  $try = 'Zkuste si:';
  $tips = [
    'Nastavte úhel dopadu blízko nad kritickou hodnotu a sledujte tvar odražené vlny a prošlé části.',
    'Jak roste poměr šířky paprsku k vlnové délce, dopadající vlna je stále podobnější rovinné vlně. Všimněte si, jak se nedokonalosti vyhlazují, ale evanescentní oblast rozšiřuje. Naopak pro úzké paprsky jsou obě vlny velmi zkreslené.',
    'Malá odchylka od vyznačeného středu idealizovaného odraženého paprsku je způsobena tím, že k odrazu nedochází přesně v rovině rozhraní, ale v oblasti evanescentní vlny. Jedná se o tzv. Goos–Hänchenův efekt.',
    'Pro <em>p</em>-polarizovanou vlnu existuje Brewsterův úhel, při němž koeficient odrazu klesá na nulu. Dokážete jej najít?',
    'Pro silné rozdíly v optické hustotě si všimněte, jak se po průchodu zkrátí nebo prodlouží vlnová délka. Dokážete popsat pozorování při kolmém dopadu?',
    'Vykreslena je výchylka magnetického pole, která je pro μ<sub>r</sub> = 1 na rozhraní dvou dielektrik spojitá. To nejlépe oceníte s velkou vlnovou délkou.',
    'Simulace vás nenechá zvolit paprsky tak úzké, že jejich Rayleighova vzdálenost by byla menší než okno.'
  ];
}

$list = [];
foreach($tips as $tip)
  $list[] = '<li>' . $tip . '</li>';
$tips = join(PHP_EOL, $list);

print <<<HTML
<h1>$demotitle</h1>
<p>$desc</p>
<div class="settings">
  <div>$polar:</div>
  <div class="inline switch" id="polarization">
    <a href="#" id="s">$polars[s] (<em>s</em>)</a>
    <a href="#" id="p">$polars[p] (<em>p</em>)</a>
  </div>
  <div>$ratio:</div>
  <div>
    <input type="range" min="-1" max="1" value="-0.25" step="any" id="ratio"/>
  </div>
</div>
<div id="container">
  <canvas id="canvas"></canvas>
</div>
<h2>$try</h2>
<ul>
  $tips
</ul>
HTML;
?>
