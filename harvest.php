<?
require('lite.php');
$owner = $request->get('owner', 64);
$id = $request->get('id');
$x = $request->get('x');
$y = $request->get('y');
$amount = $request->get('amount');
if ($sql->s("SELECT COUNT(*) FROM resources WHERE owner = '$owner' AND resource = $id")) {
	$sql->q("UPDATE resources SET amount = amount + $amount WHERE owner = '$owner' AND resource = $id");
} else {
	$sql->q("INSERT INTO resources(owner, resource, amount) VALUES ('$owner', $id, $amount)");
}
$sql->q("UPDATE tiles SET lastHarvest = UNIX_TIMESTAMP() WHERE x = $x AND y = $y");
echo sql2json($sql->q("SELECT * FROM tiles WHERE x = $x AND y = $y"));
?>