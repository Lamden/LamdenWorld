<?
require('lite.php');
$x = $request->get('x');
$y = $request->get('y');
$amount = $request->get('amount');
$tile = $sql->get("SELECT * FROM tiles WHERE x = $x AND y = $y");

$hp = 1000 + ($tile['building'] == 15 ? 1000 : 0);
if ($tile['building'] == 1) {
	$hp = 10000;
}
$hp += round(($tile['level'] - 1) * $hp / 3);
$repair = 0;
if ($tile['hp'] < $hp) {
	$diff = $hp - $tile['hp'];
	if ($diff > $amount * 2) {
		$tile['hp'] += $amount * 2;
		$repair = $amount * 2;
	} else {
		$tile['hp'] = $hp;
		$amount -= round($diff / 2);
		$repair = $diff;
	}
}

$sql->q("UPDATE tiles SET hp = {$tile['hp']}, fort = fort + $amount WHERE x = $x AND y = $y");
$fort = $sql->s("SELECT fort FROM tiles WHERE x = $x AND y = $y");
$sql->q("INSERT INTO log (type, x, y, var1, var2) VALUES('fortify', $x, $y, $amount, $repair)");
echo sql2json($sql->q("SELECT * FROM tiles WHERE x = $x AND y = $y"));
?>