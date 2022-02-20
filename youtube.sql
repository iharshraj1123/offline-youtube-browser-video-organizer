-- phpMyAdmin SQL Dump
-- version 5.0.4
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 20, 2022 at 04:43 PM
-- Server version: 10.4.17-MariaDB
-- PHP Version: 7.4.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `youtube`
--

-- --------------------------------------------------------

--
-- Table structure for table `video_metadatas`
--

CREATE TABLE `video_metadatas` (
  `vid_id` int(11) NOT NULL,
  `vid_name` text NOT NULL,
  `link` text NOT NULL,
  `uploader_id` int(11) NOT NULL,
  `uploader_name` text NOT NULL,
  `uploader_img` mediumtext NOT NULL,
  `likes` int(11) NOT NULL DEFAULT 0,
  `dislikes` int(11) NOT NULL DEFAULT 0,
  `duration` int(11) NOT NULL DEFAULT 0,
  `views` int(11) DEFAULT 0,
  `upload_date` date NOT NULL DEFAULT current_timestamp(),
  `upload_time` time NOT NULL DEFAULT current_timestamp(),
  `tags` longtext NOT NULL,
  `subtitles` text NOT NULL DEFAULT 'null',
  `description` longtext NOT NULL DEFAULT 'Published',
  `comments` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `video_metadatas`
--
ALTER TABLE `video_metadatas`
  ADD PRIMARY KEY (`vid_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `video_metadatas`
--
ALTER TABLE `video_metadatas`
  MODIFY `vid_id` int(11) NOT NULL AUTO_INCREMENT;

INSERT INTO `video_metadatas` (`vid_id`, `vid_name`, `link`, `uploader_id`, `uploader_name`, `uploader_img`, `likes`, `dislikes`, `duration`, `views`, `upload_date`, `upload_time`, `tags`, `subtitles`, `description`, `comments`) VALUES ('10', 'a:0:{}', '', '0', 'ALL Videoes', 'serialize($x)\r\nand\r\nunserialize($x)\r\nworks in php for these arrays', '0', '0', '0', '0', 'current_timestamp()', 'current_timestamp()', '', 'null', 'Published', '0'); 

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
