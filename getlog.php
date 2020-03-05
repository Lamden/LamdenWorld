<?
require('lite.php');
$id = $request->get('id');
echo '[';
echo sql2json($sql->q("SELECT * FROM log WHERE id > $id"));
echo ']';
?>