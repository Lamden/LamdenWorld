<?
require('lite.php');
$owner = $request->get('owner', 64);
$x = $request->get('x');
$y = $request->get('y');
$id = $request->get('id');
$convertID = $request->get('convertID');
$amount = $request->get('amount');
$have = $sql->s("SELECT amount FROM resources WHERE owner = '$owner' AND resource = $id");
if ($have < $amount) {
	echo '{"error": "Not enough resource id ' . $id . ', have ' . $have . '"}';
	die();
}
$sql->q("UPDATE resources SET amount = amount - $amount WHERE owner = '$owner' AND resource = $id");
$sql->q("UPDATE tiles SET lastHarvest = UNIX_TIMESTAMP(), trainAmount = $amount, convertID = $convertID, collected = 0 WHERE x = $x AND y = $y");
echo sql2json($sql->q("SELECT * FROM tiles WHERE x = $x AND y = $y"));
?>