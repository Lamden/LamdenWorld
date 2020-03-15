<?
require('lite.php');
if ($request->exist('lastid')) {
	die($sql->s("SELECT CAST(MAX(id) AS SIGNED) - 50 FROM chat"));
}
if ($request->exist('id')) {
	$id = $request->get('id');
	$chat = $sql->q("SELECT * FROM chat WHERE id > $id ORDER BY id ASC");
	echo '[' . sql2json($chat) . ']';
	die();
}
$player = $request->get('player', 64);
$body = $request->get('body', 65535);
$sql->q("INSERT INTO chat (stamp, name, body) VALUES(UNIX_TIMESTAMP(), '$player','$body')");
?>