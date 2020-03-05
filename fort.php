<?
require('lite.php');
$x = $request->get('x');
$y = $request->get('y');
$sql->q("UPDATE tiles SET fort = 2000 WHERE x = $x AND y = $y");
echo sql2json($sql->q("SELECT * FROM tiles WHERE x = $x AND y = $y"));
?>