<?
require('lite.php');
$x = $request->get('x');
$y = $request->get('y');
$amount = $request->get('amount');
$tile = $sql->get("SELECT fort, owner FROM tiles WHERE x = $x AND y = $y");
$cost = array(0 => $amount);
if (!deductCost($tile['owner'], $cost)) {
	die('{"error": "Not enough resources"}');
}

if ($amount < $tile['fort']) {
	$sql->q("UPDATE tiles SET fort = fort - $amount WHERE x = $x AND y = $y");
} else {
	$amount = clamp($amount, 0, $tile['fort']);
	$sql->q("UPDATE tiles SET fort = 0, owner = '' WHERE x = $x AND y = $y");
}
if ($sql->s("SELECT COUNT(*) FROM resources WHERE owner = '{$tile['owner']}' AND resource = 5")) {
	$sql->q("UPDATE resources SET amount = amount + $amount WHERE owner = '{$tile['owner']}' AND resource = 5");
} else {
	$sql->q("INSERT INTO resources(owner, resource, amount) VALUES ('{$tile['owner']}', 5, $amount)");
}

$sql->q("INSERT INTO log (type, x, y, var2) VALUES('pickup', $x, $y, $amount)");
?>