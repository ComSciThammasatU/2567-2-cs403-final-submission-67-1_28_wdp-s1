var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
const axios = require('axios');
var jwt = require('jsonwebtoken');

var connection = require('../connection/db.js');

// Browse user's booking history.
// booking-schedule.js - ดึงข้อมูลการจองตามช่วงเดือน
router.get('/', jsonParser, function(req, res, next) {
    const { startDate, endDate } = req.query;
    
    // ตรวจสอบพารามิเตอร์
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }
    
    // ดึงข้อมูลการจองทั้งหมดในช่วงวันที่ที่ระบุ
    connection.execute(
      "SELECT DISTINCT DATE_FORMAT(bookingDate, '%Y-%m-%d') AS bookingDate FROM Booking WHERE bookingDate BETWEEN ? AND ? AND bookingStatusID IN (1, 2)",
      [startDate, endDate],
      (err, rows) => {
        if (err) {
          console.error('Error executing SELECT query:', err);
          return res.status(500).json({ error: 'Database error', details: err.message });
        }
        
        // ส่งรายการวันที่มีการจอง
        const bookedDates = rows.map(row => row.bookingDate);
        res.json(bookedDates);
      }
    );
  });
  
module.exports = router;