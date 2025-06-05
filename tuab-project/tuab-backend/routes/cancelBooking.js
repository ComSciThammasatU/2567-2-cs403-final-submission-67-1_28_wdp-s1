var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
const axios = require('axios');
require('dotenv').config();
var connection = require('../connection/db.js');

// Send the user's canceled status to update in the Database.
router.post('/', jsonParser, function(req, res, next) {
  // รับพารามิเตอร์ทั้งหมด
  const { date, username, status, targetLaneID, shiftID } = req.body;
  
  console.log('Received cancellation request with parameters:', req.body);
  
  if (!date || !username || !status) {
    console.error('Missing required parameters:', { date, username, status });
    return res.status(400).json({ 
      status: 'error', 
      message: 'Missing username or status or date' 
    });
  }
  
  // ตรวจสอบค่า targetLaneID
  if (targetLaneID === undefined || targetLaneID === null) {
    console.error('Missing targetLaneID parameter');
    return res.status(400).json({ 
      status: 'error', 
      message: 'Missing targetLaneID parameter' 
    });
  }
  
  // ตรวจสอบค่า shiftID
  if (shiftID === undefined || shiftID === null) {
    console.error('Missing shiftID parameter');
    return res.status(400).json({ 
      status: 'error', 
      message: 'Missing shiftID parameter' 
    });
  }
  
  // แปลง targetLaneID เป็นตัวเลข
  const laneID = parseInt(targetLaneID);
  if (isNaN(laneID)) {
    console.error('Invalid targetLaneID:', targetLaneID);
    return res.status(400).json({ 
      status: 'error', 
      message: 'Invalid targetLaneID, must be a number' 
    });
  }
  
  // แปลง shiftID จากเวลาเป็นค่าตัวเลข (ถ้าจำเป็น)
  let shift = shiftID;
  if (shiftID === '17:00') {
    shift = '1';
  } else if (shiftID === '17:30') {
    shift = '2';
  }
  
  // วิธีที่ถูกต้องในการสร้างเวลาไทย
  const now = new Date();
  
  // บวกเพิ่ม 7 ชั่วโมงเพื่อให้เป็นเวลาไทย
  const thaiTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
  
  // จัดรูปแบบให้เป็น YYYY-MM-DD HH:MM:SS สำหรับเก็บในฐานข้อมูล MySQL
  const year = thaiTime.getUTCFullYear();
  const month = String(thaiTime.getUTCMonth() + 1).padStart(2, '0');
  const day = String(thaiTime.getUTCDate()).padStart(2, '0');
  const hours = String(thaiTime.getUTCHours()).padStart(2, '0');
  const minutes = String(thaiTime.getUTCMinutes()).padStart(2, '0');
  const seconds = String(thaiTime.getUTCSeconds()).padStart(2, '0');
  
  const cancelTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  
  // ตรวจสอบและแปลงรูปแบบวันที่ให้ถูกต้อง
  let formattedDate = date;
  
  // ถ้าวันที่มาในรูปแบบ DD-MM-YYYY ให้แปลงเป็น YYYY-MM-DD
  if (date.includes('-')) {
    const parts = date.split('-');
    if (parts.length === 3 && parts[2].length === 4) {
      // กรณีเป็น DD-MM-YYYY
      formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
  }
  
  console.log('UTC time:', now.toISOString());
  console.log('Thai time formatted:', cancelTime);
  console.log('Cancel parameters:', { 
    originalDate: date,
    formattedDate: formattedDate, 
    username: username, 
    status: status, 
    targetLaneID: laneID,
    shiftID: shift
  });

  // แสดงข้อมูลที่จะใช้ในการยกเลิก
  console.log('Cancellation parameters for SQL:');
  console.log({
    bookingDate: formattedDate,
    username: username,
    targetLaneID: laneID,
    shiftID: shift,
    newStatus: status,
    cancelTime: cancelTime
  });
  
  // ลองค้นหาข้อมูลการจองก่อนที่จะอัปเดต เพื่อตรวจสอบว่ามีการจองอยู่จริง
  // เพิ่ม shiftID ในเงื่อนไขการค้นหา
  connection.execute(
    "SELECT * FROM Booking WHERE bookingDate = ? AND username = ? AND targetLaneID = ? AND shiftID = ?",
    [formattedDate, username, laneID, shift],
    (checkErr, checkResults) => {
      if (checkErr) {
        console.error('Error checking booking existence:', checkErr);
        return res.status(500).json({ 
          status: 'error', 
          message: 'Error checking booking existence',
          error: checkErr.message
        });
      }
      
      if (checkResults.length === 0) {
        console.log('Booking not found. Trying to find any existing bookings for user');
        
        // ตรวจสอบว่ามีการจองใดๆ ของผู้ใช้นี้หรือไม่
        connection.execute(
          "SELECT bookingDate, targetLaneID, shiftID, bookingStatusID FROM Booking WHERE username = ?",
          [username],
          (userErr, userResults) => {
            if (userErr) {
              console.error('Error checking user bookings:', userErr);
              return res.status(500).json({ 
                status: 'error', 
                message: 'Error checking user bookings',
                error: userErr.message
              });
            }
            
            console.log('Found user bookings:', userResults.length);
            if (userResults.length > 0) {
              console.log('Available bookings for user:', userResults);
            }
            
            return res.status(404).json({ 
              status: 'error', 
              message: 'Booking not found with the provided criteria',
              debug: {
                searchCriteria: { 
                  date: formattedDate, 
                  username, 
                  targetLaneID: laneID,
                  shiftID: shift
                },
                userBookings: userResults.map(b => ({
                  date: b.bookingDate,
                  lane: b.targetLaneID,
                  shift: b.shiftID,
                  status: b.bookingStatusID
                }))
              }
            });
          }
        );
        return;
      }
      
      // ถ้าพบข้อมูลการจอง ดำเนินการอัปเดตสถานะ
      console.log('Found booking to cancel:', checkResults[0]);
      
      // เพิ่ม shiftID ในเงื่อนไขการอัปเดต SQL
      const sql = "UPDATE Booking SET bookingStatusID = ?, cancelTime = ? WHERE bookingDate = ? AND username = ? AND targetLaneID = ? AND shiftID = ?";
      const params = [status, cancelTime, formattedDate, username, laneID, shift];
      
      console.log('Executing SQL:', sql);
      console.log('With parameters:', params);
      
      connection.execute(
        sql,
        params,
        (err, results) => {
          if (err) {
            console.error('Error updating status for user:', err);
            return res.status(500).json({ 
              status: 'error', 
              message: 'Internal Server Error',
              error: err.message
            });
          }
          
          if (results.affectedRows === 0) {
            console.error('No rows affected despite booking found.');
            return res.status(500).json({ 
              status: 'error', 
              message: 'Failed to update booking status'
            });
          }
          
          console.log('Booking successfully canceled. Affected rows:', results.affectedRows);
          res.json({
            status: 'ok',
            message: 'status cancel updated successfully',
            cancelTime: cancelTime,
            affectedRows: results.affectedRows
          });
        }
      );
    }
  );
});

module.exports = router;