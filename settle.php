<?
require('lite.php');
$owner = $request->get('owner', 64);
$x = $request->get('x');
$y = $request->get('y');
$player = $sql->s("SELECT COUNT(*) FROM players WHERE address = '$owner'");
if ($player) {
	die('{"error": "Player already settled. "}');
}
$tile = $sql->get("SELECT * FROM tiles WHERE x = $x AND y = $y");
if ($tile['owner']) {
	die('{"error": "Tile already taken"}');
}
$sql->q("INSERT INTO players (address, name, x, y) VALUES ('$owner', '$owner', $x, $y)");
if ($sql->s("SELECT COUNT(*) FROM tiles WHERE x = $x AND y = $y")) {
	$sql->q("UPDATE tiles SET owner = '$owner', building = 1, lastHarvest = UNIX_TIMESTAMP() WHERE x = $x AND y = $y");
} else {
	$sql->q("INSERT INTO tiles (x, y, owner, building, hp, lastHarvest) VALUES ($x, $y, '$owner', 1, 1000, UNIX_TIMESTAMP())");
}
$sql->q("INSERT INTO resources (owner, resource, amount) VALUES('$owner', 0, 200000)");
$sql->q("INSERT INTO resources (owner, resource, amount) VALUES('$owner', 1, 10000)");
$sql->q("INSERT INTO resources (owner, resource, amount) VALUES('$owner', 2, 10000)");
$sql->q("INSERT INTO resources (owner, resource, amount) VALUES('$owner', 3, 10000)");
$sql->q("INSERT INTO resources (owner, resource, amount) VALUES('$owner', 4, 1000)");
$sql->q("INSERT INTO log (type, x, y, var1) VALUES('colonize', $x, $y, '$owner')");
$sql->q("INSERT INTO log (type, x, y, var1) VALUES('build', $x, $y, 1)");
echo sql2json($sql->q("SELECT * FROM tiles WHERE x = $x AND y = $y"));
?>