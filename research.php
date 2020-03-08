<?
require('lite.php');
$owner = $request->get('owner', 64);
$id = $request->get('id');
$cost = $request->get('cost', 'array');
if (!deductCost($owner, $cost)) {
	die('{"error": "Not enough resources"}');
}
$sql->q("INSERT INTO research (owner, id, stamp) VALUES ('$owner', $id, UNIX_TIMESTAMP())");
?>