var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
const axios = require('axios');
var jwt = require('jsonwebtoken');

var connection = require('../connection/db.js');

// Check opening and closing dates for all archery fields.
router.get('/', jsonParser, function(req, res, next) {
  // แก้ไข SQL query เพื่อดึงฟิลด์ description ด้วย
  connection.execute("SELECT startDate, endDate, operationID, description FROM operationDay ORDER BY operationID DESC", 
  (err, rows) => {
    if (err) {
      console.error('Error executing SELECT query:', err);
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }
    
    const formattedRows = rows.map(row => {
      const { startDate, endDate, operationID, description } = row;
      
      // แปลงรูปแบบวันที่ startDate
      const startDateObject = new Date(startDate);
      const formattedStartDate = startDateObject.toLocaleDateString('en-GB', { 
        year: 'numeric', month: '2-digit', day: '2-digit' 
      }).split('/').reverse().join('-');
      
      // แปลงรูปแบบวันที่ endDate
      const endDateObject = new Date(endDate);
      const formattedEndDate = endDateObject.toLocaleDateString('en-GB', { 
        year: 'numeric', month: '2-digit', day: '2-digit' 
      }).split('/').reverse().join('-');
      
      return {
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        operationID,
        description: description || '' // เพิ่มฟิลด์ description
      };
    });
    
    res.json(formattedRows);
  });
});
   
module.exports = router;