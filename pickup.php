<?
require('lite.php');
$x = $request->get('x');
$y = $request->get('y');
$units = $request->get('units');
$fort = $request->get('fort');
$tile = $sql->get("SELECT * FROM tiles WHERE x = $x AND y = $y");
$cost = array(0 => $units + $fort);
$owner = $tile['troopOwner'] ? $tile['troopOwner'] : $tile['owner'];
if (!deductCost($owner, $cost)) {
	die('{"error": "Not enough resources"}');
}
$units = clamp($units, 0, $tile['numTroops']);
$fort = clamp($fort, 0, $tile['fort']);

if ($units < $tile['numTroops']) {
	$sql->q("UPDATE tiles SET numTroops = numTroops - $units WHERE x = $x AND y = $y");
} else {
	$sql->q("UPDATE tiles SET numTroops = 0, troopOwner = '' WHERE x = $x AND y = $y");
}
if ($fort < $tile['fort'] || $tile['building']) {
	$sql->q("UPDATE tiles SET fort = fort - $fort WHERE x = $x AND y = $y");
} else {
	$sql->q("UPDATE tiles SET fort = 0, owner = '' WHERE x = $x AND y = $y");
}
if ($sql->s("SELECT COUNT(*) FROM resources WHERE owner = '$owner' AND resource = 4")) {
	$sql->q("UPDATE resources SET amount = amount + $units WHERE owner = '$owner' AND resource = 4");
} else {
	$sql->q("INSERT INTO resources(owner, resource, amount) VALUES ('$owner', 4, $units)");
}
if ($sql->s("SELECT COUNT(*) FROM resources WHERE owner = '$owner' AND resource = 5")) {
	$sql->q("UPDATE resources SET amount = amount + $fort WHERE owner = '$owner' AND resource = 5");
} else {
	$sql->q("INSERT INTO resources(owner, resource, amount) VALUES ('$owner', 5, $fort)");
}

$sql->q("INSERT INTO log (type, x, y, var1, var2) VALUES('pickup', $x, $y, $units, $fort)");
?>