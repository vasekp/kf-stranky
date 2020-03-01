<?php
if($early) {
  array_push($css, 'demos/ylm/ylm.css');
  array_push($css, 'css/switch.css');
  array_push($scripts, 'switch.js');
  array_push($scripts, 'demos/helpers.js');
  array_push($scripts, 'demos/ylm/ylm.js');
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
