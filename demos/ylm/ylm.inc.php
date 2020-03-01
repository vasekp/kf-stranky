<?php
if($early) {
  array_push($css, $demodir . '/ylm.css');
  array_push($css, 'css/switch.css');
  array_push($scripts, 'switch.js');
  array_push($scripts, 'demo-helpers.js');
  array_push($scripts, $demodir . '/ylm.js');
  array_push($files, $demodir . '/background.vert');
  array_push($files, $demodir . '/background.frag');
  array_push($files, $demodir . '/sphere.vert');
  array_push($files, $demodir . '/sphere.frag');
  array_push($files, $demodir . '/arrow.vert');
  array_push($files, $demodir . '/arrow.frag');
  return;
}
?>
        <table>
          <tr>
            <td>Projection:</td>
            <td>
              <div class="inline switch" id="model">
                <a href="#" data-model="1">Sphere</a>
                <a href="#" data-model="2">Traditional</a>
              </div>
            </td>
          </tr>
          <tr>
            <td>Function type:</td>
            <td>
              <div class="inline switch" id="family">
                <a href="#" data-family="ylm">Spherical</a>
                <a href="#" data-family="ri">(l,m) ± (l,-m)</a>
                <a href="#" data-family="cart">Cartesian</a>
                <a href="#" data-family="random">Random</a>
              </div>
            </td>
          </tr>
        </table>
        <button id="random" class="button">New</button>
        <canvas id="canvas"></canvas>
