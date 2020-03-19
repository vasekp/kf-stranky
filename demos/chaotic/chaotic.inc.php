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

if($en) {
  $desc = 'A simple mechanical system in which a small difference between initial conditions can create completely different trajectories.';
  $try = 'Tips for trying:';
  $tips = array(
    'Use mouse or touch to define the initial conditions of the two pendulums and click Play to evolve them side by side.',
    'If the two conditions were almost equal, the evolution may look indistinguishable for a few seconds.',
    'The most interesting are those cases in which the centre of mass is just above the pivot. Attention, initial momenta are zeroed when manipulating.'
  );
} else {
  $desc = 'Jednoduchý mechanický systém, ve kterém malý rozdíl počátečních podmínek může vyústit ve zcela odlišné trajektorie.';
  $try = 'Zkuste si:';
  $tips = array(
    'Myší nebo dotykem nastavit levé a pravé kyvadlo do co nejpodobnějšího stavu a spustit časový vývoj.',
    'Jestli se vám povedlo získat téměř stejnou počáteční podmínku, vývoj může po několik sekund vypadat k nerozeznání.',
    'Nejzajímavější jsou případy, kdy kyvadlo začíná s těžištěm nad středním bodem úchytu. Pozor, počáteční rychlosti se při každé změně vynulují.'
  );
}

print <<<HTML
        <h1>$demotitle</h1>
        $desc
        <div class="switch" id="controls">
          <a href="#" id="play"><img class="inline-img" src="$demodir/play.svg" alt="Play"/></a>
          <a href="#" id="pause"><img class="inline-img" src="$demodir/pause.svg" alt="Pause"/></a>
        </div>
        <div class="row" id="c">
          <!-- SVG elements dynamically created here -->
          <br id="graphBreak"/>
          <canvas id="graph"></canvas>
        </div>
        <h2>$try</h2>\n
HTML;

echo '<ul>' . PHP_EOL;
foreach($tips as $tip)
  echo '<li>' . $tip . '</li>' . PHP_EOL;
echo '</ul>' . PHP_EOL;
?>
