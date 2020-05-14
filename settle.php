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
	JOIN tiles AS t ON p.x = t.x AND p.y = t.y AND t.owner = '$owner'
	WHERE address = '$owner' ");
if ($player) {
	die('{"error": "Player already settled. "}');
}
$tile = $sql->get("SELECT * FROM tiles WHERE x = $x AND y = $y");
if ($tile['owner']) {
	die('{"error": "Tile already taken"}');
}
$session = rand(1,9999);
$sql->q("REPLACE INTO players (address, session, name, x, y) VALUES ('$owner', $session, '$name', $x, $y)");
//$owner = $owner . '-' . $session;
if ($sql->s("SELECT COUNT(*) FROM tiles WHERE x = $x AND y = $y")) {
	$sql->q("UPDATE tiles SET owner = '$owner', building = 7, hp = 1000, lastHarvest = UNIX_TIMESTAMP() WHERE x = $x AND y = $y");
} else {
	$sql->q("INSERT INTO tiles (type, x, y, owner, building, hp, lastHarvest) VALUES (192, $x, $y, '$owner', 7, 10000, UNIX_TIMESTAMP())");
}
$sql->q("REPLACE INTO resources (owner, resource, amount, lastHarvest) VALUES('$owner', 0, 2000, UNIX_TIMESTAMP())");
$sql->q("REPLACE INTO resources (owner, resource, amount, lastHarvest) VALUES('$owner', 1, 2000, UNIX_TIMESTAMP())");
$sql->q("REPLACE INTO resources (owner, resource, amount, lastHarvest) VALUES('$owner', 2, 2000, UNIX_TIMESTAMP())");
$sql->q("REPLACE INTO resources (owner, resource, amount, lastHarvest) VALUES('$owner', 3, 2000, UNIX_TIMESTAMP())");
$sql->q("REPLACE INTO resources (owner, resource, amount, lastHarvest) VALUES('$owner', 4, 700, UNIX_TIMESTAMP())");
$sql->q("REPLACE INTO resources (owner, resource, amount, lastHarvest) VALUES('$owner', 5, 1400, UNIX_TIMESTAMP())");
//$sql->q("INSERT INTO log (type, x, y, var1) VALUES('colonize', $x, $y, '$owner')");
$sql->q("INSERT INTO log (type, x, y, var1, var2, var3) VALUES('build', $x, $y, '$owner', 7, UNIX_TIMESTAMP())");
echo '{"session": ' . $session . ', "x": ' . $x . ', "y": ' . $y . '}';
?>