<?
die(); // disabled
require('lite.php');
$x = $request->get('x');
$y = $request->get('y');
$cost = $request->get('cost', 'array');
$tile = $sql->get("SELECT building,owner,level FROM tiles WHERE x= $x AND y = $y");
if (!deductCost($tile['owner'], $cost)) {
	die('{"error": "Not enough resources"}');
}
$hp = 1000;
if ($tile['building'] == 15 || $tile['building'] == 2) { // bunker/wall
	$hp = 2000;
}
if ($tile['building'] == 1) {
	$hp = 10000;
}
$hp += round(($tile['level']) * $hp / 3);
$sql->q("UPDATE tiles SET level = level + 1, hp = $hp WHERE x = $x AND y = $y");
echo sql2json($sql->q("SELECT * FROM tiles WHERE x = $x AND y = $y"));
?>