<?php
$css[] = 'css/switch.css';
$css[] = $demodir . '/chaotic.css';
$scripts[] = 'shared.js';
$scripts[] = 'demo-helpers.js';
$scripts[] = $demodir . '/chaotic.js';
$files[] = $demodir . '/pendulum.svg';

if($en) {
  $desc = 'A simple mechanical system in which a small difference between initial conditions can create completely different trajectories.';
  $try = 'Tips for trying:';
  $tips = [
    'Use mouse or touch to define the initial conditions of the two pendulums and click Play to evolve them side by side.',
    'If the two conditions were almost equal, the evolution may look indistinguishable for a few seconds.',
    'The most interesting are those cases in which the centre of mass is just above the pivot. Attention, initial momenta are zeroed when manipulating.'
  ];
} else {
  $desc = 'Jednoduchý mechanický systém, ve kterém malý rozdíl počátečních podmínek může vyústit ve zcela odlišné trajektorie.';
  $try = 'Zkuste si:';
  $tips = [
    'Myší nebo dotykem nastavit levé a pravé kyvadlo do co nejpodobnějšího stavu a spustit časový vývoj.',
    'Jestli se vám povedlo získat téměř stejnou počáteční podmínku, vývoj může po několik sekund vypadat k nerozeznání.',
    'Nejzajímavější jsou případy, kdy kyvadlo začíná s těžištěm nad středním bodem úchytu. Pozor, počáteční rychlosti se při každé změně vynulují.'
  ];
}

$list = [];
foreach($tips as $tip) {
  $list[] = '<li>' . $tip . '</li>';
}
$tips = join(PHP_EOL, $list);

print <<<HTML
<p>$desc</p>
<div class="switch" id="controls">
  <input type="radio" name="controls" id="play" checked/>
  <label for="play"><img class="inline-img" src="$demodir/play.svg" alt="Play"/></label>
  <input type="radio" name="controls" id="pause"/>
  <label for="pause"><img class="inline-img" src="$demodir/pause.svg" alt="Pause"/></label>
</div>
<div class="row" id="c">
  <!-- SVG elements dynamically created here -->
  <br id="graphBreak"/>
  <canvas id="graph"></canvas>
</div>
<h2>$try</h2>
<ul>
  $tips
</ul>
HTML;
?>
