<?
require('lite.php');
echo '[';
echo sql2json($sql->q('SELECT * FROM tiles'));
echo ']';
?>