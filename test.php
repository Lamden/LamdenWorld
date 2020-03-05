<?
require('lite.php');
$owner = $request->get('owner', 64);
$cost = $request->get('cost', 'array');
var_dump(checkCost($owner, $cost));
?>