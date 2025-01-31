<?php
$css[] = 'css/switch.css';
$css[] = $demodir . '/hole.css';
$scripts[] = 'shared.js';
$scripts[] = 'demo-helpers.js';
$scripts[] = $demodir . '/hole.js';
$files[] = $demodir . '/sim.vert';
$files[] = $demodir . '/sim.frag';

if($en) {
  $desc = <<<END
The black hole is represented by the Schwartzschild solution to Einstein's field equations.
You are an observer moving in its vicinity.
Not only your motion but also the perception of the surrounding universe is deformed by the black hole's gravity.
Red- and blue-tinted areas in the image represent red and blue shift. In those places, time flows slower or faster than for the observer, respectively.
END;
  $angle = 'Viewing angle';
  $speed = 'Simulation speed';
  $try = 'Tips for trying:';
  $tips = [
    'Try finding initial distance and velocity for which the orbit forms a circle, an ellipse, or just passes by.',
    'What do you see when crossing the event horizon (gray area), when approaching the singularity?',
    'How do things change if an observer at the event horizon tries to hover or escape?',
    'Try zooming in on one of the Einstein rings and see the gravitational lensing in motion.',
    'Your observer can also spin. Can you keep looking in the direction of the black hole during your orbit?',
  ];
} else {
  $desc = <<<END
Černá díra je představovaná Schwartzschildovým řešením Einsteinovy rovnice pro deformaci časoprostoru.
Zde představujete pozorovatele, který se pohybuje v jejím okolí.
Nejen váš pohyb, ale i pohled na okolní vesmír je zkreslen gravitačním polem černé díry.
Červené a modré podbarvení ilustrují červený a modrý posuv. V místech, která pozorujete, plyne čas pomaleji, resp. rychleji než vám.
END;
  $angle = 'Pozorovací úhel';
  $speed = 'Rychlost času';
  $try = 'Zkuste si:';
  $tips = [
    'Zkuste najít počáteční polohu a rychlost, kdy kolem centra obíháte po kružnici, po elipse, nebo jen prolétáte.',
    'Co vidíte po průletu pod horizont událostí (šedá oblast), co těsně před pádem do singularity?',
    'Jaký udělá rozdíl, snaží-li se pozorovatel na horizontu událostí zastavit nebo letět pryč?',
    'Zkuste zazoomovat na jeden z Einsteinových prstenců a vidět jej v pohybu..',
    'Svému pozorovateli můžete udělit i rotaci. Podaří se vám, abyste při obíhání díry stále hleděli do ní?',
  ];
}

$list = [];
foreach($tips as $tip)
  $list[] = '<li>' . $tip . '</li>';
$tips = join(PHP_EOL, $list);

print <<<HTML
<p>$desc</p>
<img hidden id="px.png" src="$demodir/px.png"/>
<img hidden id="nx.png" src="$demodir/nx.png"/>
<img hidden id="py.png" src="$demodir/py.png"/>
<img hidden id="ny.png" src="$demodir/ny.png"/>
<img hidden id="pz.png" src="$demodir/pz.png"/>
<img hidden id="nz.png" src="$demodir/nz.png"/>
<div id="container">
  <canvas id="canvas"></canvas>
</div>
<div id="geometry"></div>
<div id="settings">
  <div>$angle:</div>
  <div><input type="range" min="1" max="45" value="30" step="any" id="angle"/></div>
  <div>$speed:</div>
  <div><input type="range" min="0" max="3" value="1" step="any" id="speed"/></div>
</div>
<h2>$try</h2>
<ul>
  $tips
</ul>
HTML;
?>
