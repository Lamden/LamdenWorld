<?
require('lite.php');
$x = $request->get('x');
$y = $request->get('y');
$x2 = $request->get('x2');
$y2 = $request->get('y2');
$attacker = $sql->get("SELECT numTroops, troopOwner FROM tiles WHERE x = $x AND y = $y");
$defender = $sql->get("SELECT * FROM tiles WHERE x = $x2 AND y = $y2");
$battle = false;
$siege = false;
if ($defender) { // existing tile
	// battle
	if ($defender['numTroops'] && $defender['troopOwner'] != $attacker['troopOwner']) {
		$battle = true;
		if ($defender['numTroops'] > $attacker['numTroops']) { // defender stronger
			$defender['numTroops'] -= $attacker['numTroops'];
			$attacker['numTroops'] = 0;
		} else { // attacker stronger
			$attacker['numTroops'] -= $defender['numTroops'];
			$defender['numTroops'] = 0;
		}
		$sql->q("UPDATE tiles SET numTroops = {$attacker['numTroops']}" . ($attacker['numTroops'] == 0 ? ", troopOwner = ''" : '') . " WHERE x = $x AND y = $y");
		$sql->q("UPDATE tiles SET numTroops = {$defender['numTroops']}" . ($defender['numTroops'] == 0 ? ", troopOwner = ''" : '') . " WHERE x = $x2 AND y = $y2");
		$sql->q("INSERT INTO log (type, x, y, x2, y2, var1, var2) VALUES ('attack', $x, $y, $x2, $y2, {$attacker['numTroops']}, {$defender['numTroops']})");
	}

	// fort
	if ($defender['fort'] && $defender['owner'] != $attacker['troopOwner']) {
		$battle = true;
		$siege = true;
		if (2000 > $attacker['numTroops']) { // defender stronger
			//$attack = $attacker['numTroops'];
			$attacker['numTroops'] -= $attacker['numTroops'] > 2000 ? 2000 : $attacker['numTroops'];
			$defender['hp'] -= $attacker['numTroops'];
		} else { // attacker stronger
			$attacker['numTroops'] -= 2000;
			$defender['fort'] = 0;
		}
	}
	// building
	if ($defender['hp'] && $defender['owner'] != $attacker['troopOwner']) {
		$battle = true;
		$siege = true;
		if ($defender['hp'] > $attacker['numTroops']) { // defender stronger
			$attacker['numTroops'] -= $attacker['numTroops'] > 100 ? 100 : $attacker['numTroops'];
			$defender['hp'] -= $attacker['numTroops'];
		} else { // attacker stronger
			$attacker['numTroops'] -= 100;
			$defender['hp'] = 0;
		}
	}
	if ($siege) {
		$sql->q("UPDATE tiles SET numTroops = {$attacker['numTroops']}" . ($attacker['numTroops'] == 0 ? ", troopOwner = ''" : '') . " WHERE x = $x AND y = $y");
		$sql->q("UPDATE tiles SET hp = {$defender['hp']}" . ($defender['hp'] == 0 ? ", building = 0, level = 1, owner = ''" : '') . ", fort = {$defender['fort']} WHERE x = $x2 AND y = $y2");
		$sql->q("INSERT INTO log (type, x, y, x2, y2, var1, var2, var3) VALUES ('siege', $x, $y, $x2, $y2,{$attacker['numTroops']}, {$defender['hp']}, {$defender['fort']})");
	}
	if (!$battle) { // move to existing tile
		$sql->q("UPDATE tiles SET numTroops = 0, troopOwner = '' WHERE x = $x AND y = $y");
		// merge
		if ($defender['numTroops'] && $defender['troopOwner'] == $attacker['troopOwner']) {
			$sql->q("UPDATE tiles SET numTroops = numTroops + {$attacker['numTroops']} WHERE x = $x2 AND y = $y2");
			$sql->q("INSERT INTO log (type, x, y, x2, y2) VALUES ('move', $x, $y, $x2, $y2)");
		} else { // move
			$sql->q("UPDATE tiles SET numTroops = {$attacker['numTroops']}, troopOwner = '{$attacker['troopOwner']}' WHERE x = $x2 AND y = $y2");
			$sql->q("INSERT INTO log (type, x, y, x2, y2) VALUES ('move', $x, $y, $x2, $y2)");
		}
	}
} else {
	// move to new tile
	$sql->q("UPDATE tiles SET numTroops = 0, troopOwner = '' WHERE x = $x AND y = $y");
	$sql->q("INSERT INTO tiles (x, y, numTroops, troopOwner) VALUES ($x2, $y2, {$attacker['numTroops']}, '{$attacker['troopOwner']}')");
	$sql->q("INSERT INTO log (type, x, y, x2, y2) VALUES ('move', $x, $y, $x2, $y2)");
}
echo '[';
echo sql2json($sql->q("SELECT * FROM tiles WHERE x = $x AND y = $y"));
echo ',';
echo sql2json($sql->q("SELECT * FROM tiles WHERE x = $x2 AND y = $y2"));
echo ']';
?>