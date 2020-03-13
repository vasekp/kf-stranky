<?php
if($early) {
  array_push($css, 'css/switch.css');
  array_push($css, $demodir . '/wigner.css');
  array_push($scripts, 'demo-helpers.js');
  array_push($scripts, 'switch.js');
  array_push($scripts, $demodir . '/wigner.js');
  array_push($files, $demodir . '/functions.glsl');
  array_push($files, $demodir . '/wigner.vert');
  array_push($files, $demodir . '/wigner.frag');
  array_push($files, $demodir . '/graph.vert');
  array_push($files, $demodir . '/graph.frag');
  array_push($files, $demodir . '/history.vert');
  array_push($files, $demodir . '/history.frag');
  return;
}

if($en) {
  $desc = 'Wigner function is an alternative description of a quantum state, used primarily in quantum optics. Its domain is the phase space. In many respects it behaves like a probability dostribution, although it can reach negative values (which substitute complex phase in explaining interference phenomena). It is shown here for several important states of a 1D harmonic oscillator. Especially time evolution and position probability density reconstruction are particularly simple in this formalism.';
  $type = 'Initial state';
  $types = ['vacuum' => 'Vacuum', 'fock' => '1 photon', 'cat' => '"Cat" state'];
  $reset = 'Reset';
  $try = 'Tips for trying:';
  $tips = array(
    'In paused mode, you can control displacement and squeezing. Try resetting the vacuum state and reaching a coherent state, squeezed vacuum, phase- or amplitude-squeezed states.',
    'Gaussian states behave in terms of quadratures just like ensembles of classical trajectories. Imagine for comparison a group of sinusoids with equal frequency but with randomized amplitudes and phases. Can anything similar be said for the states featuring negativity?',
    'Note with the single-excitation state, how negative (red) values of the Wigner function can cancel out positive (blue) down to exact zero but never below.',
    'Watch the birth and decay of interference fringes when two packets meet (with cat states). How does their distance affect your observation?'
  );
} else {
  $desc = 'Wignerova funkce je alternativní popis stavu kvantového systému užívaný zejména v kvantové optice. Je definována na proměnných fázového prostoru (souřadnice a hybnosti). V mnoha ohledech se chová jako rozdělení pravděpodobnosti, může ale nabývat záporných hodnot (pomocí kterých popíše i interferenční jevy bez potřeby komplexní fáze). Zde ukázáno pro několik důležitých stavů 1D harmonického oscilátoru. Zejména vývoj stavu a rekonstrukce hustot pravděpodobnosti polohy a hybnosti nabývají obzvlášť jednoduchého tvaru.';
  $type = 'Výchozí stav';
  $types = ['vacuum' => 'Vakuum', 'fock' => '1 foton', 'cat' => '"Cat" stav'];
  $reset = 'Reset';
  $try = 'Zkuste si:';
  $tips = array(
    'Po zastavení můžete ovládat posunutí a stlačení stavu. Zkuste si z vakua vyrobit koherentní stav, stlačené vakuum, fázově a amplitudově stlačený stav.',
    'Gaussovské stavy se z hlediska kvadratur chovají stejně jako směs klasických trajektorií. Porovnejte si časový průběh rozdělení s množinou sinusoid stejné frekvence, ale náhodně rozdělené fáze, amplitudy a posunu. Platí podobná intuice i pro stavy s negativitou?',
    'Všimněte si na příkladu 1-fotonového stavu, jak záporné (červené) hodnoty Wignerovy funkce dokáží vyrušit kladné (modré) až k nule, ale nikdy pod ní.',
    'Sledujte vznik interferenčních proužků, když se dva balíky překryjí (u "cat" stavu). Jak se projeví jejich vzdálenost?'
  );
}

print <<<HTML
        <h1>$demotitle</h1>
        $desc
        <p></p>
        $type:
        <div class="inline switch offset" id="func">\n
HTML;
$count = 0;
foreach($types as $id => $name)
  print_indent(5, '<a href="#" id="' . $id . '" data-func="' . $count++ . '">' . $name . '</a>');
print <<<HTML
        </div>
        <div class="inline switch offset">
          <a href="#" id="reset">$reset</a>
        </div>
        <div class="switch" id="play-controls">
          <a href="#" id="play"><img class="inline-img" src="$demodir/play.svg" alt="Play"/></a>
          <a href="#" id="pause"><img class="inline-img" src="$demodir/pause.svg" alt="Pause"/></a>
        </div>
        <div id="container">
          <canvas id="canvas"></canvas>
          <svg id="coords"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              version="1.1" viewBox="-5 -5 10 10">
            <defs>
              <path id="apath" d="M -1 -1 L 1 0 L -1 1 z"/>
              <marker class="filled" id="coord-arrow" viewbox="-1 -1 2 2" markerUnits="userSpaceOnUse"
                  markerWidth=".2" markerHeight=".2" orient="auto">
                <use xlink:href="#apath"/>
              </marker>
              <marker class="filled c1" id="c1-me" viewbox="-1 -1 2 2" markerUnits="userSpaceOnUse"
                  markerWidth=".2" markerHeight=".2" orient="auto">
                <use xlink:href="#apath"/>
              </marker>
              <marker class="filled c1" id="c1-ms" viewbox="-1 -1 2 2" markerUnits="userSpaceOnUse"
                  markerWidth=".2" markerHeight=".2" orient="auto">
                <use xlink:href="#apath" transform="scale(-1, 1)"/>
              </marker>
              <marker class="filled c2" id="c2-me" viewbox="-1 -1 2 2" markerUnits="userSpaceOnUse"
                  markerWidth=".2" markerHeight=".2" orient="auto">
                <use xlink:href="#apath"/>
              </marker>
              <marker class="filled c2" id="c2-ms" viewbox="-1 -1 2 2" markerUnits="userSpaceOnUse"
                  markerWidth=".2" markerHeight=".2" orient="auto">
                <use xlink:href="#apath" transform="scale(-1, 1)"/>
              </marker>
              <marker class="filled c3" id="c3-me" viewbox="-1 -1 2 2" markerUnits="userSpaceOnUse"
                  markerWidth=".2" markerHeight=".2" orient="auto">
                <use xlink:href="#apath"/>
              </marker>
              <marker class="filled c3" id="c3-ms" viewbox="-1 -1 2 2" markerUnits="userSpaceOnUse"
                  markerWidth=".2" markerHeight=".2" orient="auto">
                <use xlink:href="#apath" transform="scale(-1, 1)"/>
              </marker>
              <marker id="skew" class="stroked c1" viewbox="-1 -1 2 2" markerUnits="userSpaceOnUse"
                  markerWidth="2" markerHeight="2" orient="auto">
                <path d="M -.15 -.15 H .15 V .15 H -.15 z"/>
                <path d="M -.5 0 H .5" marker-start="url(#c1-ms)" marker-end="url(#c1-me)"/>
                <path d="M 0 -.5 V .5" marker-start="url(#c1-ms)" marker-end="url(#c1-me)"/>
              </marker>
              <marker id="rot" class="stroked c2" viewbox="-1 -1 2 2" markerUnits="userSpaceOnUse"
                  markerWidth="2" markerHeight="2" orient="auto">
                <path d="M -.15 -.15 H .15 V .15 H -.15 z"/>
                <path d="M -.5 0 H .5" marker-start="url(#c2-ms)" marker-end="url(#c2-me)"/>
                <path d="M -.1 -.5 Q .1 0 -.1 .5" marker-start="url(#c2-ms)" marker-end="url(#c2-me)"/>
              </marker>
              <marker id="move" class="stroked c3" viewbox="-1 -1 2 2" markerUnits="userSpaceOnUse"
                  markerWidth="2" markerHeight="2" orient="auto">
                <path d="M -.15 -.15 H .15 V .15 H -.15 z"/>
                <path d="M -.5 0 H .5" marker-start="url(#c3-ms)" marker-end="url(#c3-me)"/>
                <path d="M 0 -.5 V .5" marker-start="url(#c3-ms)" marker-end="url(#c3-me)"/>
              </marker>
            </defs>
            <path class="stroked" d="M -4 0 H 4" marker-end="url(#coord-arrow)"/>
            <path class="stroked" d="M 0 4 V -4" marker-end="url(#coord-arrow)"/>
            <text class="filled text" x="4" y="-.2">q</text>
            <text class="filled text" x=".2" y="-4">p</text>
            <g id="shape-controls" class="hidden" transform="scale(1, -1)">
              <path id="bounds" class="stroked" d="M 0 0" stroke-dasharray=".1 .1"/>
              <path id="edge-x" d="M 0 0" marker-end="url(#skew)"/>
              <path id="edge-y" d="M 0 0" marker-end="url(#skew)"/>
              <path id="corner-xy" d="M 0 0" marker-end="url(#rot)"/>
              <path id="center" d="M 0 0" marker-end="url(#move)"/>
              <path id="separ" d="M 0 0" marker-end="url(#rot)"/>
            </g>
          </svg>
        </div>
        <h2>$try</h2>\n
HTML;

print_indent(4, '<ul>');
foreach($tips as $tip)
  print_indent(5, '<li>' . $tip . '</li>');
print_indent(4, '</ul>');
?>