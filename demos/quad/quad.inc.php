<?php
if($early) {
  array_push($css, $demodir . '/quad.css');
  array_push($scripts, 'demo-helpers.js');
  array_push($scripts, $demodir . '/quad.js');
  array_push($files, $demodir . '/wigner.vert');
  array_push($files, $demodir . '/wigner.frag');
  array_push($files, $demodir . '/quad.vert');
  array_push($files, $demodir . '/quad.frag');
  array_push($files, $demodir . '/graph.vert');
  array_push($files, $demodir . '/graph.frag');
  return;
}?>

<div id="container">
  <canvas id="canvas"></canvas>
</div>
