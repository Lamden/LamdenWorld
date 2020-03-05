<?
require('lite.php');
echo $sql->s("SELECT MAX(id) FROM log");
?>