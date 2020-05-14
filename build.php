<?
require('lite.php');
$owner = $request->get('owner', 72);
$id = $request->get('id');
$x = $request->get('x');
$y = $request->get('y');
$cost = $request->get('cost', 'array');
$tile = $sql->get("SELECT * FROM tiles WHERE x= $x AND y = $y");
if ($tile['building'] && !in_array($tile['building'], array(3,4,5))) {
	die('{"error": "Tile already occupied"}');
}
if (!deductCost($owner, $cost)) {
	die('{"error": "Not enough resources"}');
}
$hp = 550 + ($id == 15 ? 1000 : 0);
$hp += round(($tile['level'] - 1) * $hp / 3);
if (hasResearched($owner, 18)) {
	$hp *= 2;
}
$sql->q("UPDATE tiles SET owner = '$owner', building = $id, hp = $hp, lastHarvest = UNIX_TIMESTAMP() WHERE x = $x AND y = $y");
$sql->q("INSERT INTO log (type, x, y, var1, var2, var3) VALUES('build', $x, $y, '$owner', $id, UNIX_TIMESTAMP() + 30)");
echo sql2json($sql->q("SELECT * FROM tiles WHERE x = $x AND y = $y"));
?>