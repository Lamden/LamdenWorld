<?
require('lite.php');
$x = $request->get('x');
$y = $request->get('y');
$cost = $request->get('cost', 'array');
$tile = $sql->get("SELECT owner FROM tiles WHERE x= $x AND y = $y");
if (!deductCost($tile['owner'], $cost)) {
	die('{"error": "Not enough resources"}');
}
$sql->q("UPDATE tiles SET level = level + 1 WHERE x = $x AND y = $y");
echo sql2json($sql->q("SELECT * FROM tiles WHERE x = $x AND y = $y"));
?>