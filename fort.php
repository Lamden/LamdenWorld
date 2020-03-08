<?
require('lite.php');
$x = $request->get('x');
$y = $request->get('y');
$hp = 2000;
if (hasResearched(10)) {
	$hp *= 1.5;
}
$sql->q("UPDATE tiles SET fort = $hp WHERE x = $x AND y = $y");
echo sql2json($sql->q("SELECT * FROM tiles WHERE x = $x AND y = $y"));
?>