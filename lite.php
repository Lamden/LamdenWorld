<?
class Request {
	var $errorOnAbsence;
	var $allowEmpty;
	function __construct() {
		$this->errorOnAbsence = FALSE;
		$this->allowEmpty = !$this->isPost();
	}
	function method() { // return 1 if post, 0 if get
		return $_SERVER['REQUEST_METHOD'] == 'POST' ? 1 : 0;
	}
	function isPost() {
		return $this->method() > 0;
	}
	function exist($var) {
		if (!$this->isPost() && !isset($_GET[$var])) {
			return FALSE;
		} else if ($this->isPost() && !isset($_POST[$var])) {
			return FALSE;
		}
		return TRUE;
	}
	function exists($var) {
		return $this->exist($var);
	}
	function get($var, $rule = NULL, $default = FALSE, $errorOnAbsence = FALSE) {
		if (!isset($_GET[$var]) && ($errorOnAbsence || $this->errorOnAbsence)) {
			return FALSE;
		} else if (!isset($_REQUEST[$var]) && $rule == 'array') {
			return array();
		} else if (!isset($_REQUEST[$var])) {
			$value = $default;
		} else {
			$value = $_REQUEST[$var];
		}
		if ($default === FALSE && $value == '') {
//			$this->addError($var, 'Empty: ' . $var);
			return FALSE;
		}

		if ($rule == NULL && !is_numeric($value)) { // Require number
//			$this->addError($var, 'Must be numeric');
			return FALSE;
		} else if ($rule > 0 && strlen($value) > $rule) { // string
//			$this->addError($var, 'Too long');
			$value = substr($value, 0, $rule);
		} else if ($rule == 'array' && $value && !is_array($value)) { // array
//			$this->addError($var, 'Error');
			return FALSE;
		} else if (is_array($rule) && !in_array($value, $rule)) {
//			$this->addError($var, 'Invalid value; must be one of the following: ' . implode(', ', $rule));
			return FALSE;
		}
		if (is_array($value)) {
			foreach ($value as $i => $v) {
				$value[$i] = addslashes($v);
			}
			return $value;
		}
		return addslashes(trim($value));
	}

}
$request = new Request();

class Mysql {
	var $connection;
	function __construct() {
		if (!$this->connection = mysqli_connect('localhost', SQL_USER, SQL_PASS, SQL_DB)) {
			header('HTTP/1.1 503 Service Unavailable');
			die("Database error, please try again in a few moments. ");
		}
		mysqli_set_charset($this->connection, 'utf8');
	}
	function q($q) {
		$rr = mysqli_query($this->connection, $q) or die (mysqli_error($this->connection) . ' Query: ' . htmlentities($q));
		return $rr;
	}
	function get($q) {
		return mysqli_fetch_assoc($this->q($q));
	}
	function s($q) { // single veriable
		$row = $this->get($q);
		if (is_array($row)) {
			return current($row);
		}
		return FALSE;
	}
	function ids($q) {
		$rr = $this->q($q);
		$array = array();
		while ($r = mysqli_fetch_row($rr)) {
			$array[] = $r[0];
		}
		return $array;
	}
	function next($rr) {
		return mysqli_fetch_assoc($rr);
	}
	function rows($rr) {
		return mysqli_num_rows($rr);
	}
}
require('config.php');
$sql = new Mysql();

function sql2json($rr) {
	$json = '';
	$c = 0;
	while ($t = mysqli_fetch_assoc($rr)) {
		$c++;
		if ($c > 1) {
			$json .= ', ';
		}
		$json .= '{';
		$i = 0;
		foreach ($t as $key => $value) {
			$i++;
			if ($i > 1) {
				$json .= ', ';
			}
			$json .= '"' . $key . '": ' . (is_numeric($value) ? $value : '"' . addcslashes(htmlentities($value),'"\\/') . '"');
		}
		$json .= '}';
	}
	return $json;
}

// JSON object { key :value } pairs
function sql2jsonKV($rr) {
	$json = '{';
	$c = 0;
	while ($t = mysqli_fetch_row($rr)) {
		$c++;
		if ($c > 1) {
			$json .= ', ';
		}
		$json .= '"' . $t[0] . '": ' . (is_numeric($t[1]) ? $t[1] : '"' . addcslashes(htmlentities($value),'"\\/') . '"');
	}
	$json .= '}';
	return $json;
}
function checkCost($owner, $cost) {
	global $sql;
	$valid = true;
	foreach ($cost as $id => $value) {
		if ($sql->s("SELECT amount FROM resources WHERE owner = '$owner' AND resource = $id") < $value) {
			return false;
		}
	}
	return true;
}
function deductCost($owner, $cost) {
	global $sql;
	if (!checkCost($owner, $cost)) {
		return false;
	}
	foreach ($cost as $id => $value) {
		$sql->q("UPDATE resources SET amount = amount - $value WHERE owner = '$owner' AND resource = $id");
	}
	return true;
}
function clamp($current, $min, $max) {
    return max($min, min($max, $current));
}
function hasResearched($player, $tech) {
	return 0;
	global $sql;
	return $sql->s("SELECT COUNT(*) FROM research WHERE owner = '$player' AND id = $tech AND stamp < UNIX_TIMESTAMP() - 30");
}
header('Content-Type: text/html; charset=utf-8', TRUE);
?>