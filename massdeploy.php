<?
require('lite.php');
$tiles = $request->get('tiles','array');
$owner = $request->get('owner', 72);
$total = 0;
foreach ($tiles as $key => $num) {
	$c = explode(',', $key);
	$c[0] = (int)$c[0];
	$c[1] = (int)$c[1];
	$total += $num;
}
$cost = array(0 => $total, 4 => $total);
foreach ($tiles as $key => $num) {
	$c = explode(',', $key);
	$x = (int)$c[0];
	$y = (int)$c[1];
	$type = $sql->s("SELECT type FROM tiles WHERE x = $x AND y = $y");
	if (!$type) {
		$neighbors = adjacentTiles($x, $y);
		$previousType = $sql->s("SELECT type FROM tiles WHERE (" . implode(' OR ', array_map($tiles2sql, adjacentTiles($x, $y))) . ")
			AND (owner = '$owner' OR troopOwner = '$owner') LIMIT 1");
		if (!$previousType) {
			//die('{"error": "error with discovery"}');
			$previousType = 192;
		}
		$type = clamp((int)$previousType + (rand(0,1) == 0 ? -5 : 5), 0, 255);
		if ($type <= 80) { // water
			$sql->q("INSERT INTO tiles (type, x, y) VALUES ($type, $x, $y)");
		} else {
			if (!deductCost($owner, array(0 => $num, 4 => $num))) {
				die('{"error": "Not enough resources"}');
			}
			$sql->q("INSERT INTO tiles (type, x, y, numTroops, troopOwner) VALUES ($type, $x, $y, $num, '$owner')");
		}
		$sql->q("INSERT INTO log (type, x, y, var1, var2, var3) VALUES ('train', $x, $y, '$owner', $num, $type)");
	} else if ($type > 80) {
		if (!deductCost($owner, array(0 => $num, 4 => $num))) {
			die('{"error": "Not enough resources"}');
		}

		$sql->q("UPDATE tiles SET numTroops = numTroops + $num, troopOwner = '$owner' WHERE x = $x AND y = $y");
		$sql->q("INSERT INTO log (type, x, y, var1, var2) VALUES ('train', $x, $y, '$owner', $num)");
	}
}
echo '[]';
?>