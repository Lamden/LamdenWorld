SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `lamden`
--
CREATE DATABASE IF NOT EXISTS `lamden` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `lamden`;

-- --------------------------------------------------------

--
-- Table structure for table `chat`
--

CREATE TABLE IF NOT EXISTS `chat` (
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
  `stamp` int(10) unsigned NOT NULL,
  `name` varchar(64) NOT NULL,
  `body` mediumtext NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `log`
--

CREATE TABLE IF NOT EXISTS `log` (
  `id` mediumint(9) unsigned NOT NULL AUTO_INCREMENT,
  `type` enum('train','move','attack','siege','build','fortify','colonize','missile','delete','pickup') NOT NULL,
  `x` smallint(6) NOT NULL,
  `y` smallint(6) NOT NULL,
  `x2` smallint(6) NOT NULL,
  `y2` smallint(6) NOT NULL,
  `var1` varchar(72) NOT NULL,
  `var2` int(11) NOT NULL,
  `var3` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1807 ;

-- --------------------------------------------------------

--
-- Table structure for table `players`
--

CREATE TABLE IF NOT EXISTS `players` (
  `address` varchar(64) NOT NULL,
  `session` smallint(5) unsigned NOT NULL,
  `name` varchar(64) NOT NULL,
  `x` smallint(6) NOT NULL,
  `y` smallint(6) NOT NULL,
  `troops` int(10) unsigned NOT NULL,
  PRIMARY KEY (`address`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `research`
--

CREATE TABLE IF NOT EXISTS `research` (
  `owner` varchar(72) NOT NULL,
  `id` smallint(6) NOT NULL,
  `stamp` int(10) unsigned NOT NULL,
  UNIQUE KEY `owner` (`owner`(8),`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `resources`
--

CREATE TABLE IF NOT EXISTS `resources` (
  `owner` varchar(72) NOT NULL,
  `resource` tinyint(4) NOT NULL,
  `amount` int(11) NOT NULL,
  `lastHarvest` int(10) unsigned NOT NULL,
  UNIQUE KEY `res` (`owner`,`resource`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tiles`
--

CREATE TABLE IF NOT EXISTS `tiles` (
  `x` smallint(6) NOT NULL,
  `y` smallint(6) NOT NULL,
  `type` tinyint(4) unsigned NOT NULL,
  `owner` varchar(72) NOT NULL,
  `building` tinyint(4) NOT NULL,
  `level` tinyint(3) unsigned NOT NULL DEFAULT '1',
  `hp` smallint(5) unsigned NOT NULL,
  `fort` smallint(5) unsigned NOT NULL,
  `lastHarvest` int(11) NOT NULL,
  `troopOwner` varchar(72) NOT NULL,
  `numTroops` smallint(6) unsigned NOT NULL,
  `trainAmount` smallint(5) unsigned NOT NULL,
  `convertID` tinyint(4) NOT NULL,
  `collected` tinyint(3) unsigned NOT NULL DEFAULT '1',
  PRIMARY KEY (`x`,`y`),
  KEY `troops` (`troopOwner`(4),`numTroops`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
