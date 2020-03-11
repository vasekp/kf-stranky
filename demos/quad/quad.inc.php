<?php
if($early) {
  array_push($css, $demodir . '/quad.css');
  array_push($scripts, 'demo-helpers.js');
  array_push($scripts, $demodir . '/quad.js');
  array_push($files, $demodir . '/functions.glsl');
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
