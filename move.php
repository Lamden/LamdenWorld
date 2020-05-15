<?
require('lite.php');
$x = $request->get('x');
$y = $request->get('y');
$x2 = $request->get('x2');
$y2 = $request->get('y2');
$units = $request->get('units');
$fort = $request->get('fort');
$cost = $request->get('cost', 'array');

$attacker = $sql->get("SELECT * FROM tiles WHERE x = $x AND y = $y");
$defender = $sql->get("SELECT * FROM tiles WHERE x = $x2 AND y = $y2");
$owner = $attacker['troopOwner'] ? $attacker['troopOwner'] : $attacker['owner'];
$battle = false;
$siege = false;

// check if attacker capital alive
/* if (!$sql->s("SELECT COUNT(*) FROM players AS p
	JOIN tiles AS t ON p.x = t.x AND p.y = t.y AND t.building = 1 AND t.owner = CONCAT(p.address, '-', p.session)
	WHERE p.address = SUBSTR('{$attacker['troopOwner']}', 1, 64)")) {
	die('{"error": "You\'re defeated, resettle first. "}');
} */

$ownDestination = ($defender['owner'] && $defender['owner'] == $owner) || ($defender['troopOwner'] && $defender['troopOwner'] == $owner);
$emptyDestination = $defender && !$defender['troopOwner'] && !$defender['owner'];
$destinationHostile = ($defender['owner'] && $defender['owner'] != $owner) || ($defender['troopOwner'] && $defender['troopOwner'] != $owner);

if (!$attacker['troopOwner'] && !$attacker['owner']) {
	die('{"error": "Sync error, please refresh the page"}');
}
if ($units + $defender['numTroops'] > 250 && $ownDestination) {
	die('{"error": "Attack units do not fit on target tile"}');
}
if ($fort + $defender['fort'] > 550 && $ownDestination) {
	die('{"error": "Def units do fit on target tile"}');
}
if (!deductCost($owner, $cost)) {
	die('{"error": "Not enough resources"}');
}
if ($x == $x2 && $y == $y2) {
	die('{"error": "Same tile"}');
}

// new split/merge/move
$moveAllUnits = $units == $attacker['numTroops'];
$moveAllFort = $fort == $attacker['fort'];
if (!$defender || $emptyDestination || $ownDestination) {
		$sql->q("UPDATE tiles SET numTroops = numTroops - $units, fort = fort - $fort WHERE x = $x AND y = $y");
		if ($moveAllUnits) {
			$sql->q("UPDATE tiles SET troopOwner = '' WHERE x = $x AND y = $y");
		}
		if ($moveAllFort && !$attacker['building']) {
			$sql->q("UPDATE tiles SET owner = '' WHERE x = $x AND y = $y");
		}
		if (!$defender) { // move to unexplored tile
			$type = clamp((int)$attacker['type'] + (rand(0,1) == 0 ? -5 : 5), 0, 255);
			$sql->q("INSERT INTO tiles (type, x, y) VALUES ($type, $x2, $y2)");
		}
		if ($units) {
			$sql->q("UPDATE tiles SET numTroops = numTroops + $units, troopOwner = '$owner' WHERE x = $x2 AND y = $y2");
		}
		if ($fort) {
			$sql->q("UPDATE tiles SET fort = fort + $fort, owner = '$owner' WHERE x = $x2 AND y = $y2");
		}
		if (!$defender) {
			$sql->q("INSERT INTO log (type, x, y, x2, y2, var1, var2, var3) VALUES ('move', $x, $y, $x2, $y2, $units, $fort, $type)");
		} else {
			$sql->q("INSERT INTO log (type, x, y, x2, y2, var1, var2) VALUES ('move', $x, $y, $x2, $y2, $units, $fort)");
		}
		echo '[]';
		die();
}

// split units
/*
if ($units > 0 && $units < $attacker['numTroops'] && (!$defender['owner'] || $defender['owner'] == $attacker['troopOwner']) && (!$defender['troopOwner'] || $defender['troopOwner'] == $attacker['troopOwner'])) {
	// merge
	// if ($defender['numTroops'] && $defender['troopOwner'] == $attacker['troopOwner']) {
	if ($defender && ($defender['owner'] == $owner || $defender['troopOwner'] == $owner)) {
		$sql->q("UPDATE tiles SET numTroops = numTroops - $units WHERE x = $x AND y = $y");
		$sql->q("UPDATE tiles SET numTroops = numTroops + $units WHERE x = $x2 AND y = $y2");
		$sql->q("INSERT INTO log (type, x, y, x2, y2, var1) VALUES ('move', $x, $y, $x2, $y2, $units)");
	} else if ($defender && !$defender['numTroops']) { // move to discovered tile
		$sql->q("UPDATE tiles SET numTroops = numTroops - $units WHERE x = $x AND y = $y");
		$sql->q("UPDATE tiles SET numTroops = $units, troopOwner = '{$attacker['troopOwner']}' WHERE x = $x2 AND y = $y2");
		$sql->q("INSERT INTO log (type, x, y, x2, y2, var1) VALUES ('move', $x, $y, $x2, $y2, $units)");
	} else if (!$defender) { // move to unexplored tile
		$type = clamp((int)$attacker['type'] + (rand(0,1) == 0 ? -5 : 5), 0, 255);
		if ($type <= 80) { // water
			$sql->q("INSERT INTO tiles (type, x, y) VALUES ($type, $x2, $y2)");
		} else {
			$sql->q("UPDATE tiles SET numTroops = numTroops - $units WHERE x = $x AND y = $y");
			$sql->q("INSERT INTO tiles (x, y, type, numTroops, troopOwner) VALUES ($x2, $y2, $type, {$units}, '{$attacker['troopOwner']}')");
//			die('{"error": "Tile not discovered"}');
		}
		$sql->q("INSERT INTO log (type, x, y, x2, y2, var1, var2) VALUES ('move', $x, $y, $x2, $y2, $units, $type)");
	}
	echo '[]';
	die();
}*/

if ($defender && $destinationHostile) { // existing tile
	$fortAbsorb = 0;
	// fort
	if ($defender['fort'] || $attacker['fort']) {
echo 'd fort';
		$battle = true;
		$siege = true;
		// reculcalate power
		$aPower = $attacker['numTroops'];
		$dFortAbsorb = $defender['fort'];
		$defender['fort'] = clamp($defender['fort'] - ($aPower), 0, $defender['fort']);
	}

	// battle
	if ($defender['numTroops'] && $attacker['numTroops'] - $dFortAbsorb > 0) {
echo 'd battle';
		$battle = true;
		$aPower = clamp($attacker['numTroops'] - $dFortAbsorb, 0, $attacker['numTroops']);
		$dFortAbsorb += $defender['numTroops'];
		$defender['numTroops'] = clamp($defender['numTroops'] - $aPower, 0, $defender['numTroops']);
		$sql->q("UPDATE tiles SET numTroops = {$defender['numTroops']}" . ($defender['numTroops'] == 0 ? ", troopOwner = ''" : '') . " WHERE x = $x2 AND y = $y2");
		$sql->q("INSERT INTO log (type, x, y, x2, y2, var1, var2) VALUES ('attack', $x, $y, $x2, $y2, {$attacker['numTroops']}, {$defender['numTroops']})");
	}

	// building
	if ($defender['owner']) {
		$battle = true;
		$siege = true;
	}
var_dump($defender['hp'] , $attacker['numTroops'], $dFortAbsorb);
	if ($defender['hp'] && $attacker['numTroops'] - $dFortAbsorb > 0) {
echo 'd building';
		$aPower = clamp($attacker['numTroops'] - $dFortAbsorb, 0, $attacker['numTroops']);
		$defender['hp'] = clamp($defender['hp'] - $aPower, 0, $defender['hp']);
	}

	if ($siege) {
		//$sql->q("UPDATE tiles SET numTroops = {$attacker['numTroops']}" . ($attacker['numTroops'] == 0 ? ", troopOwner = ''" : '') . " WHERE x = $x AND y = $y");
		$sql->q("UPDATE tiles SET hp = {$defender['hp']}" . ($defender['hp'] == 0 ? ", building = 0, level = 1, owner = ''" : '') . ", fort = {$defender['fort']} WHERE x = $x2 AND y = $y2");
		$sql->q("INSERT INTO log (type, x, y, x2, y2, var1, var2, var3) VALUES ('siege', $x, $y, $x2, $y2,{$attacker['numTroops']}, {$defender['hp']}, {$defender['fort']})");
	}
	// retaliation
	$siege = false;
var_dump($defender['numTroops'] , $attacker['fort']);
	if ($defender['numTroops'] && $attacker['fort']) {
echo 'a fort';
		$siege = true;
		$aFortAbsorb = $attacker['fort'];
		$dPower = $defender['numTroops'];
echo $dPower;
		$attacker['fort'] = clamp($attacker['fort'] - $dPower, 0, $attacker['fort']);
	}
	// battle
	if ($defender['numTroops'] && $attacker['numTroops']) {
echo 'a battle';
		$battle = true;
		$dPower = clamp($defender['numTroops'] - $aFortAbsorb, 0, $defender['numTroops']);
		$aFortAbsorb += $attacker['numTroops'];
echo $dPower;
		$attacker['numTroops'] = clamp($attacker['numTroops'] - $dPower, 0, $attacker['numTroops']);
		$sql->q("UPDATE tiles SET numTroops = {$attacker['numTroops']}" . ($attacker['numTroops'] == 0 ? ", troopOwner = ''" : '') . " WHERE x = $x AND y = $y");
		$sql->q("INSERT INTO log (type, x, y, x2, y2, var1, var2) VALUES ('attack', $x, $y, $x2, $y2, {$attacker['numTroops']}, {$defender['numTroops']})");
	}
	if ($attacker['hp'] && $defender['numTroops'] - $aFortAbsorb > 0) {
echo 'a building';
		$siege = true;
		$dPower = clamp($defender['numTroops'] - $aFortAbsorb, 0, $defender['numTroops']);
		$attacker['hp'] = clamp($attacker['hp'] - $dPower, 0, $attacker['hp']);
	}
	if ($siege) {
		$sql->q("UPDATE tiles SET hp = {$attacker['hp']}" . ($attacker['hp'] == 0 ? ", building = 0, level = 1, owner = ''" : '') . ", fort = {$attacker['fort']} WHERE x = $x AND y = $y");
		$sql->q("INSERT INTO log (type, x, y, x2, y2, var1, var2, var3) VALUES ('siege', $x2, $y2, $x, $y,{$defender['numTroops']}, {$attacker['hp']}, {$attacker['fort']})");
	}

}
echo '[';
echo sql2json($sql->q("SELECT * FROM tiles WHERE x = $x AND y = $y"));
echo ',';
echo sql2json($sql->q("SELECT * FROM tiles WHERE x = $x2 AND y = $y2"));
echo ']';
?>