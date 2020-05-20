<?
require('lite.php');
$owner = $request->get('owner', 64);
$player = $sql->get("SELECT p.address, p.name, p.session, t.x, t.y
	FROM players AS p
	JOIN tiles AS t ON p.address = t.owner
	WHERE p.address = '$owner' LIMIT 1");
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
//$owner = $owner . '-' . $player['session'];
$tiles = $sql->s("SELECT COUNT(*) FROM tiles WHERE owner = '$owner' OR troopOwner = '$owner'");
$troops = $sql->s("SELECT SUM(numTroops) FROM tiles WHERE troopOwner = '$owner'");
$fort  = $sql->s("SELECT SUM(fort) FROM tiles WHERE owner = '$owner'");
echo '"troops": ' . ($troops ? $troops : 0) . ', ';
echo '"fort": ' . ($fort ? $fort : 0) . ', ';
echo '"tiles": ' . ($tiles ? $tiles : 0);
echo ', "resources": ';
echo sql2jsonKV($sql->q("SELECT resource, amount FROM resources WHERE owner = '$owner'"));
echo ', "lastHarvest": ';
echo sql2jsonKV($sql->q("SELECT resource, lastHarvest FROM resources WHERE owner = '$owner'"));
echo ',  "research": ';
echo sql2jsonKV($sql->q("SELECT id, stamp FROM research WHERE owner = '$owner'"));
echo '}';
if (!$tiles) {
	$tiles = 0;
}
$sql->q("UPDATE players AS p SET troops = (SELECT COUNT(*) FROM tiles WHERE owner = p.address OR troopOwner = p.address) WHERE address = '$owner'");
?>