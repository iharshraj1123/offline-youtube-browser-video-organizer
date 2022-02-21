-- phpMyAdmin SQL Dump
-- version 5.0.4
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 20, 2022 at 04:42 PM
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
-- Database: `userdata`
--

-- --------------------------------------------------------

--
-- Table structure for table `chat_store`
--

CREATE DATABASE userdata;

CREATE TABLE `chat_store` (
  `chat_id` int(11) NOT NULL,
  `type` tinytext NOT NULL DEFAULT 'user',
  `chatted_to_id` int(11) NOT NULL,
  `chat_to_name` text NOT NULL,
  `chat_to_img` text NOT NULL,
  `chatted_by_id` int(11) NOT NULL,
  `chat_by_name` text NOT NULL,
  `chat_by_img` text NOT NULL DEFAULT '/comment section/Userdatabase/ProfilePic/default1.jpg',
  `chat_date` date NOT NULL,
  `chat_time` time NOT NULL,
  `chat_text` longtext NOT NULL,
  `chat_edited` text NOT NULL DEFAULT 'false',
  `chat_read` text NOT NULL DEFAULT 'false'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `comment_store`
--

CREATE TABLE `comment_store` (
  `com_id` int(11) NOT NULL,
  `com_page` longtext COLLATE utf8mb4_bin NOT NULL,
  `user_num` int(11) NOT NULL,
  `com_date` date NOT NULL,
  `com_time` time NOT NULL,
  `comment` longtext COLLATE utf8mb4_bin NOT NULL,
  `total_replies` int(11) NOT NULL,
  `upvotes` int(11) NOT NULL,
  `downvotes` int(11) NOT NULL,
  `points` int(11) NOT NULL,
  `edited` varchar(20) COLLATE utf8mb4_bin NOT NULL DEFAULT 'false'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- --------------------------------------------------------

--
-- Table structure for table `reply_store`
--

CREATE TABLE `reply_store` (
  `reply_id` int(11) NOT NULL,
  `com_id` int(11) NOT NULL,
  `user_num` int(11) NOT NULL,
  `page` varchar(100) COLLATE utf8mb4_bin NOT NULL,
  `reply_date` date NOT NULL,
  `reply_time` time NOT NULL,
  `replied_to` varchar(40) COLLATE utf8mb4_bin NOT NULL,
  `reply` longtext COLLATE utf8mb4_bin NOT NULL,
  `upvotes` int(11) NOT NULL,
  `downvotes` int(11) NOT NULL,
  `points` int(11) NOT NULL,
  `edited` varchar(20) COLLATE utf8mb4_bin NOT NULL DEFAULT 'false'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- --------------------------------------------------------

--
-- Table structure for table `user_info`
--

CREATE TABLE `user_info` (
  `user_num` int(11) NOT NULL,
  `user_name` varchar(40) COLLATE utf8mb4_bin NOT NULL,
  `privilege` varchar(10) COLLATE utf8mb4_bin NOT NULL DEFAULT 'USER',
  `Members` longtext COLLATE utf8mb4_bin DEFAULT NULL,
  `user_pass` varchar(40) COLLATE utf8mb4_bin DEFAULT NULL,
  `first_name` varchar(15) COLLATE utf8mb4_bin DEFAULT NULL,
  `last_name` varchar(15) COLLATE utf8mb4_bin DEFAULT NULL,
  `user_desc` varchar(2000) COLLATE utf8mb4_bin DEFAULT 'Hiii There its me !!! yeah you dont know me....',
  `user_pic` varchar(200) COLLATE utf8mb4_bin DEFAULT '/comment section/Userdatabase/ProfilePic/default1.jpg',
  `comment_votes` longtext COLLATE utf8mb4_bin NOT NULL,
  `reply_votes` longtext COLLATE utf8mb4_bin NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `chat_store`
--
ALTER TABLE `chat_store`
  ADD PRIMARY KEY (`chat_id`);

--
-- Indexes for table `comment_store`
--
ALTER TABLE `comment_store`
  ADD PRIMARY KEY (`com_id`),
  ADD UNIQUE KEY `com_id` (`com_id`),
  ADD KEY `comment_store_ibfk_1` (`user_num`);

--
-- Indexes for table `reply_store`
--
ALTER TABLE `reply_store`
  ADD PRIMARY KEY (`reply_id`),
  ADD KEY `com_id` (`com_id`),
  ADD KEY `reply_store_ibfk_2` (`user_num`);

--
-- Indexes for table `user_info`
--
ALTER TABLE `user_info`
  ADD PRIMARY KEY (`user_num`,`user_name`,`privilege`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `chat_store`
--
ALTER TABLE `chat_store`
  MODIFY `chat_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `comment_store`
--
ALTER TABLE `comment_store`
  MODIFY `com_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reply_store`
--
ALTER TABLE `reply_store`
  MODIFY `reply_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_info`
--
ALTER TABLE `user_info`
  MODIFY `user_num` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `comment_store`
--
ALTER TABLE `comment_store`
  ADD CONSTRAINT `comment_store_ibfk_1` FOREIGN KEY (`user_num`) REFERENCES `user_info` (`user_num`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `reply_store`
--
ALTER TABLE `reply_store`
  ADD CONSTRAINT `reply_store_ibfk_1` FOREIGN KEY (`com_id`) REFERENCES `comment_store` (`com_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `reply_store_ibfk_2` FOREIGN KEY (`user_num`) REFERENCES `user_info` (`user_num`) ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO `user_info` (`user_num`, `user_name`, `privilege`, `Members`, `user_pass`, `first_name`, `last_name`, `user_desc`, `user_pic`, `comment_votes`, `reply_votes`) VALUES (NULL, 'iharshraj', 'ADMIN', NULL, 'temp_pass', 'Harsh', 'Raj', 'I don\'t even know why I created this place... btw I also like animes', '/comment section/Userdatabase/ProfilePic/1.jpg', 'a:4:{i:190;s:0:\"\";i:193;s:7:\"upvoted\";i:226;s:7:\"upvoted\";i:228;s:0:\"\";}', 'a:1:{i:0;s:7:\"upvoted\";}') ;
INSERT INTO `user_info` (`user_num`, `user_name`, `privilege`, `Members`, `user_pass`, `first_name`, `last_name`, `user_desc`, `user_pic`, `comment_votes`, `reply_votes`) VALUES (NULL, 'disgusted', 'MOD', NULL, 'temp_pass', 'i dont like', 'you', 'stop looking at me pig', '/comment section/Userdatabase/ProfilePic/disgusted maid 1.jpg', 'a:1:{i:0;s:7:\"upvoted\";}', 'a:1:{i:0;s:7:\"upvoted\";}') ;
INSERT INTO `user_info` (`user_num`, `user_name`, `privilege`, `Members`, `user_pass`, `first_name`, `last_name`, `user_desc`, `user_pic`, `comment_votes`, `reply_votes`) VALUES (NULL, 'talk bot', 'USER', NULL, 'temp_pass', 'chat', 'bot', 'Hiii There its me !!! yeah you dont know me....', '/comment section/Userdatabase/ProfilePic/default1.jpg', 'a:1:{i:0;s:7:\"upvoted\";}', 'a:1:{i:0;s:7:\"upvoted\";}');
INSERT INTO `user_info` (`user_num`, `user_name`, `privilege`, `Members`, `user_pass`, `first_name`, `last_name`, `user_desc`, `user_pic`, `comment_votes`, `reply_votes`) VALUES (NULL, 'creeper_sweeper', 'USER', NULL, 'india123', 'Joe', 'Johnson', 'Minecraft all day', '/comment section/Userdatabase/ProfilePic/creeper_sweeper.gif', 'a:1:{i:0;s:7:\"upvoted\";}', 'a:1:{i:0;s:7:\"upvoted\";}') ;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
