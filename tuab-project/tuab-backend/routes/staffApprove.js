var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
const axios = require('axios');
require('dotenv').config();
var connection = require('../connection/db.js');

// Staff updates the user's booking status.
router.post('/', jsonParser, function(req, res, next) {
  const { bookId, status } = req.body;
  
  if (!bookId || !status) {
    return res.status(400).json({ status: 'error', message: 'Missing bookingID or status' });
  }

  let query = "UPDATE Booking SET bookingStatusID = ? WHERE bookingID = ?";
  let params = [status, bookId];

  // เพิ่มการบันทึกเวลาสำหรับสถานะยืนยันหรือยกเลิก
  if (parseInt(status) === 2 || parseInt(status) === 3) {
    const now = new Date();
    
    // ใช้ bookId เพื่อสร้างวินาทีที่ไม่ซ้ำกัน
    const seconds = parseInt(bookId) % 60;
    
    // สร้างเวลาในรูปแบบ YYYY-MM-DD HH:MM:SS
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const secondsStr = seconds.toString().padStart(2, '0');
    
    const timestampStr = `${year}-${month}-${day} ${hours}:${minutes}:${secondsStr}`;
    
    if (parseInt(status) === 2) {
      // สถานะยืนยัน (confirm)
      query = "UPDATE Booking SET bookingStatusID = ?, confirmTime = ? WHERE bookingID = ?";
      params = [status, timestampStr, bookId];
    } else if (parseInt(status) === 3) {
      // สถานะยกเลิก (cancel)
      query = "UPDATE Booking SET bookingStatusID = ?, cancelTime = ? WHERE bookingID = ?";
      params = [status, timestampStr, bookId];
    }
  }

  connection.execute(
    query,
    params,
    (err, results) => {
      if (err) {
        console.error('Error updating status for booking:', err);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
      }
  
      if (results.affectedRows === 0) {
        return res.status(404).json({ status: 'error', message: 'Booking not found' });
      }
  
      res.json({ status: 'ok', message: 'Status updated successfully' });
    }
  );
});

module.exports = router;