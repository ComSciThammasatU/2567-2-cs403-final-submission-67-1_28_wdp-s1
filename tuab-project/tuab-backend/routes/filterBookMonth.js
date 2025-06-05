var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
const axios = require('axios');
var jwt = require('jsonwebtoken');

var connection = require('../connection/db.js');

// View a user's booking history by filtering it to show only that month.
router.get('/', jsonParser, function(req, res, next) {
    const { username } = req.query;
    
    // ✅ เพิ่มส่วนนี้: Auto-cancel expired pending bookings
    const today = new Date();
    today.setHours(0, 0, 0, 0); // ตั้งเป็น 00:00:00
    
    // อัพเดตสถานะการจองที่หมดอายุ (Pending + วันที่ผ่านมาแล้ว)
    connection.execute(
        `UPDATE Booking 
         SET bookingStatusID = 3, 
             cancelTime = NOW() 
         WHERE bookingStatusID = 1 
         AND bookingDate < ?`,
        [today.toISOString().split('T')[0]], // Format: YYYY-MM-DD
        (err, updateResult) => {
            if (err) {
                console.error('Error auto-canceling expired bookings:', err);
            } else if (updateResult.affectedRows > 0) {
                console.log(`Auto-canceled ${updateResult.affectedRows} expired pending bookings for user: ${username}`);
            }
            
            // ✅ ย้ายโค้ดเดิมมาอยู่ในฟังก์ชันนี้
            fetchBookingHistory();
        }
    );
    
    // ✅ สร้างฟังก์ชันแยกสำหรับดึงข้อมูลการจอง
    function fetchBookingHistory() {
        connection.execute(
          "SELECT bookingDate, targetLaneID, shiftID, bookingStatusID, bookingID, cancelTime, confirmTime FROM Booking WHERE username = ? ORDER BY bookingDate DESC, targetLaneID ASC",
          [username],
          (err, rows) => {
            if (err) {
              console.error('Error executing SELECT query:', err);
              return res.status(500).json({ error: 'Database error' });
            }
            
            const formattedRows = rows.map(row => {
                const dateObject = new Date(row.bookingDate);
                const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
                const formattedDate = dateObject.toLocaleDateString('en-GB', options)
                .split('/')
                .reverse()
                .join('-');
                
                let lane;
                if (row.targetLaneID >= 101 && row.targetLaneID <= 106) {
                    lane = row.targetLaneID - 100;
                } else {
                    lane = row.targetLaneID; // ให้ใช้ค่าดั้งเดิมถ้าไม่อยู่ในช่วง 101-106
                }
                
                let shift;
                if (row.shiftID === '1') {
                    shift = '17:00';
                } else if (row.shiftID === '2') {
                    shift = '17:30';
                } else {
                    shift = row.shiftID; // ใช้ค่าเดิมถ้าไม่ตรงกับเงื่อนไข
                }
                
                // จัดรูปแบบเวลาที่ยกเลิก
                let formattedCancelTime = null;
                if (row.cancelTime) {
                    formattedCancelTime = formatDateTime(row.cancelTime);
                }
                
                // จัดรูปแบบเวลาที่ยืนยัน
                let formattedConfirmTime = null;
                if (row.confirmTime) {
                    formattedConfirmTime = formatDateTime(row.confirmTime);
                }
                
                return {
                    bookingDate: formattedDate,
                    targetLaneID: lane,
                    shiftID: shift,
                    bookingStatusID: row.bookingStatusID,
                    bookingID: row.bookingID,
                    cancelTime: formattedCancelTime,
                    confirmTime: formattedConfirmTime
                };
            });
            
            res.json(formattedRows);
          }
        );
    }
});

// ฟังก์ชันจัดรูปแบบวันที่และเวลาเป็นเวลาไทย
function formatDateTime(dateTimeString) {
  if (!dateTimeString) return '';
  
  try {
    console.log('Input datetime:', dateTimeString);
    
    const dateTime = new Date(dateTimeString);
    
    // ตรวจสอบความถูกต้องของวันที่
    if (isNaN(dateTime.getTime())) {
      console.error('Invalid date format:', dateTimeString);
      return dateTimeString;
    }
    
    // เพิ่มเวลา 7 ชั่วโมงเพื่อให้เป็นเวลาไทย
    const thaiTime = new Date(dateTime.getTime() + (7 * 60 * 60 * 1000));
    
    // จัดรูปแบบวันที่ DD/MM/YYYY
    const day = thaiTime.getUTCDate().toString().padStart(2, '0');
    const month = (thaiTime.getUTCMonth() + 1).toString().padStart(2, '0');
    const year = thaiTime.getUTCFullYear();
    
    // จัดรูปแบบเวลา HH:MM
    const hours = thaiTime.getUTCHours().toString().padStart(2, '0');
    const minutes = thaiTime.getUTCMinutes().toString().padStart(2, '0');
    
    const formattedTime = `${day}/${month}/${year} ${hours}:${minutes}`;
    console.log('Formatted datetime:', formattedTime);
    
    return formattedTime;
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return dateTimeString;
  }
}

module.exports = router;