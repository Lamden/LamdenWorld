<?
require('lite.php');
$owner = $request->get('owner', 64);
echo '[';
echo sql2json($sql->q("SELECT resource, amount FROM resources WHERE owner = '$owner'"));
echo ']';
?>