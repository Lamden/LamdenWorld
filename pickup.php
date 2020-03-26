<?
require('lite.php');
$x = $request->get('x');
$y = $request->get('y');
$amount = $request->get('amount');
$tile = $sql->get("SELECT numTroops, troopOwner FROM tiles WHERE x = $x AND y = $y");
if ($amount < $tile['numTroops']) {
	$sql->q("UPDATE tiles SET numTroops = numTroops - $amount WHERE x = $x AND y = $y");
} else {
	$sql->q("UPDATE tiles SET numTroops = 0, troopOwner = '' WHERE x = $x AND y = $y");
}
if ($sql->s("SELECT COUNT(*) FROM resources WHERE owner = '{$tile['troopOwner']}' AND resource = 4")) {
	$sql->q("UPDATE resources SET amount = amount + $amount WHERE owner = '{$tile['troopOwner']}' AND resource = 4");
} else {
	$sql->q("INSERT INTO resources(owner, resource, amount) VALUES ('{$tile['troopOwner']}', 4, $amount)");
}

$sql->q("INSERT INTO log (type, x, y, var1) VALUES('pickup', $x, $y, $amount)");
?>