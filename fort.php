<?
require('lite.php');
$x = $request->get('x');
$y = $request->get('y');
$hp = 2000;
$tile = $sql->get("SELECT owner FROM tiles WHERE x = $x AND y = $y");
if (hasResearched($tile['owner'], 10)) {
	$hp *= 1.5;
}
$sql->q("UPDATE tiles SET fort = $hp WHERE x = $x AND y = $y");
echo sql2json($sql->q("SELECT * FROM tiles WHERE x = $x AND y = $y"));
?>