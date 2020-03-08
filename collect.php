<?
require('lite.php');
$x = $request->get('x');
$y = $request->get('y');
$id = $request->get('id');
$tile = $sql->get("SELECT * FROM tiles WHERE x = $x AND y = $y");
if ($tile['collected'] || !$tile['trainAmount']) {
	die('{"error": "Already collected or not refining anything. "}');
}
if (hasResearched($tile['owner'], 13)) {
	$tile['trainAmount'] *= 1.1;
}
if (hasResearched($tile['owner'], 17)) {
	$tile['trainAmount'] *= 1.25;
}
if ($sql->s("SELECT COUNT(*) FROM resources WHERE owner = '{$tile['owner']}' AND resource = $id")) {
	$sql->q("UPDATE resources SET amount = amount + {$tile['trainAmount']} WHERE owner = '{$tile['owner']}' AND resource = $id");
} else {
	$sql->q("INSERT INTO resources(owner, resource, amount) VALUES ('{$tile['owner']}', $id, {$tile['trainAmount']})");
}

$sql->q("UPDATE tiles SET lastHarvest = UNIX_TIMESTAMP(), trainAmount = 0, collected = 1 WHERE x = $x AND y = $y");
echo sql2json($sql->q("SELECT * FROM tiles WHERE x = $x AND y = $y"));
?>