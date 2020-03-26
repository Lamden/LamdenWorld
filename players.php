<?
require('lite.php');
$players = $sql->q("SELECT p.x, p.y, p.name, p.address, p.troops FROM players AS p JOIN tiles AS t ON p.x = t.x AND p.y = t.y AND t.building = 1 ORDER BY p.troops DESC");
echo '[';
echo sql2json($players);
echo ']';
?>