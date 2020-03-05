<?
require('lite.php');
$x = $request->get('x');
$y = $request->get('y');
$num = $request->get('amount');
$sql->q("UPDATE tiles SET trainAmount = $num, lastHarvest = UNIX_TIMESTAMP(), collected = 0 WHERE x = $x AND y = $y");
echo sql2json($sql->q("SELECT * FROM tiles WHERE x = $x AND y = $y"));
?>