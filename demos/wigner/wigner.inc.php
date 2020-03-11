<?php
if($early) {
  array_push($css, $demodir . '/wigner.css');
  array_push($scripts, 'demo-helpers.js');
  array_push($scripts, $demodir . '/wigner.js');
  array_push($files, $demodir . '/functions.glsl');
  array_push($files, $demodir . '/wigner.vert');
  array_push($files, $demodir . '/wigner.frag');
  array_push($files, $demodir . '/quad.vert');
  array_push($files, $demodir . '/quad.frag');
  array_push($files, $demodir . '/graph.vert');
  array_push($files, $demodir . '/graph.frag');
  return;
}

if($en) {
  $desc = 'Wigner function is an alternative description of a quantum state, used primarily in quantum optics. Its domain is the phase space. In many respects it behaves like a probability dostribution, although it can reach negative values (which substitute complex phase in explaining interference phenomena). It is shown here for several important states of a 1D harmonic oscillator. Especially time evolution and position probability density reconstruction are particularly simple in this formalism.';
} else {
  $desc = 'Wignerova funkce je alternativní popis stavu kvantového systému užívaný zejména v kvantové optice. Je definována na proměnných fázového prostoru (souřadnice a hybnosti). V mnoha ohledech se chová jako rozdělení pravděpodobnosti, může ale nabývat záporných hodnot (pomocí kterých popíše i interferenční jevy bez potřeby komplexní fáze). Zde ukázáno pro několik důležitých stavů 1D harmonického oscilátoru. Zejména vývoj stavu a rekonstrukce hustot pravděpodobnosti polohy a hybnosti nabývají obzvlášť jednoduchého tvaru.';
}

print <<<HTML
        <h1>$demotitle</h1>
        $desc
        <div id="container">
          <canvas id="canvas"></canvas>
          <svg id="coords" width="25em" height="25em" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="-12.5 -12.5 25 25">
            <defs>
              <marker id="arrow" viewbox="0 -1 2 2" markerUnits="strokeWidth"
                  markerWidth="6" markerHeight="6" orient="auto">
                <path class="filled" d="M 0 -1 L 2 0 L 0 1 z"/>
              </marker>
            </defs>
            <path class="stroked" d="M -10 0 H 10" marker-end="url(#arrow)"/>
            <path class="stroked" d="M 0 10 V -10" marker-end="url(#arrow)"/>
            <text class="filled text" x="10" y="-.5">q</text>
            <text class="filled text" x=".5" y="-10">p</text>
          </svg>
        </div>
HTML;
?>
