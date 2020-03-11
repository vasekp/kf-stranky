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
} else {
  $desc = 'Wignerova funkce je alternativní popis stavu kvantového systému užívaný zejména v kvantové optice. Je definována na proměnných fázového prostoru (souřadnice a hybnosti). V mnoha ohledech se chová jako rozdělení pravděpodobnosti, může ale nabývat záporných hodnot (pomocí kterých popíše i interferenční jevy bez potřeby komplexní fáze). Zde ukázáno pro několik důležitých stavů 1D harmonického oscilátoru. Zejména vývoj stavu a rekonstrukce hustot pravděpodobnosti polohy a hybnosti nabývají obzvlášť jednoduchého tvaru.';
  $type = 'Výchozí stav';
  $types = [0 => 'Vakuum', 1 => '1 foton', 2 => '"Cat" stav'];
  $reset = 'Reset';
}

print <<<HTML
        <h1>$demotitle</h1>
        $desc
        <p></p>
        $type:
        <div class="inline switch offset" id="func">\n
HTML;
foreach($types as $id => $name)
  print_indent(5, '<a href="#" data-func="' . $id . '">' . $name . '</a>');
print <<<HTML
        </div>
        <div class="inline switch offset">
          <a href="#" id="reset">$reset</a>
        </div>
        <div class="switch" id="play-controls">
          <a href="#" id="play"><img class="inline-img" src="$demodir/play.svg"/></a>
          <a href="#" id="pause"><img class="inline-img" src="$demodir/pause.svg"/></a>
        </div>
        <div id="container">
          <canvas id="canvas"></canvas>
          <svg id="coords" width="25em" height="25em"
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
        </div>\n
HTML;
?>
