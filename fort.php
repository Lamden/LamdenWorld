<?
require('lite.php');
$x = $request->get('x');
$y = $request->get('y');
$amount = $request->get('amount');
$tile = $sql->get("SELECT * FROM tiles WHERE x = $x AND y = $y");
if ($tile['fort'] + $amount > 550) {
	die('{"error": "Cannot place additional fortifications"}');
}
$cost = array(0 => $amount, 5 => $amount);
$owner = $tile['owner'] ? $tile['owner'] : $tile['troopOwner'] ;
if (!$owner) {
	die('{"error": "You do not own this tile"}');
}
if (!deductCost($owner, $cost)) {
	die('{"error": "Not enough resources"}');
}

$hp = 0;
if ($tile['building']) {
	$hp = 550;
}
$repair = 0;
if ($tile['hp'] < $hp) {
	$diff = $hp - $tile['hp'];
	if ($diff > $amount * 5) {
		$tile['hp'] += $amount * 5;
		$repair = $amount * 5;
	} else {
		$tile['hp'] = $hp;
		$amount -= round($diff / 5);
		$repair = $diff;
	}
}

$sql->q("UPDATE tiles SET hp = {$tile['hp']}, fort = fort + $amount, owner = IF(troopOwner != '',troopOwner, owner) WHERE x = $x AND y = $y");
$fort = $sql->s("SELECT fort FROM tiles WHERE x = $x AND y = $y");
$sql->q("INSERT INTO log (type, x, y, var1, var2) VALUES('fortify', $x, $y, $amount, $repair)");
echo sql2json($sql->q("SELECT * FROM tiles WHERE x = $x AND y = $y"));
?>