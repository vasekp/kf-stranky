<?php
$text = $en
  ? "Could not connect to the database. Website out of order."
  : "Nepodařilo se připojit k databázi. Stránky mimo provoz.";
?>
<div class="error"><?php echo $text; ?></div>
