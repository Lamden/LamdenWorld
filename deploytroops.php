<?
require('lite.php');
$x = $request->get('x');
$y = $request->get('y');
//$num = $sql->s("SELECT trainAmount FROM tiles WHERE x = $x AND y = $y");
$num = $request->get('num');
$owner = $request->get('owner', 72);
if ($num == 0 || $num < 0) {
	die('{"error": "No troops deployed"}');
}
//$sql->q("UPDATE tiles SET numTroops = numTroops + $num, troopOwner = owner, trainAmount = 0, collected = 1 WHERE x = $x AND y = $y");
$cost = array(0 => $num, 4 => $num);
$tile = $sql->get("SELECT * FROM tiles WHERE x = $x AND y = $y");
if ($tile['troopOwner'] && $tile['troopOwner'] != $owner) {
	die('{"error": "You do not own this tile"}');
}
if (!$tile['type']) {
	$neighbors = adjacentTiles($x, $y);
	$previousType = $sql->s("SELECT type FROM tiles WHERE (" . implode(' OR ', array_map($tiles2sql, adjacentTiles($x, $y))) . ")
		AND (owner = '$owner' OR troopOwner = '$owner') LIMIT 1");
	if (!$previousType) {
		echo $x . ' ' . $y;
		die();
	}
	echo $previousType;
	$type = clamp((int)$previousType + (rand(0,1) == 0 ? -5 : 5), 1, 255);
	if ($type <= 80) { // water
		$sql->q("INSERT INTO tiles (type, x, y) VALUES ($type, $x, $y)");
	} else {
		if (!deductCost($owner, $cost)) {
			die('{"error": "Not enough resources"}');
		}
		$sql->q("INSERT INTO tiles (type, x, y, numTroops, troopOwner) VALUES ($type, $x, $y, $num, '$owner')");
	}
	$sql->q("INSERT INTO log (type, x, y, var1, var2, var3) VALUES ('train', $x, $y, '$owner', $num, $type)");
	echo 'discovered';
} else if ($tile['type'] > 80) {
	if (!deductCost($owner, $cost)) {
		die('{"error": "Not enough resources"}');
	}
	$sql->q("UPDATE tiles SET numTroops = numTroops + $num, troopOwner = '$owner' WHERE x = $x AND y = $y");
	$sql->q("INSERT INTO log (type, x, y, var1, var2) VALUES ('train', $x, $y, '$owner', $num)");
	echo 'added';
} else {
	echo 'water';
}
//echo sql2json($sql->q("SELECT * FROM tiles WHERE x = $x AND y = $y"));
?>