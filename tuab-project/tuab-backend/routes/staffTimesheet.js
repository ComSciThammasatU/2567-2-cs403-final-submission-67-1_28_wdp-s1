var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
const axios = require('axios');
var jwt = require('jsonwebtoken');

var connection = require('../connection/db.js');

// API สำหรับดึงข้อมูลสต๊าฟตามวันที่เลือก
// ในไฟล์ staffTimesheet.js ที่มีอยู่แล้ว
router.get('/', (req, res) => {
  const { selectedDate, startDate, endDate, username } = req.query;
  
  let query, params;
  
  if (selectedDate) {
    // กรณีใช้ selectedDate (สำหรับหน้าอื่น ๆ)
    query = `
      SELECT w.workID, w.username, w.workingDate, w.workingShift, u.name
      FROM WorkSchedule w
      JOIN User u ON w.username = u.username
      WHERE w.workingDate = ? AND w.isActive IS NULL
      ORDER BY w.workingDate, w.workingShift
    `;
    params = [selectedDate];
  } else if (startDate && endDate) {
    // กรณีใช้ช่วงวันที่ (สำหรับหน้า Staff Timesheet)
    if (username) {
      query = `
        SELECT w.workID, w.username, w.workingDate, w.workingShift, u.name
        FROM WorkSchedule w
        JOIN User u ON w.username = u.username
        WHERE w.workingDate BETWEEN ? AND ? AND w.username = ? AND w.isActive IS NULL
        ORDER BY w.workingDate, w.workingShift
      `;
      params = [startDate, endDate, username];
    } else {
      query = `
        SELECT w.workID, w.username, w.workingDate, w.workingShift, u.name
        FROM WorkSchedule w
        JOIN User u ON w.username = u.username
        WHERE w.workingDate BETWEEN ? AND ? AND w.isActive IS NULL
        ORDER BY w.workingDate, w.workingShift
      `;
      params = [startDate, endDate];
    }
  } else {
    return res.status(400).json({ 
      success: false, 
      message: 'ต้องระบุ selectedDate หรือ startDate และ endDate' 
    });
  }
  
  connection.query(query, params, function(err, results) {
    if (err) {
      console.error('Error fetching timesheet data:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch timesheet data' });
      return;
    }
    res.json({ success: true, staff: results });
  });
});

module.exports = router;
