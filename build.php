<?
require('lite.php');
$id = $request->get('id');
$x = $request->get('x');
$y = $request->get('y');
$cost = $request->get('cost', 'array');
$tile = $sql->get("SELECT * FROM tiles WHERE x= $x AND y = $y");
if ($tile['building'] && !in_array($tile['building'], array(3,4,5))) {
	die('{"error": "Tile already occupied"}');
}
if (!deductCost($tile['owner'], $cost)) {
	die('{"error": "Not enough resources"}');
}
$hp = 1000;
if ($id == 15) { // bunker
	$hp = 5000;
}
if (hasResearched(18)) {
	$hp *= 2;
}
$sql->q("UPDATE tiles SET building = $id, hp = $hp, lastHarvest = UNIX_TIMESTAMP() WHERE x = $x AND y = $y");
$sql->q("INSERT INTO log (type, x, y, var1, var2) VALUES('build', $x, $y, $id, UNIX_TIMESTAMP() + 30)");
echo sql2json($sql->q("SELECT * FROM tiles WHERE x = $x AND y = $y"));
?>