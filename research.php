<?
require('lite.php');
$owner = $request->get('owner', 64);
$id = $request->get('id');
$sql->q("INSERT INTO research (owner, id, stamp) VALUES ('$owner', $id, UNIX_TIMESTAMP())");
?>