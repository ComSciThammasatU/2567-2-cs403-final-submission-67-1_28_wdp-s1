var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
const axios = require('axios');
var jwt = require('jsonwebtoken');

var connection = require('../connection/db.js');

// Check the opening and closing times of the archery field.
router.get('/', jsonParser, function(req, res, next) {
  const { workDate } = req.query;

  // ตรวจสอบ workDate
  if (!workDate) {
    // ถ้า workDate ไม่มีค่า ให้ส่ง response ที่เหมาะสม
    return res.status(400).json({ error: 'workDate is required' }); // หรือ res.json([]);
  }


  connection.execute("SELECT workingDate, workingShift FROM WorkSchedule WHERE workingDate = ?",
  [workDate],
  (err, rows) => {
      if (err) {
        console.error('Error executing SELECT query:', err);
        return;
      }
      res.json(rows)
  })
})
  
module.exports = router;