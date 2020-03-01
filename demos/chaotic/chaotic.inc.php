<?php
if($early) {
  array_push($css, 'css/switch.css');
  array_push($css, 'demos/chaotic/chaotic.css');
  array_push($scripts, 'switch.js');
  array_push($scripts, 'demos/chaotic/chaotic.js');
  return;
}
?>
<div class="switch" id="controls">
  <a href="#" id="play"><img class="inline-img" src="demos/chaotic/play.svg"/></a>
  <a href="#" id="pause"><img class="inline-img" src="demos/chaotic/pause.svg"/></a>
</div>
<div class="row">
<svg class="pendulum" id="svg1" data-state="state1" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="-6 -6 12 12">
  <g transform="scale(1 -1)" stroke="black" stroke-width="0.05" stroke-linejoin="round">
    <g id="alpha">
      <path id="alpha" fill="#f00" d="M -3.3 0.3 H 3.3 V -3.3 H 2.7 V -0.3 H -3.3 z"/>
      <circle cx="0" cy="0" r="0.2" fill="#888"/>
      <g transform="translate(-3 0)">
        <path id="beta-alpha" fill="#00f" d="M -0.3 0.3 H 0.3 V -3.3 H -0.3 z"/>
      </g>
      <circle cx="-3" cy="0" r="0.2" fill="#888"/>
    </g>
  </g>
</svg>
<svg class="pendulum" id="svg2" data-state="state2" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="-6 -6 12 12">
  <g transform="scale(1 -1)" stroke="black" stroke-width="0.05" stroke-linejoin="round">
    <g id="alpha">
      <path id="alpha" fill="#f88" d="M -3.3 0.3 H 3.3 V -3.3 H 2.7 V -0.3 H -3.3 z"/>
      <circle cx="0" cy="0" r="0.2" fill="#888"/>
      <g transform="translate(-3 0)">
        <path id="beta-alpha" fill="#88f" d="M -0.3 0.3 H 0.3 V -3.3 H -0.3 z"/>
      </g>
      <circle cx="-3" cy="0" r="0.2" fill="#888"/>
    </g>
  </g>
</svg>
<br/>
<canvas id="graph"></canvas>
</div>
