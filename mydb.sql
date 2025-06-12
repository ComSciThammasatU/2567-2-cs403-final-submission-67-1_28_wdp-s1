-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: May 19, 2025 at 05:25 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `mydb`
--

-- --------------------------------------------------------

--
-- Table structure for table `Booking`
--

CREATE TABLE `Booking` (
  `bookingID` int(11) NOT NULL,
  `targetLaneID` int(11) DEFAULT NULL,
  `username` varchar(256) DEFAULT NULL,
  `paymentID` int(11) DEFAULT NULL,
  `shiftID` varchar(1) DEFAULT NULL,
  `bookingDate` date DEFAULT NULL,
  `bookingStatusID` int(3) DEFAULT 1,
  `FriendName` varchar(256) DEFAULT NULL,
  `FriendID` varchar(20) DEFAULT NULL,
  `FriendTel` varchar(10) DEFAULT NULL,
  `cancelTime` datetime DEFAULT NULL,
  `confirmTime` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `Booking`
--

INSERT INTO `Booking` (`bookingID`, `targetLaneID`, `username`, `paymentID`, `shiftID`, `bookingDate`, `bookingStatusID`, `FriendName`, `FriendID`, `FriendTel`, `cancelTime`, `confirmTime`) VALUES
(1, 104, '6309650122', NULL, '1', '2024-09-02', 3, NULL, NULL, NULL, NULL, NULL),
(2, 103, '6309650122', 1, '1', '2024-09-09', 2, NULL, NULL, NULL, NULL, '2025-04-09 21:29:02'),
(3, 101, '6309650122', 2, '2', '2024-09-10', 3, NULL, NULL, NULL, NULL, NULL),
(4, 101, '6309650122', NULL, '1', '2024-09-10', 3, NULL, NULL, NULL, NULL, NULL),
(5, 103, '6309650122', 3, '1', '2024-09-10', 2, NULL, NULL, NULL, NULL, '2025-04-09 21:29:02'),
(6, 101, '6309650122', NULL, '1', '2024-09-17', 3, NULL, NULL, NULL, NULL, NULL),
(7, 102, '6309650122', NULL, '1', '2024-09-17', 3, NULL, NULL, NULL, NULL, NULL),
(8, 101, '6309650122', NULL, '1', '2024-09-17', 1, NULL, NULL, NULL, NULL, NULL),
(9, 101, '6309650122', 26, '1', '2024-10-01', 3, NULL, NULL, NULL, NULL, NULL),
(10, 101, '6309650122', 4, '2', '2024-10-01', 3, NULL, NULL, NULL, NULL, NULL),
(11, 101, '6309650122', NULL, '1', '2024-10-01', 3, NULL, NULL, NULL, NULL, NULL),
(12, 102, '6309650122', 28, '1', '2024-10-01', 3, NULL, NULL, NULL, NULL, NULL),
(13, 102, '6309650122', 5, '2', '2024-10-01', 3, NULL, NULL, NULL, NULL, NULL),
(14, 103, '6309650122', 27, '1', '2024-10-01', 3, NULL, NULL, NULL, NULL, NULL),
(15, 103, '6309650122', 23, '2', '2024-10-01', 3, NULL, NULL, NULL, NULL, NULL),
(16, 104, '6309650122', 24, '1', '2024-10-01', 3, NULL, NULL, NULL, NULL, NULL),
(17, 104, '6309650122', 25, '2', '2024-10-01', 3, NULL, NULL, NULL, NULL, NULL),
(18, 101, '6309650122', NULL, '1', '2024-10-01', 3, NULL, NULL, NULL, NULL, NULL),
(19, 103, '6309650122', NULL, '1', '2024-10-01', 1, NULL, NULL, NULL, NULL, NULL),
(20, 102, '6309650122', NULL, '1', '2024-10-01', 1, NULL, NULL, NULL, NULL, NULL),
(21, 102, '6309650122', 29, '1', '2024-10-13', 2, NULL, NULL, NULL, NULL, '2025-04-09 21:29:02'),
(22, 101, '6309650122', 30, '1', '2024-10-15', 2, NULL, NULL, NULL, NULL, '2025-04-09 21:29:02'),
(23, 101, '6309650122', 31, '2', '2024-10-15', 1, NULL, NULL, NULL, NULL, NULL),
(24, 101, '6309650122', 32, '1', '2024-10-22', 2, NULL, NULL, NULL, NULL, '2025-04-09 21:29:02'),
(25, 102, '6309650122', 33, '1', '2024-11-19', 3, NULL, NULL, NULL, NULL, NULL),
(26, 103, '6309650122', 34, '1', '2024-11-20', 2, NULL, NULL, NULL, NULL, '2025-04-09 21:29:02'),
(27, 101, '6309650122', NULL, '2', '2025-02-06', 1, NULL, NULL, NULL, NULL, NULL),
(28, 101, '6309650122', 35, '1', '2025-02-12', 2, NULL, NULL, NULL, NULL, '2025-04-09 21:29:02'),
(29, 101, '6309650122', NULL, '1', '2025-02-28', 3, NULL, NULL, NULL, NULL, NULL),
(30, 101, '6309650122', NULL, '1', '2025-02-27', 2, NULL, NULL, NULL, NULL, '2025-04-09 21:29:02'),
(31, 103, '6309650122', 49, '1', '2025-02-27', 2, 'Apisara Sukaram', '6309650163', '0899999999', NULL, '2025-04-09 21:29:02'),
(32, 102, '6309650163', 50, '1', '2025-02-27', 1, 'Natida Prasittham', '6309650122', '0888582296', NULL, NULL),
(33, 101, '6309650122', NULL, '1', '2025-02-27', 1, '', '', '', NULL, NULL),
(34, 102, '6309650122', 52, '1', '2025-02-28', 3, '', '', '', NULL, NULL),
(35, 104, '6309650122', 51, '1', '2025-02-28', 3, '', '', '', NULL, NULL),
(36, 105, '6309650122', 76, '1', '2025-02-28', 3, '', '', '', NULL, NULL),
(37, 106, '6309650122', 77, '1', '2025-02-28', 3, '', '', '', NULL, NULL),
(38, 106, '6309650122', NULL, '1', '2025-02-28', 3, NULL, NULL, NULL, NULL, NULL),
(39, 102, '6309650122', 78, '2', '2025-02-28', 1, NULL, NULL, NULL, NULL, NULL),
(40, 105, '6309650122', 79, '2', '2025-02-28', 1, 'Apisara SS', '6309650163', '0899999999', NULL, NULL),
(41, 101, '6309650122', 83, '1', '2025-03-05', 3, NULL, NULL, NULL, NULL, NULL),
(42, 101, '6309650122', NULL, '1', '2025-03-05', 3, NULL, NULL, NULL, NULL, NULL),
(43, 101, '6309650122', NULL, '1', '2025-03-05', 3, NULL, NULL, NULL, NULL, NULL),
(44, 101, '6309650122', NULL, '1', '2025-03-05', 3, NULL, NULL, NULL, NULL, NULL),
(45, 102, '6309650122', 87, '1', '2025-03-05', 3, NULL, NULL, NULL, NULL, NULL),
(46, 101, '6309650122', 85, '1', '2025-03-06', 2, NULL, NULL, NULL, NULL, '2025-04-09 21:29:02'),
(47, 103, '6309650122', 86, '2', '2025-03-06', 2, 'natthanicha', '6309650262', '0988898899', NULL, '2025-04-09 21:29:02'),
(48, 102, '6309650122', NULL, '1', '2025-03-05', 1, NULL, NULL, NULL, NULL, NULL),
(49, 102, '6309650122', 88, '1', '2025-03-06', 2, NULL, NULL, NULL, NULL, '2025-04-09 21:29:02'),
(50, 101, '6309650122', NULL, '2', '2025-03-06', 2, NULL, NULL, NULL, NULL, '2025-04-09 21:29:02'),
(51, 104, '6309650122', NULL, '1', '2025-03-07', 2, 'Natthanicha', '6309650262', '0998855584', NULL, '2025-04-09 21:29:02'),
(52, 101, '6309650122', 89, '2', '2025-03-07', 2, 'Apisara', '6309650163', '0987654332', NULL, '2025-04-09 21:29:02'),
(53, 101, '6309650122', NULL, '1', '2025-03-14', 2, 'Natida test', '6309650122', '0989898989', NULL, '2025-04-09 21:29:02'),
(54, 101, '6309650122', 90, '1', '2025-03-27', 2, 'Natida check', '6309650122', NULL, NULL, '2025-04-09 21:29:02'),
(55, 101, '6309650122', 91, '1', '2025-04-02', 1, NULL, NULL, NULL, NULL, NULL),
(56, 104, '6309650122', 92, '1', '2025-04-03', 2, NULL, NULL, NULL, NULL, '2025-04-09 21:29:02'),
(57, 105, '6309650122', 93, '1', '2025-04-04', 1, NULL, NULL, NULL, NULL, NULL),
(58, 103, '6309650122', 94, '1', '2025-04-09', 3, NULL, NULL, NULL, '2025-04-09 16:22:48', NULL),
(59, 103, '6309650122', 95, '2', '2025-04-09', 3, NULL, NULL, NULL, '2025-04-09 16:22:48', NULL),
(60, 102, '6309650122', 96, '1', '2025-04-09', 3, NULL, NULL, NULL, '2025-04-09 16:22:48', NULL),
(61, 102, '6309650122', NULL, '1', '2025-04-09', 3, NULL, NULL, NULL, '2025-04-09 16:22:48', NULL),
(62, 103, '6309650122', NULL, '1', '2025-04-09', 3, NULL, NULL, NULL, '2025-04-09 16:22:48', NULL),
(63, 104, '6309650122', NULL, '1', '2025-04-09', 3, NULL, NULL, NULL, '2025-04-09 16:22:48', NULL),
(64, 101, '6309650122', NULL, '1', '2025-04-17', 3, NULL, NULL, NULL, '2025-04-09 16:51:49', NULL),
(65, 102, '6309650122', NULL, '1', '2025-04-09', 3, NULL, NULL, NULL, '2025-04-09 16:22:48', NULL),
(66, 102, '6309650122', NULL, '1', '2025-04-09', 3, NULL, NULL, NULL, '2025-04-09 16:22:48', NULL),
(67, 102, '6309650122', NULL, '1', '2025-04-09', 3, NULL, NULL, NULL, '2025-04-09 16:22:48', NULL),
(68, 102, '6309650122', NULL, '1', '2025-04-09', 3, NULL, NULL, NULL, '2025-04-09 16:22:48', NULL),
(69, 105, '6309650122', 103, '1', '2025-04-22', 3, NULL, NULL, NULL, '2025-04-09 16:52:13', NULL),
(70, 102, '6309650122', NULL, '2', '2025-04-09', 3, NULL, NULL, NULL, '2025-04-09 16:22:48', NULL),
(71, 103, '6309650122', NULL, '2', '2025-04-17', 3, NULL, NULL, NULL, '2025-04-09 16:54:24', NULL),
(72, 102, '6309650122', NULL, '2', '2025-04-10', 3, NULL, NULL, NULL, '2025-04-09 16:15:27', NULL),
(73, 106, '6309650122', NULL, '1', '2025-04-17', 3, NULL, NULL, NULL, '2025-04-09 17:00:08', NULL),
(74, 103, '6309650122', NULL, '1', '2025-04-17', 3, NULL, NULL, NULL, '2025-04-09 16:54:24', NULL),
(75, 103, '6309650122', NULL, '1', '2025-04-09', 3, NULL, NULL, NULL, '2025-04-09 16:22:48', NULL),
(76, 104, '6309650122', NULL, '1', '2025-04-09', 3, NULL, NULL, NULL, '2025-04-09 16:22:48', NULL),
(77, 103, '6309650122', NULL, '1', '2025-04-09', 3, NULL, NULL, NULL, '2025-04-09 16:22:48', NULL),
(78, 104, '6309650122', NULL, '1', '2025-04-09', 3, NULL, NULL, NULL, '2025-04-09 16:22:48', NULL),
(79, 106, '6309650122', NULL, '2', '2025-04-09', 3, NULL, NULL, NULL, NULL, NULL),
(80, 106, '6309650122', NULL, '2', '2025-04-17', 3, NULL, NULL, NULL, '2025-04-09 17:01:09', NULL),
(81, 103, '6309650122', NULL, '2', '2025-04-10', 1, NULL, NULL, NULL, NULL, '2025-04-10 01:18:37'),
(82, 103, '6309650122', 105, '1', '2025-04-22', 3, NULL, NULL, NULL, '2025-04-20 01:38:22', '2025-04-20 01:29:22'),
(83, 105, '6309650122', NULL, '2', '2025-04-22', 3, NULL, NULL, NULL, '2025-04-09 23:52:10', '2025-04-09 16:35:06'),
(84, 105, '6309650122', NULL, '1', '2025-04-22', 3, NULL, NULL, NULL, '2025-04-19 17:12:59', '2025-04-19 17:10:05'),
(85, 105, '6309650122', 98, '2', '2025-04-10', 1, NULL, NULL, NULL, NULL, '2025-04-10 01:18:37'),
(86, 104, '6309650122', 99, '1', '2025-04-10', 1, NULL, NULL, NULL, NULL, '2025-04-10 01:18:37'),
(87, 106, '6309650122', 101, '2', '2025-04-22', 3, NULL, NULL, NULL, '2025-04-19 17:57:49', '2025-04-19 17:55:37'),
(88, 101, '6309650122', 102, '2', '2025-04-22', 3, NULL, NULL, NULL, '2025-04-20 01:39:03', '2025-04-20 01:24:28'),
(89, 105, '6309650122', 108, '1', '2025-04-22', 2, NULL, NULL, NULL, NULL, '2025-04-22 23:35:29'),
(90, 104, '6309650122', 104, '2', '2025-04-22', 2, NULL, NULL, NULL, NULL, '2025-04-20 02:50:30'),
(91, 103, '6309650122', NULL, '1', '2025-04-22', 2, NULL, NULL, NULL, NULL, '2025-04-20 02:51:31'),
(92, 103, '6309650122', 106, '1', '2025-04-23', 2, NULL, NULL, NULL, NULL, '2025-04-23 01:36:32'),
(93, 105, '6309650122', 107, '2', '2025-04-23', 2, NULL, NULL, NULL, NULL, '2025-04-23 01:36:33'),
(94, 106, '6309650163', 109, '1', '2025-04-23', 2, NULL, NULL, NULL, NULL, '2025-04-23 01:36:34'),
(95, 103, '6309650122', 110, '1', '2025-04-24', 2, NULL, NULL, NULL, NULL, '2025-04-24 04:18:35'),
(96, 105, '6309650122', 111, '2', '2025-04-24', 1, NULL, NULL, NULL, NULL, NULL),
(97, 103, '6309650122', 112, '1', '2025-05-02', 1, NULL, NULL, NULL, NULL, '2025-05-01 00:14:37'),
(98, 101, '6309650122', 113, '1', '2025-04-30', 2, NULL, NULL, NULL, NULL, '2025-04-30 04:17:38'),
(99, 103, '6309650122', 114, '2', '2025-04-30', 2, NULL, NULL, NULL, NULL, '2025-04-30 23:50:39'),
(100, 102, '6309650122', 115, '2', '2025-05-02', 2, NULL, NULL, NULL, NULL, '2025-05-01 00:14:40'),
(101, 102, '6309650122', NULL, '1', '2025-05-06', 3, NULL, NULL, NULL, '2025-05-01 00:55:41', NULL),
(102, 103, '6309650122', NULL, '1', '2025-05-06', 2, NULL, NULL, NULL, NULL, '2025-05-01 00:56:42'),
(103, 103, '6309650122', 116, '1', '2025-05-08', 3, NULL, NULL, NULL, '2025-05-07 03:07:35', NULL),
(104, 102, '6309650122', 117, '1', '2025-05-08', 2, NULL, NULL, NULL, NULL, '2025-05-08 03:46:44'),
(105, 104, '6309650122', 118, '2', '2025-05-13', 2, NULL, NULL, NULL, NULL, '2025-05-08 03:30:45'),
(106, 101, '6309650122', 119, '2', '2025-05-08', 2, NULL, NULL, NULL, NULL, '2025-05-08 03:46:46'),
(107, 104, '6309650122', 120, '1', '2025-05-14', 2, NULL, NULL, NULL, NULL, '2025-05-14 00:11:47'),
(108, 105, '6309650122', 121, '2', '2025-05-14', 2, NULL, NULL, NULL, NULL, '2025-05-14 00:11:48'),
(109, 102, '6309650122', 122, '1', '2025-05-14', 2, 'Apisara', '6309650163', '0999999999', NULL, '2025-05-14 00:11:49'),
(110, 106, '6301650999', 123, '2', '2025-05-14', 1, 'Somsri', NULL, NULL, NULL, NULL),
(111, 103, '6309650122', 124, '1', '2025-05-15', 1, NULL, NULL, NULL, NULL, NULL),
(112, 104, '6309650122', 125, '2', '2025-05-20', 2, NULL, NULL, NULL, NULL, '2025-05-19 15:47:52');

-- --------------------------------------------------------

--
-- Table structure for table `BookingStatus`
--

CREATE TABLE `BookingStatus` (
  `bookingStatusID` int(3) NOT NULL,
  `statusName` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `BookingStatus`
--

INSERT INTO `BookingStatus` (`bookingStatusID`, `statusName`) VALUES
(1, 'Pending'),
(2, 'Confirm'),
(3, 'Cancel');

-- --------------------------------------------------------

--
-- Table structure for table `holidays`
--

CREATE TABLE `holidays` (
  `id` int(11) NOT NULL,
  `day` int(11) NOT NULL,
  `month` int(11) NOT NULL,
  `year` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `is_recurring` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `type` varchar(10) DEFAULT 'holiday'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `holidays`
--

INSERT INTO `holidays` (`id`, `day`, `month`, `year`, `name`, `is_recurring`, `created_at`, `updated_at`, `type`) VALUES
(3, 13, 4, NULL, 'วันสงกรานต์', 0, '2025-03-13 17:11:23', '2025-03-13 17:11:23', 'holiday'),
(4, 14, 4, NULL, 'วันสงกรานต์', 0, '2025-03-13 17:11:23', '2025-03-13 17:11:23', 'holiday'),
(5, 15, 4, NULL, 'วันสงกรานต์', 0, '2025-03-13 17:11:23', '2025-03-13 17:11:23', 'holiday'),
(6, 1, 5, NULL, 'วันแรงงานแห่งชาติ', 0, '2025-03-13 17:11:23', '2025-03-13 17:11:23', 'holiday'),
(7, 5, 5, NULL, 'วันฉัตรมงคล', 0, '2025-03-13 17:11:23', '2025-03-13 17:11:23', 'holiday'),
(8, 3, 6, NULL, 'วันเฉลิมพระชนมพรรษาสมเด็จพระราชินี', 0, '2025-03-13 17:11:23', '2025-03-13 17:11:23', 'holiday'),
(9, 28, 7, NULL, 'วันเฉลิมพระชนมพรรษาพระเจ้าอยู่หัว', 0, '2025-03-13 17:11:23', '2025-03-13 17:11:23', 'holiday'),
(10, 12, 8, NULL, 'วันแม่แห่งชาติ', 0, '2025-03-13 17:11:23', '2025-03-13 17:11:23', 'holiday'),
(11, 13, 10, NULL, 'วันคล้ายวันสวรรคตร.9', 0, '2025-03-13 17:11:23', '2025-03-13 18:24:10', 'holiday'),
(12, 23, 10, NULL, 'วันปิยมหาราช', 0, '2025-03-13 17:11:23', '2025-03-13 17:11:23', 'holiday'),
(13, 5, 12, NULL, 'วันคล้ายวันพระบรมราชสมภพ ร.9', 0, '2025-03-13 17:11:23', '2025-03-13 17:11:23', 'holiday'),
(14, 10, 12, NULL, 'วันรัฐธรรมนูญ', 0, '2025-03-13 17:11:23', '2025-03-13 17:11:23', 'holiday'),
(15, 31, 12, NULL, 'วันสิ้นปี', 0, '2025-03-13 17:11:23', '2025-03-13 17:11:23', 'holiday'),
(34, 5, 11, 2025, 'วันลอยกระทง', 0, '2025-03-21 03:04:50', '2025-03-21 03:04:50', 'special'),
(38, 25, 3, 2025, 'Test', 0, '2025-03-21 06:05:27', '2025-03-21 06:05:27', 'holiday'),
(39, 26, 3, 2025, 'Test1', 0, '2025-03-21 06:05:37', '2025-03-21 06:05:37', 'special'),
(40, 4, 4, 2025, 'Test', 0, '2025-04-02 15:23:06', '2025-04-02 15:23:06', 'holiday'),
(41, 18, 4, 2025, 'Test', 0, '2025-04-08 19:59:36', '2025-04-08 19:59:36', 'holiday');

-- --------------------------------------------------------

--
-- Table structure for table `operationDay`
--

CREATE TABLE `operationDay` (
  `operationID` int(10) NOT NULL,
  `startDate` date NOT NULL,
  `endDate` date NOT NULL,
  `description` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `operationDay`
--

INSERT INTO `operationDay` (`operationID`, `startDate`, `endDate`, `description`) VALUES
(13, '2025-02-13', '2025-04-30', NULL),
(14, '2025-02-13', '2025-02-28', NULL),
(15, '2025-02-13', '2025-02-26', NULL),
(16, '2025-02-13', '2025-06-14', NULL),
(17, '2025-02-13', '2025-05-31', NULL),
(18, '2025-02-13', '2025-06-14', NULL),
(19, '2025-02-15', '2025-02-28', NULL),
(20, '2025-04-02', '2025-12-02', NULL),
(21, '2025-04-09', '2026-04-10', NULL),
(22, '2025-04-10', '2026-04-17', NULL),
(23, '2025-04-21', '2025-06-30', 'เทอม 2'),
(24, '2025-04-21', '2025-06-30', 'สำหรับเทอม2'),
(25, '2025-04-21', '2026-04-30', 'เทอม2/68'),
(26, '2025-04-23', '2026-09-30', 'Test Operation Page ควรขึ้นข้อมูล'),
(27, '2025-04-23', '2025-07-15', NULL),
(28, '2025-05-13', '2025-07-25', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `Payment`
--

CREATE TABLE `Payment` (
  `paymentID` int(11) NOT NULL,
  `username` varchar(20) DEFAULT NULL,
  `accountDigit` varchar(4) DEFAULT NULL,
  `bankName` varchar(5) DEFAULT NULL,
  `dateATime` datetime DEFAULT NULL,
  `bookingID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `Payment`
--

INSERT INTO `Payment` (`paymentID`, `username`, `accountDigit`, `bankName`, `dateATime`, `bookingID`) VALUES
(1, '6309650122', '0012', 'KTB', '2024-09-09 02:55:00', 2),
(2, '6309650122', '1213', 'KBANK', '2024-09-10 01:27:00', 3),
(3, '6309650122', '1122', 'KBANK', '2024-09-16 20:08:00', 5),
(4, '6309650122', '1123', 'SCB', '2024-10-01 13:46:00', 10),
(5, '6309650122', '1111', 'KTB', '2024-10-01 05:32:00', 13),
(6, '6309650122', '1111', 'TTB', '2024-10-09 05:34:00', NULL),
(7, '6309650122', '1111', 'TTB', '2024-10-01 05:34:00', NULL),
(8, '6309650122', '1111', 'TTB', '2024-10-01 05:34:00', NULL),
(9, '6309650122', '1111', 'TTB', '2024-10-01 05:34:00', NULL),
(10, '6309650122', '1111', 'TTB', '2024-10-01 05:34:00', NULL),
(11, '6309650122', '1111', 'TTB', '2024-10-01 05:34:00', NULL),
(12, '6309650122', '1111', 'TTB', '2024-10-01 05:34:00', NULL),
(13, '6309650122', '1111', 'TTB', '2024-10-01 05:34:00', NULL),
(14, '6309650122', '1111', 'KTB', '2024-10-01 05:35:00', NULL),
(15, '6309650122', '1111', 'KTB', '2024-10-01 05:35:00', NULL),
(16, '6309650122', '1111', 'KTB', '2024-10-01 05:35:00', NULL),
(17, '6309650122', '1111', 'KTB', '2024-10-01 05:35:00', NULL),
(18, '6309650122', '1111', 'KTB', '2024-10-01 05:35:00', NULL),
(19, '6309650122', '1111', 'KTB', '2024-10-01 05:35:00', NULL),
(20, '6309650122', '1111', 'KTB', '2024-10-01 05:35:00', NULL),
(21, '6309650122', '2333', 'KBANK', '2024-10-01 05:36:00', 14),
(22, '6309650122', '3424', 'KBANK', '2024-10-01 05:36:00', 15),
(23, '6309650122', '4546', 'KBANK', '2024-10-01 05:41:00', 15),
(24, '6309650122', '1222', 'KBANK', '2024-10-01 06:01:00', 16),
(25, '6309650122', '6754', 'KBANK', '2024-10-01 06:06:00', 17),
(26, '6309650122', '3433', 'KBANK', '2024-10-01 06:31:00', 9),
(27, '6309650122', '6677', 'KTB', '2024-10-01 06:32:00', 14),
(28, '6309650122', '2233', 'KTB', '2024-10-01 07:15:00', 12),
(29, '6309650122', '1122', 'KTB', '2024-10-13 04:56:00', 21),
(30, '6309650122', '1121', 'KBANK', '2024-10-15 04:04:00', 22),
(31, '6309650122', '1122', 'BBL', '2024-10-15 04:35:00', 23),
(32, '6309650122', '2243', 'BBL', '2024-10-21 07:08:00', 24),
(33, '6309650122', '1212', 'KTB', '2024-11-19 15:05:00', 25),
(34, '6309650122', '2525', 'SCB', '2024-11-19 10:54:00', 26),
(35, '6309650122', '1122', 'SCB', '2025-02-11 22:57:00', 28),
(36, '6309650122', '1122', 'KTB', '2025-02-27 21:16:00', NULL),
(37, '6309650122', '1122', 'KTB', '2025-02-27 21:16:00', NULL),
(38, '6309650122', '1122', 'KTB', '2025-02-27 21:16:00', NULL),
(39, '6309650122', '1122', 'KTB', '2025-02-27 21:16:00', NULL),
(40, '6309650122', '1122', 'KTB', '2025-02-27 21:16:00', NULL),
(41, '6309650122', '1122', 'KTB', '2025-02-27 21:16:00', NULL),
(42, '6309650122', '1122', 'KTB', '2025-02-27 21:16:00', NULL),
(43, '6309650122', '1122', 'KTB', '2025-02-27 21:16:00', NULL),
(44, '6309650122', '1122', 'KTB', '2025-02-27 21:16:00', NULL),
(45, '6309650122', '1122', 'KTB', '2025-02-27 21:16:00', NULL),
(46, '6309650122', '1122', 'KTB', '2025-02-27 21:16:00', NULL),
(47, '6309650122', '1122', 'KTB', '2025-02-27 21:16:00', NULL),
(48, '6309650122', '1122', 'KTB', '2025-02-27 21:16:00', NULL),
(49, '6309650122', '2435', 'KTB', '2025-02-27 21:19:00', 31),
(50, '6309650163', '4435', 'KBANK', '2025-02-27 23:28:00', 32),
(51, '6309650122', '2233', 'UOBT', '2025-02-28 10:43:00', 35),
(52, '6309650122', '1213', 'SCB', '2025-02-28 10:48:00', 34),
(53, '6309650122', '1124', 'TTB', '2025-02-28 10:49:00', NULL),
(54, '6309650122', '1124', 'TTB', '2025-02-28 10:49:00', NULL),
(55, '6309650122', '1124', 'TTB', '2025-02-28 10:49:00', NULL),
(56, '6309650122', '1124', 'TTB', '2025-02-28 10:49:00', NULL),
(57, '6309650122', '1124', 'TTB', '2025-02-28 10:49:00', NULL),
(58, '6309650122', '1124', 'TTB', '2025-02-28 10:49:00', NULL),
(59, '6309650122', '1124', 'TTB', '2025-02-28 10:49:00', NULL),
(60, '6309650122', '1124', 'TTB', '2025-02-28 10:49:00', NULL),
(61, '6309650122', '1124', 'TTB', '2025-02-28 10:49:00', NULL),
(62, '6309650122', '1124', 'TTB', '2025-02-28 10:49:00', NULL),
(63, '6309650122', '1124', 'TTB', '2025-02-28 10:49:00', NULL),
(64, '6309650122', '1124', 'TTB', '2025-02-28 10:49:00', NULL),
(65, '6309650122', '7878', 'BAY', '2025-02-28 10:53:00', NULL),
(66, '6309650122', '7878', 'BAY', '2025-02-28 10:53:00', NULL),
(67, '6309650122', '7878', 'BAY', '2025-02-28 10:53:00', NULL),
(68, '6309650122', '7878', 'BAY', '2025-02-28 10:53:00', NULL),
(69, '6309650122', '7878', 'BAY', '2025-02-28 10:53:00', NULL),
(70, '6309650122', '8989', 'BBL', '2025-02-28 10:54:00', NULL),
(71, '6309650122', '8989', 'BBL', '2025-02-28 10:54:00', NULL),
(72, '6309650122', '8989', 'BBL', '2025-02-28 10:54:00', NULL),
(73, '6309650122', '8989', 'BBL', '2025-02-28 10:54:00', NULL),
(74, '6309650122', '8989', 'BBL', '2025-02-28 10:54:00', NULL),
(75, '6309650122', '6767', 'TTB', '2025-02-28 10:55:00', NULL),
(76, '6309650122', '5656', 'TTB', '2025-02-28 10:56:00', 36),
(77, '6309650122', '3434', 'SCB', '2025-02-28 11:03:00', 37),
(78, '6309650122', '8989', 'SCB', '2025-02-28 11:14:00', 39),
(79, '6309650122', '9090', 'BBL', '2025-02-28 11:22:00', 40),
(80, '6309650122', '7788', 'BAY', '2025-03-05 23:09:00', 41),
(81, '6309650122', '5647', 'TTB', '2025-03-05 23:23:00', 41),
(82, '6309650122', '3545', 'BBL', '2025-03-05 23:31:00', 41),
(83, '6309650122', '5678', 'TTB', '2025-03-05 23:33:00', 41),
(84, '6309650122', '3546', 'TTB', '2025-03-05 23:42:00', 45),
(85, '6309650122', '2234', 'BAY', '2025-03-06 00:16:00', 46),
(86, '6309650122', '2456', 'UOBT', '2025-03-06 00:18:00', 47),
(87, '6309650122', '6678', 'KBANK', '2025-03-06 00:19:00', 45),
(88, '6309650122', '4545', 'SCB', '2025-03-06 01:53:00', 49),
(89, '6309650122', '3649', 'KBANK', '2025-03-07 02:59:00', 52),
(90, '6309650122', '1123', 'SCB', '2025-03-27 03:53:00', 54),
(91, '6309650122', '1221', 'KBANK', '2025-04-02 19:28:00', 55),
(92, '6309650122', '3443', 'SCB', '2025-04-02 19:28:00', 56),
(93, '6309650122', '3442', 'TTB', '2025-04-02 19:29:00', 57),
(94, '6309650122', '1122', 'BBL', '2025-04-09 01:16:00', 58),
(95, '6309650122', '6886', 'BAY', '2025-04-09 03:02:00', 59),
(96, '6309650122', '2432', 'BBL', '2025-04-09 15:20:00', 60),
(97, '6309650122', '1231', 'SCB', '2025-04-09 23:52:00', 69),
(98, '6309650122', '3424', 'TTB', '2025-04-09 23:53:00', 85),
(99, '6309650122', '2321', 'TTB', '2025-04-09 23:54:00', 86),
(100, '6309650122', '3233', 'KBANK', '2025-04-19 23:16:00', 82),
(101, '6309650122', '2343', 'KTB', '2025-04-20 00:28:00', 87),
(102, '6309650122', '3454', 'SCB', '2025-04-20 00:29:00', 88),
(103, '6309650122', '5473', 'BBL', '2025-04-20 00:29:00', 69),
(104, '6309650122', '4750', 'SCB', '2025-04-20 01:39:00', 90),
(105, '6309650122', '3225', 'KTB', '2025-04-20 02:50:00', 82),
(106, '6309650122', '1243', 'BBL', '2025-04-21 01:08:00', 92),
(107, '6309650122', '6543', 'TTB', '2025-04-21 01:08:00', 93),
(108, '6309650122', '6658', 'SCB', '2025-04-22 23:33:00', 89),
(109, '6309650163', '4774', 'TTB', '2025-04-23 01:34:00', 94),
(110, '6309650122', '6806', 'BAY', '2025-04-24 03:27:00', 95),
(111, '6309650122', '5437', 'SCB', '2025-04-24 03:28:00', 96),
(112, '6309650122', '6858', 'TTB', '2025-04-29 15:16:00', 97),
(113, '6309650122', '6534', 'SCB', '2025-04-30 03:20:00', 98),
(114, '6309650122', '4325', 'SCB', '2025-04-30 05:23:00', 99),
(115, '6309650122', '7667', 'BBL', '2025-05-01 00:14:00', 100),
(116, '6309650122', '4535', 'SCB', '2025-05-07 03:02:00', 103),
(117, '6309650122', '5436', 'SCB', '2025-05-08 01:49:00', 104),
(118, '6309650122', '7564', 'BBL', '2025-05-08 03:30:00', 105),
(119, '6309650122', '8787', 'SCB', '2025-05-08 03:42:00', 106),
(120, '6309650122', '8009', 'BBL', '2025-05-13 01:58:00', 107),
(121, '6309650122', '7566', 'BAY', '2025-05-13 23:35:00', 108),
(122, '6309650122', '8568', 'UOBT', '2025-05-13 23:35:00', 109),
(123, '6309650122', '6635', 'TTB', '2025-05-15 01:20:00', 111),
(124, '6309650122', '8787', 'BBL', '2025-05-19 15:10:00', 111),
(125, '6309650122', '5546', 'BBL', '2025-05-19 15:10:00', 112);

-- --------------------------------------------------------

--
-- Table structure for table `Role`
--

CREATE TABLE `Role` (
  `roleID` varchar(1) NOT NULL,
  `roleName` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `Role`
--

INSERT INTO `Role` (`roleID`, `roleName`) VALUES
('1', 'GeneralUser'),
('2', 'SuperStaff'),
('3', 'Staff');

-- --------------------------------------------------------

--
-- Table structure for table `Shift`
--

CREATE TABLE `Shift` (
  `shiftID` varchar(1) NOT NULL,
  `shiftInfo` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `Shift`
--

INSERT INTO `Shift` (`shiftID`, `shiftInfo`) VALUES
('1', '17:00-17:30'),
('2', '17:30-18:00'),
('3', '17:00-18:00');

-- --------------------------------------------------------

--
-- Table structure for table `TargetLane`
--

CREATE TABLE `TargetLane` (
  `targetLaneID` int(11) NOT NULL,
  `isActive` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `TargetLane`
--

INSERT INTO `TargetLane` (`targetLaneID`, `isActive`) VALUES
(101, NULL),
(102, NULL),
(103, NULL),
(104, NULL),
(105, NULL),
(106, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `User`
--

CREATE TABLE `User` (
  `username` varchar(256) NOT NULL,
  `name` varchar(50) DEFAULT NULL,
  `telNumber` varchar(10) DEFAULT NULL,
  `roleID` varchar(1) DEFAULT '1',
  `isActive` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `User`
--

INSERT INTO `User` (`username`, `name`, `telNumber`, `roleID`, `isActive`) VALUES
('6301650999', 'komsak sakkom', '0901234567', '1', NULL),
('6309650122', 'natida prasittham', '0888582296', '2', NULL),
('6309650163', 'apisara sukaram', '0819104448', '3', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `WorkSchedule`
--

CREATE TABLE `WorkSchedule` (
  `workID` int(11) NOT NULL,
  `username` varchar(20) DEFAULT NULL,
  `workingDate` date DEFAULT NULL,
  `workingShift` int(1) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `WorkSchedule`
--

INSERT INTO `WorkSchedule` (`workID`, `username`, `workingDate`, `workingShift`, `isActive`) VALUES
(11, '6309650122', '2024-10-15', 3, NULL),
(12, '6309650122', '2024-10-22', 3, NULL),
(13, '6309650122', '2024-10-29', 3, NULL),
(14, '6309650122', '2024-11-05', 3, NULL),
(15, '6309650122', '2024-11-19', 3, NULL),
(16, '6309650122', '2024-11-20', 1, NULL),
(17, '6309650122', '2025-03-06', 3, NULL),
(18, '6309650122', '2025-03-07', 3, NULL),
(19, '6309650122', '2025-03-14', 3, NULL),
(20, '6309650122', '2025-03-15', 3, NULL),
(21, '6309650122', '2025-03-27', 3, NULL),
(27, '6309650122', '2025-04-17', 3, NULL),
(28, '6309650122', '2025-04-23', 3, NULL),
(29, '6309650122', '2025-04-25', 3, NULL),
(30, '6309650122', '2025-04-22', 3, NULL),
(31, '6309650122', '2025-04-08', 3, NULL),
(32, '6309650122', '2025-05-02', 3, NULL),
(33, '6309650122', '2025-05-06', 3, NULL),
(36, '6309650122', '2025-04-11', 3, NULL),
(39, '6309650122', '2025-04-10', 2, NULL),
(40, '6309650122', '2025-04-03', 3, NULL),
(43, '6309650122', '2025-04-09', 3, NULL),
(44, '6309650122', '2025-04-10', 3, NULL),
(47, '6309650122', '2025-04-21', 3, NULL),
(51, '6309650122', '2025-04-29', 3, NULL),
(53, '6309650122', '2025-04-24', 3, NULL),
(56, '6309650122', '2025-04-30', 3, NULL),
(57, '6309650163', '2025-04-23', 3, NULL),
(58, '6309650163', '2025-04-24', 3, NULL),
(59, '6309650163', '2025-04-25', 3, NULL),
(60, '6309650163', '2025-04-28', 3, NULL),
(61, '6309650163', '2025-04-30', 3, NULL),
(62, '6309650122', '2025-04-28', 1, NULL),
(64, '6309650122', '2025-05-08', 3, NULL),
(66, '6309650122', '2025-05-07', 3, NULL),
(67, '6309650122', '2025-05-13', 3, NULL),
(68, '6309650122', '2025-05-14', 3, NULL),
(69, '6309650122', '2025-05-15', 3, NULL),
(70, '6309650122', '2025-05-16', 3, NULL),
(74, '6309650122', '2025-05-19', 3, NULL),
(75, '6309650122', '2025-05-20', 3, NULL),
(76, '6309650122', '2025-05-21', 1, NULL),
(77, '6309650122', '2025-05-26', 3, NULL),
(78, '6309650122', '2025-05-27', 3, NULL),
(79, '6309650122', '2025-05-28', 3, NULL),
(80, '6309650122', '2025-05-29', 3, NULL),
(81, '6309650122', '2025-05-30', 3, NULL),
(82, '6309650163', '2025-05-27', 3, NULL),
(83, '6309650163', '2025-05-26', 3, NULL),
(84, '6309650163', '2025-05-28', 3, NULL),
(85, '6309650163', '2025-05-29', 1, NULL),
(86, '6309650163', '2025-05-30', 2, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `Booking`
--
ALTER TABLE `Booking`
  ADD PRIMARY KEY (`bookingID`),
  ADD KEY `paymentID` (`paymentID`),
  ADD KEY `targetLaneID` (`targetLaneID`),
  ADD KEY `shiftID` (`shiftID`),
  ADD KEY `bookingStatusID` (`bookingStatusID`),
  ADD KEY `username` (`username`);

--
-- Indexes for table `BookingStatus`
--
ALTER TABLE `BookingStatus`
  ADD PRIMARY KEY (`bookingStatusID`);

--
-- Indexes for table `holidays`
--
ALTER TABLE `holidays`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_holiday` (`day`,`month`,`year`);

--
-- Indexes for table `operationDay`
--
ALTER TABLE `operationDay`
  ADD PRIMARY KEY (`operationID`);

--
-- Indexes for table `Payment`
--
ALTER TABLE `Payment`
  ADD PRIMARY KEY (`paymentID`),
  ADD KEY `username` (`username`),
  ADD KEY `bookingID` (`bookingID`);

--
-- Indexes for table `Role`
--
ALTER TABLE `Role`
  ADD PRIMARY KEY (`roleID`);

--
-- Indexes for table `Shift`
--
ALTER TABLE `Shift`
  ADD PRIMARY KEY (`shiftID`);

--
-- Indexes for table `TargetLane`
--
ALTER TABLE `TargetLane`
  ADD PRIMARY KEY (`targetLaneID`);

--
-- Indexes for table `User`
--
ALTER TABLE `User`
  ADD PRIMARY KEY (`username`),
  ADD KEY `roleID` (`roleID`);

--
-- Indexes for table `WorkSchedule`
--
ALTER TABLE `WorkSchedule`
  ADD PRIMARY KEY (`workID`),
  ADD KEY `username` (`username`),
  ADD KEY `shiftID` (`workingShift`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `Booking`
--
ALTER TABLE `Booking`
  MODIFY `bookingID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=113;

--
-- AUTO_INCREMENT for table `holidays`
--
ALTER TABLE `holidays`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT for table `operationDay`
--
ALTER TABLE `operationDay`
  MODIFY `operationID` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `Payment`
--
ALTER TABLE `Payment`
  MODIFY `paymentID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=126;

--
-- AUTO_INCREMENT for table `WorkSchedule`
--
ALTER TABLE `WorkSchedule`
  MODIFY `workID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=87;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `Booking`
--
ALTER TABLE `Booking`
  ADD CONSTRAINT `booking_ibfk_1` FOREIGN KEY (`targetLaneID`) REFERENCES `TargetLane` (`targetLaneID`),
  ADD CONSTRAINT `booking_ibfk_2` FOREIGN KEY (`shiftID`) REFERENCES `Shift` (`shiftID`),
  ADD CONSTRAINT `booking_ibfk_3` FOREIGN KEY (`bookingStatusID`) REFERENCES `BookingStatus` (`bookingStatusID`),
  ADD CONSTRAINT `booking_ibfk_4` FOREIGN KEY (`username`) REFERENCES `User` (`username`);

--
-- Constraints for table `Payment`
--
ALTER TABLE `Payment`
  ADD CONSTRAINT `payment_ibfk_1` FOREIGN KEY (`username`) REFERENCES `User` (`username`),
  ADD CONSTRAINT `payment_ibfk_2` FOREIGN KEY (`bookingID`) REFERENCES `Booking` (`bookingID`);

--
-- Constraints for table `User`
--
ALTER TABLE `User`
  ADD CONSTRAINT `roleID` FOREIGN KEY (`roleID`) REFERENCES `Role` (`roleID`);

--
-- Constraints for table `WorkSchedule`
--
ALTER TABLE `WorkSchedule`
  ADD CONSTRAINT `workschedule_ibfk_1` FOREIGN KEY (`username`) REFERENCES `User` (`username`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
