<?php
if($early) {
  array_push($css, 'css/switch.css');
  array_push($css, 'demos/chaotic/chaotic.css');
  array_push($scripts, 'switch.js');
  array_push($scripts, 'demos/helpers.js');
  array_push($scripts, 'demos/chaotic/chaotic.js');
  return;
}
?>
        <div class="switch" id="controls">
          <a href="#" id="play"><img class="inline-img" src="demos/chaotic/play.svg"/></a>
          <a href="#" id="pause"><img class="inline-img" src="demos/chaotic/pause.svg"/></a>
        </div>
        <div class="row" id="c">
          <!-- SVG elements dynamically created here -->
          <br id="graphBreak"/>
          <canvas id="graph"></canvas>
        </div>
