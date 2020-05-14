<?
require('lite.php');
$players = $sql->q("SELECT p.x, p.y, p.name, p.address, p.session, p.troops
	FROM players AS p
	JOIN tiles AS t ON p.x = t.x AND p.y = t.y AND t.owner = /* CONCAT(p.address, '-', p.session) */ p.address
	ORDER BY p.troops DESC");
echo '[';
echo sql2json($players);
echo ']';
?>