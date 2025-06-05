var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
const axios = require('axios');
var jwt = require('jsonwebtoken');

var connection = require('../connection/db.js');

// Browse user's booking history.
router.get('/', jsonParser, function(req, res, next) {
    const { username } = req.query;

    // ตรวจสอบว่ามี username หรือไม่
    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    connection.execute(
        "SELECT bookingDate, targetLaneID, shiftID, bookingStatusID, bookingID FROM Booking WHERE username = ?",
        [username],
        (err, rows) => {
            if (err) {
                console.error('Error executing SELECT query:', err);
                return res.status(500).json({ error: 'Database error', details: err.message });
            }
            
            console.log(`Found ${rows.length} bookings for user ${username}`);
            
            const formattedRows = rows.map(row => {
                const { bookingDate, targetLaneID, shiftID, bookingStatusID, bookingID } = row;
                
                // แปลงวันที่เป็นรูปแบบ YYYY-MM-DD
                const dateObject = new Date(bookingDate);
                const year = dateObject.getFullYear();
                const month = String(dateObject.getMonth() + 1).padStart(2, '0');
                const day = String(dateObject.getDate()).padStart(2, '0');
                const formattedDate = `${year}-${month}-${day}`;
                
                let lane;
                // ถ้าในฐานข้อมูลเก็บเป็น 101-106 แล้วต้องการแสดงเป็น 1-6
                if (targetLaneID >= 101 && targetLaneID <= 106) {
                    lane = targetLaneID - 100;
                } else {
                    lane = targetLaneID;
                }
                
                let shift;
                if (shiftID === '1') {
                    shift = '17:00';
                } else if (shiftID === '2') {
                    shift = '17:30';
                } else {
                    shift = shiftID; // ใช้ค่าเดิมถ้าไม่ตรงกับเงื่อนไข
                }
                
                console.log(`Formatted booking: ${formattedDate}, Lane ${lane}, Shift ${shift}, Status ${bookingStatusID}`);
                
                return {
                    bookingDate: formattedDate,
                    originalDate: bookingDate, // เก็บวันที่ต้นฉบับไว้ดูด้วย
                    targetLaneID: lane,
                    originalLaneID: targetLaneID, // เก็บ Lane ID ต้นฉบับไว้ดูด้วย
                    shiftID: shift,
                    bookingStatusID,
                    bookingID
                };
            });
            
            res.json(formattedRows);
        }
    );
});
  
module.exports = router;