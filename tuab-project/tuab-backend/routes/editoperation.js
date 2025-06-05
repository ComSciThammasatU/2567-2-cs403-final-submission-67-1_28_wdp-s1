var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
const axios = require('axios');
require('dotenv').config();
var connection = require('../connection/db.js');

// Edit and update the opening and closing times of the archery field.
router.post('/', jsonParser, function(req, res, next) {
  const { opID, Nstart, Nend, description } = req.body;
  
  // ตรวจสอบว่า Nstart, และ Nend มีค่า และ Nstart กับ Nend ต้องไม่เป็นวันเดียวกัน
  if (!Nstart || !Nend || Nstart === Nend) {
    return res.status(400).json({ 
      status: 'error', 
      message: 'Missing startDate or endDate or startDate is the same day with endDate' 
    });
  }
  
  // ถ้ามี opID แสดงว่าเป็นการอัพเดท (ส่วนนี้อาจไม่จำเป็นแล้ว ถ้าต้องการเก็บประวัติทั้งหมด)
  if (opID) {
    connection.execute(
      "UPDATE operationDay SET startDate = ?, endDate = ?, description = ? WHERE operationID = ?",
      [Nstart, Nend, description || null, opID],
      (err, results) => {
        if (err) {
          console.error('Error updating operation:', err);
          return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
        }
        
        if (results.affectedRows > 0) {
          return res.json({ 
            status: 'ok', 
            message: 'Operation updated successfully', 
            operationID: opID 
          });
        } else {
          return res.status(404).json({ 
            status: 'error', 
            message: 'Operation not found or no changes made' 
          });
        }
      }
    );
  } else {
    // ไม่มี opID แสดงว่าเป็นการเพิ่มใหม่ (ตรงนี้จะเป็นโฟลว์หลักเมื่อเราไม่ส่ง opID จาก frontend)
    connection.execute(
      "INSERT INTO operationDay (startDate, endDate, description) VALUES (?, ?, ?)",
      [Nstart, Nend, description || null],
      (err, results) => {
        if (err) {
          console.error('Error inserting operation:', err);
          return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
        }
        
        if (results.insertId) {
          res.json({ 
            status: 'ok', 
            message: 'Operation added successfully', 
            operationID: results.insertId 
          });
        } else {
          res.status(400).json({ 
            status: 'error', 
            message: 'Failed to add operation' 
          });
        }
      }
    );
  }
});

module.exports = router;