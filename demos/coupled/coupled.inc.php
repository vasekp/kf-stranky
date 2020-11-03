<?php
$css[] = 'css/switch.css';
$css[] = $demodir . '/coupled.css';
$scripts[] = 'shared.js';
$scripts[] = 'demo-helpers.js';
$scripts[] = $demodir . '/coupled.js';

if($en) {
  $desc = 'A weak spring between two simple gravity pendula causes a slight detuning in their proper frequencies, resulting in interference of two oscillatory motions of close but different speeds. In the difference frequency one can observe periodic energy interchange between the two pendula. A part of energy is also carried by the spring itself. In this demo you can try various mass ratios and the spring constants, as well as dragging the bobs directly.';
  $notice = 'Notice these effects:';
  $ntips = [
    'Apart from the difference frequency, also note what happens at the <em>sum</em> of the frequencies.',
    'Total energy is conserved in this system, but using any controllers one effectively gives the Hamiltonian an explicit time dependency and as such can pump or deplete energy from the system. Also hitting the top plane is intentionally inelastic.',
    'No linearization has been employed, so at higher deflections considerable distortion of the harmonics can be appreciated.'
  ];
  $try = 'Tips for trying:';
  $tips = [
    'Reducing the amplitudes to a level at which a small-angle approximation is appropriate. (The y-scale of the graph will adapt.)',
    'Making the two pendula swing in phase or antiphase.',
    'Stopping the pendula and then moving one of them very slowly (<em>adiabatically</em>) or abruptly (<em>diabatically</em>). Can you do so without causing the other one to oscillate?',
    'What conditions (mass ratio and spring constant) are the most favourable for perfect energy transfer from one pendulum to the other?'
  ];
} else {
  $desc = 'Slabá pružina přidaná mezi dvě matematická kyvadla mírně posune frekvence jejich vlastních kmitů, takže dojde ke složení pohybu dvou blízkých, ale různých frekvencí. Na rozdílové frekvenci můžeme pozorovat rázy, kdy si kyvadla vzájemně periodicky předávají energii. Část energie nese v každý okamžik také pružina sama. V této ukázce si můžete vybrat poměr hmotností obou závaží a sílu pružiny či přímo ovládat polohu kyvadel.';
  $notice = 'Všimněte si:';
  $ntips = [
    'Všimněte si kromě rázů na rozdílové frekvenci také jevů na <em>součtu</em> frekvencí.',
    'Celková energie se v systému obecně zachovává, ale pokud používáme některá táhla, dodáváme Hamiltoniánu časovou závislost, takže můžeme způsobit zvýšení nebo snížení celkové energie. Také náraz do horní stěny je záměrně mírně neelastický.',
    'Není použita linearizace systému, takže při větších výchylkách vidíme již výrazné zkreslení oproti harmonickým průběhům.',
  ];
  $try = 'Zkuste si:';
  $tips = [
    'Zmenšit výchylky tak, aby bylo oprávněné přiblížení malých kmitů. (Měřítko grafu se přizpůsobí.)',
    'Nastavit obě kyvadla tak, aby kmitala ve fázi či protifázi.',
    'Kyvadla co nejlépe zastavit a pak jedno z nich vychylovat velice pomalu (<em>adiabaticky</em>) nebo naopak skokově (<em>diabaticky</em>). Podaří se vám, aby se u toho druhé kyvadlo nerozkmitalo?',
    'Jaké nastavení poměru hmotností a tuhosti je nejpříznivější k tomu, aby si kyvadla periodicky předávala co největší energii?'
  ];
}

$list = [];
foreach($tips as $tip) {
  $list[] = '<li>' . $tip . '</li>';
}
$tips = join(PHP_EOL, $list);

$list = [];
foreach($ntips as $tip) {
  $list[] = '<li>' . $tip . '</li>';
}
$nlist = join(PHP_EOL, $list);

print <<<HTML
<p>$desc</p>
<div id="content">
  <div id="strengths">
    <div id="triangle" class="container"></div>
  </div>
  <div id="arena-container" class="container">
    <svg id="arena" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="-65 -5 130 40">
      <defs>
        <pattern id="hatch" patternUnits="userSpaceOnUse" patternTransform="translate(1,0)" width="6" height="6">
          <path d="M 0 3 l 3 3 M 3 0 l 3 3" stroke="#666" stroke-width="0.5" stroke-linecap="square"/>
        </pattern>
      </defs>
      <g transform="scale(1 -1)" stroke="black">
        <rect x="-50" y="0" width="100" height="5" stroke="none" fill="url(#hatch)"/>
        <path d="M -50 0 h 100" stroke-width="1"/>
        <g transform="scale(30)">
          <g id="spring" transform="matrix(2 0 0 1 -1 -1)">
            <path
              d="M 0,0 h 10 c 4,0 4,8 8,0 q 4,-8 8,0 4,8 8,0 4,-8 8,0 4,8 8,0 4,-8 8,0 4,8 8,0 4,-8 8,0 4,8 8,0 c 4,-8 4,0 8,0 h 10"
              stroke-width="3" stroke="#8D8" fill="none" vector-effect="non-scaling-stroke" transform="scale(0.01)"/>
          </g>
          <g transform="translate(-1 0)" stroke-width=".025" fill="#F88">
            <g id="mass1" transform="rotate(10)">
              <path d="M 0 0 L 0 -1"/>
              <circle cx="0" cy="-1" r=".1"/>
            </g>
          </g>
          <g transform="translate(1 0)" stroke-width=".025" fill="#88F">
            <g id="mass2" transform="rotate(-20)">
              <path d="M 0 0 L 0 -1"/>
              <circle cx="0" cy="-1" r=".1"/>
            </g>
          </g>
        </g>
      </g>
    </svg>
  </div>
  <div id="graph-container" class="container">
    <canvas id="graph"></canvas>
  </div>
</div>
<h2>$notice</h2>
<ul>
  $nlist
</ul>
<h2>$try</h2>
<ul>
  $tips
</ul>
HTML;
?>
