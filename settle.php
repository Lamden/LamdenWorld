<?
require('lite.php');
$owner = $request->get('owner', 64);
if (!$owner) {
	die('{"error": "No wallet found. "}');
}
$name = $request->get('name', 64);
if (!$name) {
	die('{"error": "No name entered. "}');
}
$x = $request->get('x');
$y = $request->get('y');
$player = $sql->s("SELECT COUNT(*) FROM players AS p
	JOIN tiles AS t ON p.x = t.x AND p.y = t.y AND t.building = 1 AND t.owner = '$owner'
	WHERE address = '$owner' ");
if ($player) {
	die('{"error": "Player already settled. "}');
}
$tile = $sql->get("SELECT * FROM tiles WHERE x = $x AND y = $y");
if ($tile['owner']) {
	die('{"error": "Tile already taken"}');
}
$sql->q("REPLACE INTO players (address, name, x, y) VALUES ('$owner', '$name', $x, $y)");
if ($sql->s("SELECT COUNT(*) FROM tiles WHERE x = $x AND y = $y")) {
	$sql->q("UPDATE tiles SET owner = '$owner', building = 1, hp = 2000, lastHarvest = UNIX_TIMESTAMP() WHERE x = $x AND y = $y");
} else {
	$sql->q("INSERT INTO tiles (type, x, y, owner, building, hp, lastHarvest) VALUES (192, $x, $y, '$owner', 1, 2000, UNIX_TIMESTAMP())");
}
$sql->q("REPLACE INTO resources (owner, resource, amount, lastHarvest) VALUES('$owner', 0, 200000, UNIX_TIMESTAMP())");
$sql->q("REPLACE INTO resources (owner, resource, amount, lastHarvest) VALUES('$owner', 1, 10000, UNIX_TIMESTAMP())");
$sql->q("REPLACE INTO resources (owner, resource, amount, lastHarvest) VALUES('$owner', 2, 10000, UNIX_TIMESTAMP())");
$sql->q("REPLACE INTO resources (owner, resource, amount, lastHarvest) VALUES('$owner', 3, 10000, UNIX_TIMESTAMP())");
$sql->q("REPLACE INTO resources (owner, resource, amount, lastHarvest) VALUES('$owner', 4, 10000, UNIX_TIMESTAMP())");
$sql->q("REPLACE INTO resources (owner, resource, amount, lastHarvest) VALUES('$owner', 5, 10000, UNIX_TIMESTAMP())");
//$sql->q("INSERT INTO log (type, x, y, var1) VALUES('colonize', $x, $y, '$owner')");
$sql->q("INSERT INTO log (type, x, y, var1, var2, var3) VALUES('build', $x, $y, '$owner', 1, UNIX_TIMESTAMP())");
echo sql2json($sql->q("SELECT * FROM tiles WHERE x = $x AND y = $y"));
?>