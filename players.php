<?
require('lite.php');
$players = $sql->q("SELECT p.x, p.y, p.name, p.address, p.session, p.troops
	FROM players AS p
	ORDER BY p.troops DESC");
echo '[';
echo sql2json($players);
echo ']';
?>