<?php
$css[] = 'css/switch.css';
$css[] = $demodir . '/evan.css';
$scripts[] = 'demo-helpers.js';
$scripts[] = 'switch.js';
$scripts[] = $demodir . '/evan.js';
$files[] = $demodir . '/prepare.vert';
$files[] = $demodir . '/prep-above.frag';
$files[] = $demodir . '/prep-below.frag';
$files[] = $demodir . '/draw.vert';
$files[] = $demodir . '/draw.frag';

if($en) {
  $desc = 'Evanescent waves';
  $type = 'Initial state';
  $types = ['vacuum' => 'Vacuum', 'fock' => '1 photon', 'cat' => '"Cat" state'];
  $reset = 'Reset';
  $plotType = 'Plot';
  $plotTypes = ['prob' => 'Density', 'wave' => 'Wave function'];
  $try = 'Tips for trying:';
  $tips = [
  ];
} else {
  $desc = 'Evanescentní vlny';
  $type = 'Výchozí stav';
  $types = ['vacuum' => 'Vakuum', 'fock' => '1 foton', 'cat' => '"Cat" stav'];
  $reset = 'Reset';
  $plotType = 'Vykreslit';
  $plotTypes = ['prob' => 'Hustota', 'wave' => 'Vlnová funkce'];
  $try = 'Zkuste si:';
  $tips = [
  ];
}

$list = [];
foreach($tips as $tip)
  $list[] = '<li>' . $tip . '</li>';
$tips = join(PHP_EOL, $list);

$list = [];
$count = 0;
foreach($types as $id => $name)
  $list[] = '<a href="#" id="' . $id . '" data-func="' . $count++ . '">' . $name . '</a>';
$types = join(PHP_EOL, $list);

$list = [];
$count = 0;
foreach($plotTypes as $id => $name)
  $list[] = '<a href="#" id="' . $id . '">' . $name . '</a>';
$plotTypes = join(PHP_EOL, $list);

print <<<HTML
<h1>$demotitle</h1>
<p>$desc</p>
<div id="container">
  <canvas id="canvas"></canvas>
  <svg id="coords"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      version="1.1" viewBox="-5 -5 10 10">
    <defs>
      <path id="arrow-path" d="M -1 -1 L 1 0 L -1 1 z"/>
      <rect id="box-path" x="-.15" y="-.15" width=".3" height=".3"/>
      <marker class="filled c1" id="c1-me" viewbox="-1 -1 2 2" markerUnits="userSpaceOnUse"
          markerWidth=".2" markerHeight=".2" orient="auto">
        <use xlink:href="#arrow-path"/>
      </marker>
      <marker class="filled c1" id="c1-ms" viewbox="-1 -1 2 2" markerUnits="userSpaceOnUse"
          markerWidth=".2" markerHeight=".2" orient="auto">
        <use xlink:href="#arrow-path" transform="scale(-1, 1)"/>
      </marker>
      <marker class="stroked c1" id="c1-mm" viewbox="-.2 -.2 .4 .4" markerUnits="userSpaceOnUse"
          markerWidth=".4" markerHeight=".4" orient="auto">
        <use xlink:href="#box-path"/>
      </marker>
      <marker class="filled c2" id="c2-me" viewbox="-1 -1 2 2" markerUnits="userSpaceOnUse"
          markerWidth=".2" markerHeight=".2" orient="auto">
        <use xlink:href="#arrow-path"/>
      </marker>
      <marker class="filled c2" id="c2-ms" viewbox="-1 -1 2 2" markerUnits="userSpaceOnUse"
          markerWidth=".2" markerHeight=".2" orient="auto">
        <use xlink:href="#arrow-path" transform="scale(-1, 1)"/>
      </marker>
      <marker class="stroked c2" id="c2-mm" viewbox="-.2 -.2 .4 .4" markerUnits="userSpaceOnUse"
          markerWidth=".4" markerHeight=".4" orient="auto">
        <use xlink:href="#box-path"/>
      </marker>
      <marker class="filled c3" id="c3-me" viewbox="-1 -1 2 2" markerUnits="userSpaceOnUse"
          markerWidth=".2" markerHeight=".2" orient="auto">
        <use xlink:href="#arrow-path"/>
      </marker>
      <marker class="filled c3" id="c3-ms" viewbox="-1 -1 2 2" markerUnits="userSpaceOnUse"
          markerWidth=".2" markerHeight=".2" orient="auto">
        <use xlink:href="#arrow-path" transform="scale(-1, 1)"/>
      </marker>
      <marker class="stroked c3" id="c3-mm" viewbox="-.2 -.2 .4 .4" markerUnits="userSpaceOnUse"
          markerWidth=".4" markerHeight=".4" orient="auto">
        <use xlink:href="#box-path"/>
      </marker>
      <g id="axis">
        <path d="M 0 0 L 7.1 0" stroke-width=".03" stroke="black" stroke-dasharray=".1 .1"/>
        <path d="M 0 0 L 7.1 0" stroke-width=".03" stroke="white" stroke-dasharray=".1 .1" stroke-dashoffset=".1"/>
      </g>
    </defs>
    <g transform="scale(1, -1)">
      <g id="incident" transform="rotate(-135)">
        <use xlink:href="#axis"/>
        <path d="M 4.4 -.8 Q 4.5 -.4 4.5 0 Q 4.5 .4 4.4 .8" class="stroked c1" marker-start="url(#c1-ms)" marker-end="url(#c1-me)" marker-mid="url(#c1-mm)"/>
        <path id="width" d="M 3 -1.5 V -1 V 1 v .5" class="stroked c2" marker-start="url(#c2-ms)" marker-end="url(#c2-me)" marker-mid="url(#c2-mm)"/>
        <path id="wavelength" d="M 1 0 h .5 h .5" class="stroked c3" marker-start="url(#c3-ms)" marker-end="url(#c3-me)" marker-mid="url(#c3-mm)"/>
      </g>
      <use id="reflected" xlink:href="#axis" transform="rotate(-45)"/>
      <use id="refracted" xlink:href="#axis" transform="rotate(45)"/>
    </g>
  </svg>
</div>
<h2>$try</h2>
<ul>
  $tips
</ul>
HTML;
?>
