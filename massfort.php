<?
require('lite.php');
$tiles = $request->get('tiles','array');
$total = 0;
foreach ($tiles as $key => $num) {
	$c = explode(',', $key);
	$c[0] = (int)$c[0];
	$c[1] = (int)$c[1];
	$total += $num;
}
$owner = $request->get('owner', 72);
$cost = array(0 => $total, 5 => $total);
if (!deductCost($owner, $cost)) {
	die('{"error": "Not enough resources"}');
}
foreach ($tiles as $key => $num) {
	$c = explode(',', $key);
	$c[0] = (int)$c[0];
	$c[1] = (int)$c[1];
	$tile = $sql->get("SELECT * FROM tiles WHERE x = $c[0] AND y = $c[1]");

	$hp = 0 + ($tile['building'] ? 1000 : 0) + ($tile['building'] == 15 ? 1000 : 0);
	if ($tile['building'] == 1) {
		$hp = 10000;
	}
	$hp += round(($tile['level'] - 1) * $hp / 3);
	$repair = 0;
	if ($tile['hp'] < $hp) {
		$diff = $hp - $tile['hp'];
		if ($diff > $num * 2) {
			$tile['hp'] += $num * 2;
			$repair = $num * 2;
			$num = 0;
		} else {
			$tile['hp'] = $hp;
			$num -= round($diff / 2);
			$repair = $diff;
		}
	}

	$sql->q("UPDATE tiles SET hp = {$tile['hp']}, fort = fort + $num, owner = '$owner' WHERE x = $c[0] AND y = $c[1]");
	$fort = $sql->s("SELECT fort FROM tiles WHERE x = $c[0] AND y = $c[1]");
	$sql->q("INSERT INTO log (type, x, y, var1, var2) VALUES ('fortify', $c[0], $c[1], $num, $repair)");
}
echo '[]';
?>