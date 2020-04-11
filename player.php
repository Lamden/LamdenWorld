<?
require('lite.php');
$owner = $request->get('owner', 64);
$player = $sql->get("SELECT p.address, p.name, p.session, p.x, p.y
	FROM players AS p
	JOIN tiles AS t ON p.x = t.x AND p.y = t.y AND t.building = 1
	WHERE p.address = '$owner'");
if (!$player) {
	echo '{}';
	die();
}
echo '{';
//echo '"capital": ';
//echo sql2json($sql->q("SELECT name, x, y FROM players WHERE address = '$owner'"));
echo '"address": "' . $player['address'] . '",';
echo '"name": "' . $player['name'] . '",';
echo '"session": "' . $player['session'] . '",';
echo '"x": ' . $player['x'] . ',';
echo '"y": ' . $player['y'] . ',';
echo '"troops": ';
$owner = $owner . '-' . $player['session'];
$troops = $sql->s("SELECT SUM(numTroops) FROM tiles WHERE troopOwner = '$owner'");
echo $troops ? $troops : 0;
echo ', "resources": ';
echo sql2jsonKV($sql->q("SELECT resource, amount FROM resources WHERE owner = '$owner'"));
echo ', "lastHarvest": ';
echo sql2jsonKV($sql->q("SELECT resource, lastHarvest FROM resources WHERE owner = '$owner'"));
echo ',  "research": ';
echo sql2jsonKV($sql->q("SELECT id, stamp FROM research WHERE owner = '$owner'"));
echo '}';
if (!$troops) {
	$troops = 0;
}
$sql->q("UPDATE players SET troops = $troops WHERE address = '$owner'");
?>