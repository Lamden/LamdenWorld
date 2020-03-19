<?
require('lite.php');
$x = $request->get('x');
$y = $request->get('y');
$tile = $sql->get("SELECT * FROM tiles WHERE x= $x AND y = $y");
$sql->q("UPDATE tiles SET building = 0, hp = 0, level = 1 WHERE x = $x AND y = $y");
$sql->q("INSERT INTO log (type, x, y, var1) VALUES('delete', $x, $y, 'building')");
echo sql2json($sql->q("SELECT * FROM tiles WHERE x = $x AND y = $y"));
?>