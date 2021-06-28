<?php
$css[] = 'css/switch.css';
$css[] = $demodir . '/wigner.css';
$scripts[] = 'shared.js';
$scripts[] = 'demo-helpers.js';
$scripts[] = $demodir . '/wigner.js';
$files[] = $demodir . '/functions.glsl';
$files[] = $demodir . '/wigner.vert';
$files[] = $demodir . '/wigner.frag';
$files[] = $demodir . '/graph.vert';
$files[] = $demodir . '/graph.frag';
$files[] = $demodir . '/history.vert';
$files[] = $demodir . '/history.frag';
$files[] = $demodir . '/whistory.frag';
$files[] = $demodir . '/wave.vert';
$files[] = $demodir . '/wave.frag';

if($en) {
  $desc = 'Wigner function is an alternative description of a quantum state, used primarily in quantum optics. Its domain is the phase space. In many respects it behaves like a probability dostribution, although it can reach negative values (which substitute complex phase in explaining interference phenomena). It is shown here for several important states of a 1D harmonic oscillator. Especially time evolution and position probability density reconstruction are particularly simple, compared to wave function approach, in this formalism.';
  $type = 'Initial state';
  $types = ['vacuum' => 'Vacuum', 'fock' => '1 photon', 'cat' => '"Cat" state'];
  $reset = 'Reset';
  $plotType = 'Plot';
  $plotTypes = ['prob' => 'Density', 'wave' => 'Wave function'];
  $try = 'Tips for trying:';
  $tips = [
    'In paused mode, you can control displacement and squeezing. Try resetting the vacuum state and reaching a coherent state, squeezed vacuum, phase- or amplitude-squeezed states.',
    'Gaussian states behave in terms of quadratures just like ensembles of classical trajectories. Imagine for comparison a group of sinusoids with equal frequency but with randomized amplitudes and phases. Can anything similar be said for the states featuring negativity?',
    'Note with the single-excitation state, how negative (red) values of the Wigner function can cancel out positive (blue) down to exact zero but never below.',
    'Watch the birth and decay of interference fringes when two packets meet (with cat states). How does their distance affect your observation?'
  ];
} else {
  $desc = 'Wignerova funkce je alternativní popis stavu kvantového systému užívaný zejména v kvantové optice. Je definována na proměnných fázového prostoru (souřadnice a hybnosti). V mnoha ohledech se chová jako rozdělení pravděpodobnosti, může ale nabývat záporných hodnot (pomocí kterých popíše i interferenční jevy bez potřeby komplexní fáze). Zde ukázáno pro několik důležitých stavů 1D harmonického oscilátoru. Zejména vývoj stavu a rekonstrukce hustot pravděpodobnosti polohy a hybnosti nabývají ve srovnání s vlnovou funkcí obzvlášť jednoduchého tvaru.';
  $type = 'Výchozí stav';
  $types = ['vacuum' => 'Vakuum', 'fock' => '1 foton', 'cat' => '"Cat" stav'];
  $reset = 'Reset';
  $plotType = 'Vykreslit';
  $plotTypes = ['prob' => 'Hustota', 'wave' => 'Vlnová funkce'];
  $try = 'Zkuste si:';
  $tips = [
    'Po zastavení můžete ovládat posunutí a stlačení stavu. Zkuste si z vakua vyrobit koherentní stav, stlačené vakuum, fázově a amplitudově stlačený stav.',
    'Gaussovské stavy se z hlediska kvadratur chovají stejně jako směs klasických trajektorií. Porovnejte si časový průběh rozdělení s množinou sinusoid stejné frekvence, ale náhodně rozdělené fáze, amplitudy a posunu. Platí podobná intuice i pro stavy s negativitou?',
    'Všimněte si na příkladu 1-fotonového stavu, jak záporné (červené) hodnoty Wignerovy funkce dokáží vyrušit kladné (modré) až k nule, ale nikdy pod ní.',
    'Sledujte vznik interferenčních proužků, když se dva balíky překryjí (u "cat" stavu). Jak se projeví jejich vzdálenost?'
  ];
}

$list = [];
foreach($tips as $tip)
  $list[] = '<li>' . $tip . '</li>';
$tips = join(PHP_EOL, $list);

$list = [];
$count = 0;
foreach($types as $id => $name) {
  $checked = $id == 'vacuum' ? ' checked' : '';
  $list[] = '<input type="radio" name="type" id="' . $id . '" data-func="' . $count++ . '"' . $checked . '/>';
  $list[] = '<label for="' . $id . '">' . $name . '</label>';
}
$types = join(PHP_EOL, $list);

$list = [];
foreach($plotTypes as $id => $name) {
  $checked = $id == 'prob' ? ' checked' : '';
  $list[] = '<input type="radio" name="plottype" id="' . $id . '"' . $checked . '/>';
  $list[] = '<label for="' . $id . '">' . $name . '</label>';
}
$plotTypes = join(PHP_EOL, $list);

print <<<HTML
<p>$desc</p>
<div class="settings">
  <div>$type:</div>
  <div class="inline switch" id="func">
    $types
  </div>
  <div class="inline switch">
    <button id="reset">$reset</button>
  </div>
  <div>$plotType:</div>
  <div class="inline switch" id="plotType">
    $plotTypes
  </div>
</div>
<div class="switch" id="play-controls">
  <input type="radio" name="controls" id="play" checked/>
  <label for="play"><img class="inline-img" src="$demodir/play.svg" alt="Play"/></label>
  <input type="radio" name="controls" id="pause"/>
  <label for="pause"><img class="inline-img" src="$demodir/pause.svg" alt="Pause"/></label>
</div>
<div id="container">
  <canvas id="canvas"></canvas>
  <div id="overlayContainer"></div>
</div>
<h2>$try</h2>
<ul>
  $tips
</ul>
HTML;
?>
