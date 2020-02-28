<?php
if($early) {
  array_push($css, 'demos/chaotic/chaotic.css');
  //array_push($css, 'css/switch.css');
  array_push($scripts, 'demos/chaotic/chaotic.js');
  return;
}
?>
<svg id="svg" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="-6 -6 12 12">
  <g transform="scale(1 -1)" stroke="black" stroke-width="0.05" stroke-linejoin="round">
    <g id="alpha">
      <path id="alpha" fill="red" d="M -3.3 0.3 H 3.3 V -3.3 H 2.7 V -0.3 H -3.3 z"/>
      <circle cx="0" cy="0" r="0.2" fill="#888"/>
      <g transform="translate(-3 0)">
        <path id="beta-alpha" fill="blue" d="M -0.3 0.3 H 0.3 V -3.3 H -0.3 z"/>
      </g>
      <circle cx="-3" cy="0" r="0.2" fill="#888"/>
    </g>
  </g>
</svg>
