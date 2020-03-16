        <h1>Kvantová fyzika <span class="smaller">(02KFA)</span></h1>
        <div class="strikeout">
          <p>Přednášky budou probíhat v <b>pondělí</b> ve dvou dvouhodinových blocích
          <b>15:30 – 17:10</b> a <b>17:30 – 19:10</b> v místnosti <b>B10</b>.
          Čas přestávky se může dle aktuální potřeby mírně přizpůsobit.</p>
          <p>Cvičení (vedoucí <a href="https://physics.fjfi.cvut.cz/cb-profile/jexmicha" target="_blank">RNDr. Ing. Michal Jex, Ph.D.</a>) budou od stejného týdne ve <b>čtvrtky</b> od <b>9:30</b> v místnosti <b>B11</b>.</p>
          <p>Konzultační hodiny ideálně ve <b>středu</b> od <b>13:30</b> – komu se trvale nehodí, dle individuální domluvy.</p>
        </div>
        <p>Literatura k přednášce: J. Blank, P. Exner, M. Havlíček –
        <i><a href="https://www.databazeknih.cz/knihy/linearni-operatory-v-kvantove-fyzice-199159"
        target="_blank">Lineární operátory v kvantové fyzice</a></i> (Karolinum, Praha, 1993).</p>
        <h2>Aktuality</h2>
        <p>V souladu s požadavkem rektora a vedoucího katedry bude výuka po dobu přerušení studia v důsledku epidemické krize probíhat formou <b>sdílení poznámek k samostudiu</b>. Materiály budou k nalezení na této stránce.</p>
        <h2>Ke stažení</h2>
        <table>
          <thead>
            <td>Datum</td>
            <td>Soubor</td>
            <td>Popis</td>
          </thead>
<?php
$sql = 'select filename, description, timestamp from download';
$result = $db->query($sql);
while($row = $result->fetch_assoc()) {
  print_indent(5, '<tr>');
  print_indent(6, '<td>' . date('j. n. Y', strtotime($row['timestamp'])) . '</td>');
  print_indent(6, '<td><a href="download/' . $row['filename'] . '">' . $row['filename'] . '</a></td>');
  print_indent(6, '<td>' . $row['description'] . '</td>');
  print_indent(5, '</tr>');
}
?>
        </table>
        <div class="buttons">
          <a class="button" href="<?php echo query('', array('s' => 'notes')); ?>">Zápis z hodin</a>
          <a class="button" href="https://physics.fjfi.cvut.cz/studium/predmety/292-02kfa" target="_blank">Stránky cvičení</a>
        </div>
<?php
$modtime = filemtime(__FILE__);
?>
