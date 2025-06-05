var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
const axios = require('axios');
require('dotenv').config();
var connection = require('../connection/db.js');

// Get all operation days with pagination
router.get('/', function(req, res, next) {
  // รับพารามิเตอร์สำหรับการแบ่งหน้า
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const offset = (page - 1) * limit;
  
  // รับพารามิเตอร์สำหรับการกรอง (ถ้ามี)
  const startDate = req.query.startDate || null;
  const endDate = req.query.endDate || null;
  const searchTerm = req.query.search || null;
  
  // สร้าง query พื้นฐาน
  let query = "SELECT operationID, startDate, endDate, description FROM operationDay";
  let countQuery = "SELECT COUNT(*) AS total FROM operationDay";
  
  // สร้างเงื่อนไขสำหรับการกรอง
  let conditions = [];
  let queryParams = [];
  
  if (startDate) {
    conditions.push("endDate >= ?");
    queryParams.push(startDate);
  }
  
  if (endDate) {
    conditions.push("startDate <= ?");
    queryParams.push(endDate);
  }
  
  if (searchTerm) {
    conditions.push("(description LIKE ? OR operationID LIKE ?)");
    queryParams.push(`%${searchTerm}%`);
    queryParams.push(`%${searchTerm}%`);
  }
  
  // เพิ่มเงื่อนไขเข้าไปใน query
  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
    countQuery += " WHERE " + conditions.join(" AND ");
  }
  
  // เพิ่มการเรียงลำดับและการแบ่งหน้า
  query += " ORDER BY startDate DESC LIMIT ? OFFSET ?";
  queryParams.push(limit);
  queryParams.push(offset);
  
  // ทำ query เพื่อนับจำนวนทั้งหมดก่อน
  connection.query(countQuery, queryParams.slice(0, -2), (err, countResults) => {
    if (err) {
      console.error('Error counting operation days:', err);
      return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
    
    const totalCount = countResults[0].total;
    const totalPages = Math.ceil(totalCount / limit);
    
    // ทำ query เพื่อดึงข้อมูล
    connection.query(query, queryParams, (err, results) => {
      if (err) {
        console.error('Error fetching operation days:', err);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
      }
      
      // แปลงรูปแบบวันที่โดยใช้ local timezone แทน toISOString
      const formattedResults = results.map(row => {
        // ฟังก์ชันช่วยรักษา local timezone
        function formatLocalDate(date) {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        }
        
        return {
          operationID: row.operationID,
          startDate: formatLocalDate(row.startDate),
          endDate: formatLocalDate(row.endDate),
          description: row.description
        };
      });
      
      // ส่งข้อมูลกลับพร้อมข้อมูลการแบ่งหน้า
      res.json({
        status: 'ok',
        data: formattedResults,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      });
    });
  });
});

// Get operation day by ID
router.get('/:id', function(req, res, next) {
  const operationId = req.params.id;
  
  const query = "SELECT operationID, startDate, endDate, description FROM operationDay WHERE operationID = ?";
  
  connection.query(query, [operationId], (err, results) => {
    if (err) {
      console.error('Error fetching operation day:', err);
      return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Operation day not found' });
    }
    
    // แปลงรูปแบบวันที่โดยใช้ local timezone
    const row = results[0];
    function formatLocalDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
    const formattedResult = {
      operationID: row.operationID,
      startDate: formatLocalDate(row.startDate),
      endDate: formatLocalDate(row.endDate),
      description: row.description
    };
    
    res.json({ status: 'ok', data: formattedResult });
  });
});

// Create new operation day
router.post('/', jsonParser, function(req, res, next) {
  const { startDate, endDate, description } = req.body;
  
  // ตรวจสอบความถูกต้องของข้อมูล
  if (!startDate || !endDate) {
    return res.status(400).json({ status: 'error', message: 'Start date and end date are required' });
  }
  
  // ตรวจสอบว่าวันที่เริ่มต้นต้องไม่มากกว่าวันที่สิ้นสุด
  if (new Date(startDate) > new Date(endDate)) {
    return res.status(400).json({ status: 'error', message: 'Start date must be before end date' });
  }
  
  const query = "INSERT INTO operationDay (startDate, endDate, description) VALUES (?, ?, ?)";
  
  connection.query(query, [startDate, endDate, description || null], (err, result) => {
    if (err) {
      console.error('Error creating operation day:', err);
      return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
    
    res.status(201).json({ 
      status: 'ok', 
      message: 'Operation day created successfully',
      data: {
        operationID: result.insertId,
        startDate,
        endDate,
        description: description || null
      }
    });
  });
});

// Update operation day
router.put('/:id', jsonParser, function(req, res, next) {
  const operationId = req.params.id;
  const { startDate, endDate, description } = req.body;
  
  // ตรวจสอบความถูกต้องของข้อมูล
  if (!startDate || !endDate) {
    return res.status(400).json({ status: 'error', message: 'Start date and end date are required' });
  }
  
  // ตรวจสอบว่าวันที่เริ่มต้นต้องไม่มากกว่าวันที่สิ้นสุด
  if (new Date(startDate) > new Date(endDate)) {
    return res.status(400).json({ status: 'error', message: 'Start date must be before end date' });
  }
  
  // ตรวจสอบว่ามีข้อมูลที่ต้องการอัพเดทอยู่หรือไม่
  const checkQuery = "SELECT operationID FROM operationDay WHERE operationID = ?";
  
  connection.query(checkQuery, [operationId], (err, results) => {
    if (err) {
      console.error('Error checking operation day:', err);
      return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Operation day not found' });
    }
    
    // ดำเนินการอัพเดทข้อมูล
    const updateQuery = "UPDATE operationDay SET startDate = ?, endDate = ?, description = ? WHERE operationID = ?";
    
    connection.query(updateQuery, [startDate, endDate, description || null, operationId], (err, result) => {
      if (err) {
        console.error('Error updating operation day:', err);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
      }
      
      res.json({ 
        status: 'ok', 
        message: 'Operation day updated successfully',
        data: {
          operationID: parseInt(operationId),
          startDate,
          endDate,
          description: description || null
        }
      });
    });
  });
});

// Delete operation day
router.delete('/:id', function(req, res, next) {
  const operationId = req.params.id;
  
  // ตรวจสอบว่ามีข้อมูลที่ต้องการลบอยู่หรือไม่
  const checkQuery = "SELECT operationID FROM operationDay WHERE operationID = ?";
  
  connection.query(checkQuery, [operationId], (err, results) => {
    if (err) {
      console.error('Error checking operation day:', err);
      return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Operation day not found' });
    }
    
    // ดำเนินการลบข้อมูล
    const deleteQuery = "DELETE FROM operationDay WHERE operationID = ?";
    
    connection.query(deleteQuery, [operationId], (err, result) => {
      if (err) {
        console.error('Error deleting operation day:', err);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
      }
      
      res.json({ 
        status: 'ok', 
        message: 'Operation day deleted successfully' 
      });
    });
  });
});

module.exports = router;