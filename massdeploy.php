<?
require('lite.php');
$tiles = $request->get('tiles','array');
$total = 0;
foreach ($tiles as $key => $num) {
	$c = explode(',', $key);
	$c[0] = (int)$c[0];
	$c[1] = (int)$c[1];
	$total += $num;
}
$owner = $sql->s("SELECT IF(troopOwner != '',troopOwner, owner) FROM tiles WHERE x = $c[0] AND y = $c[1]");
$cost = array(0 => $total, 4 => $total);
if (!deductCost($owner, $cost)) {
	die('{"error": "Not enough resources"}');
}
foreach ($tiles as $key => $num) {
	$c = explode(',', $key);
	$c[0] = (int)$c[0];
	$c[1] = (int)$c[1];
	$sql->q("UPDATE tiles SET numTroops = numTroops + $num, troopOwner = IF(troopOwner != '',troopOwner, owner) WHERE x = $c[0] AND y = $c[1]");
	$sql->q("INSERT INTO log (type, x, y, var1) VALUES ('train', $c[0], $c[1], $num)");
}
?>