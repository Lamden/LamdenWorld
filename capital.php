<?
require('lite.php');
$owner = $request->get('owner', 64);
echo '[';
echo sql2json($sql->q("SELECT * FROM players WHERE address = '$owner'"));
echo ']';
?>