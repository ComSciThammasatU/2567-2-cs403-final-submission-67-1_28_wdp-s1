var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
const axios = require('axios');
var jwt = require('jsonwebtoken');

var connection = require('../connection/db.js');

// ใน countShiftStaff.js

router.get('/', (req, res) => {
    const { start, end } = req.query;
    
    // SQL query ที่คำนวณจำนวนชิฟท์อย่างถูกต้อง โดยนับ workingShift = 3 เป็น 2 ครั้ง
    const query = `
      SELECT 
        w.username, 
        u.name, 
        SUM(CASE WHEN w.workingShift = 3 THEN 2 ELSE 1 END) as totalShifts
      FROM WorkSchedule w
      JOIN User u ON w.username = u.username
      WHERE w.workingDate BETWEEN ? AND ? AND w.isActive IS NULL
      GROUP BY w.username, u.name
      ORDER BY totalShifts DESC
    `;
    
    connection.query(query, [start, end], function(err, results) {
      if (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch staff shifts data' });
        return;
      }
      res.json(results);
    });
});

module.exports = router;