<?
require('lite.php');
$owner = $request->get('owner', 64);
$player = $sql->get("SELECT name, x, y FROM players WHERE address = '$owner'");
if (!$player) {
	echo '{}';
	die();
}
echo '{';
//echo '"capital": ';
//echo sql2json($sql->q("SELECT name, x, y FROM players WHERE address = '$owner'"));
echo '"name": "' . $player['name'] . '",';
echo '"x": ' . $player['x'] . ',';
echo '"y": ' . $player['y'] . ',';
echo '"troops": ';
$troops = $sql->s("SELECT SUM(numTroops) FROM tiles WHERE troopOwner = '$owner'");
echo $troops ? $troops : 0;
echo ', "resources": ';
echo sql2jsonKV($sql->q("SELECT resource, amount FROM resources WHERE owner = '$owner'"));
echo ',  "research": ';
echo sql2jsonKV($sql->q("SELECT id, stamp FROM research WHERE owner = '$owner'"));
echo '}';
?>