<?php
if($early) {
  array_push($css, 'css/switch.css');
  array_push($css, $demodir . '/chaotic.css');
  array_push($scripts, 'switch.js');
  array_push($scripts, 'demo-helpers.js');
  array_push($scripts, $demodir . '/chaotic.js');
  array_push($files, $demodir . '/pendulum.svg');
  return;
}
?>
        <div class="switch" id="controls">
          <a href="#" id="play"><img class="inline-img" src="<?php echo $demodir; ?>/play.svg"/></a>
          <a href="#" id="pause"><img class="inline-img" src="<?php echo $demodir; ?>/pause.svg"/></a>
        </div>
        <div class="row" id="c">
          <!-- SVG elements dynamically created here -->
          <br id="graphBreak"/>
          <canvas id="graph"></canvas>
        </div>
