<?
require('lite.php');
$x = $request->get('x');
$y = $request->get('y');
$x2 = $request->get('x2');
$y2 = $request->get('y2');
$power = $request->get('power');
$attacker = $sql->get("SELECT * FROM tiles WHERE x = $x AND y = $y");
$defender = $sql->get("SELECT * FROM tiles WHERE x = $x2 AND y = $y2");
$power *= hasResearched($attacker['owner'], 14) ? 1.2 : 1;
if (!$defender) {
	$defender = array(
		'hp' => 0,
		'fort' => 0,
		'numTroops' => 0,
	);
}
$cost = $request->get('cost', 'array');
if (!deductCost($attacker['owner'], $cost)) {
	die('{"error": "Not enough resources"}');
}
$sql->q("UPDATE tiles SET lastHarvest = UNIX_TIMESTAMP() WHERE x = $x AND y = $y");
if (hasResearched($defender['owner'], 15) && rand(0, 99) < 15) {
	$power = 0;
	$sql->q("INSERT INTO log (type, x, y, x2, y2, var1, var2, var3) VALUES ('missile', $x, $y, $x2, $y2, {$defender['numTroops']}, {$defender['hp']}, {$defender['fort']})");
	die('{"error": "Missile missed due to radar obfuscation!"}');
}

// army
if ($defender['numTroops']) {
	if ($defender['numTroops'] > $power) { // defender stronger
		$defender['numTroops'] -= $power;
		$power = 0;
	} else { // attacker stronger
		$power -= $defender['numTroops'];
		$defender['numTroops'] = 0;
	}
	$sql->q("UPDATE tiles SET numTroops = {$defender['numTroops']}" . ($defender['numTroops'] == 0 ? ", troopOwner = ''" : '') . " WHERE x = $x2 AND y = $y2");
}

// fort
if ($defender['fort']) {
	if ($defender['fort'] > $power) { // defender stronger
		$defender['fort'] -= $power;
		$power = 0;
	} else { // attacker stronger
		$power -= $defender['fort'];
		$defender['fort'] = 0;
	}
}
// building
if ($defender['hp']) {
	if ($defender['hp'] > $power) { // defender stronger
		$defender['hp'] -= $power;
		$power = 0;
	} else { // attacker stronger
		$power -= $defender['hp'];
		$defender['hp'] = 0;
	}
}
if ($defender) {
	$sql->q("UPDATE tiles SET hp = {$defender['hp']}" . ($defender['hp'] == 0 ? ", building = 0, level = 1, owner = ''" : '') . ", fort = {$defender['fort']} WHERE x = $x2 AND y = $y2");
}
$sql->q("INSERT INTO log (type, x, y, x2, y2, var1, var2, var3) VALUES ('missile', $x, $y, $x2, $y2, {$defender['numTroops']}, {$defender['hp']}, {$defender['fort']})");
echo '[]';
?>