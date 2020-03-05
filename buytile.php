<?
require('lite.php');
$owner = $request->get('owner', 64);
$x = $request->get('x');
$y = $request->get('y');
$tile = $sql->get("SELECT * FROM tiles WHERe x = $x AND y = $y");
if ($tile['owner']) {
	die('{"error": "Tile already taken"}');
}
deductCost($owner, array(1 => 100));
if ($sql->s("SELECT COUNT(*) FROM tiles WHERE x = $x AND y = $y")) {
	$sql->q("UPDATE tiles SET owner = '$owner', lastHarvest = UNIX_TIMESTAMP() WHERE x = $x AND y = $y");
} else {
	$sql->q("INSERT INTO tiles (x, y, owner, lastHarvest) VALUES ($x, $y, '$owner', UNIX_TIMESTAMP())");
}
$sql->q("INSERT INTO log (type, x, y, var1) VALUES('colonize', $x, $y, '$owner')");
echo sql2json($sql->q("SELECT * FROM tiles WHERE x = $x AND y = $y"));
?>