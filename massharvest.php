<?
require('lite.php');
$owner = $request->get('owner', 72);
$id = $request->get('id');
$amount = $request->get('amount');
$cost = null;
if ($id == 4) {
	$cost = array(1 => $amount * 20, 2 => $amount * 10, 3 => $amount * 30);
}
if ($id == 5) {
	$cost = array(1 => $amount * 10, 2 => $amount * 15, 3 => $amount * 5);
}
if ($cost && !deductCost($owner, $cost)) {
	die('{"error": "Not enough resources to harvest"}');
}
if ($sql->s("SELECT COUNT(*) FROM resources WHERE owner = '$owner' AND resource = $id")) {
	$sql->q("UPDATE resources SET amount = amount + $amount, lastHarvest = UNIX_TIMESTAMP() WHERE owner = '$owner' AND resource = $id");
} else {
	$sql->q("INSERT INTO resources(owner, resource, amount, lastHarvest) VALUES ('$owner', $id, $amount, UNIX_TIMESTAMP())");
}
//$sql->q("UPDATE tiles SET lastHarvest = UNIX_TIMESTAMP() WHERE x = $x AND y = $y");
//echo sql2json($sql->q("SELECT * FROM tiles WHERE x = $x AND y = $y"));
echo '[]';
?>