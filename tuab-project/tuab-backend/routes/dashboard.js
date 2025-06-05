// routes/dashboard.js
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
const axios = require('axios');
var jwt = require('jsonwebtoken');

var connection = require('../connection/db.js');

// 1. API สรุปข้อมูลภาพรวม
router.get('/summary', (req, res) => {
  const { staff, start, end } = req.query;
  
  let sql = "SELECT bookingStatusID, COUNT(*) as count FROM Booking";
  const params = [];
  
  if (staff) {
    sql += " WHERE username = ?";
    params.push(staff);
    
    if (start && end) {
      sql += " AND bookingDate BETWEEN ? AND ?";
      params.push(start, end);
    }
  } else if (start && end) {
    sql += " WHERE bookingDate BETWEEN ? AND ?";
    params.push(start, end);
  }
  
  sql += " GROUP BY bookingStatusID";
  
  connection.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    const summary = {
      totalBookings: 0,
      pendingBookings: 0,
      confirmedBookings: 0,
      cancelledBookings: 0
    };
    
    results.forEach(row => {
      summary.totalBookings += row.count;
      
      switch (row.bookingStatusID) {
        case 1: // Pending
          summary.pendingBookings = row.count;
          break;
        case 2: // Confirm
          summary.confirmedBookings = row.count;
          break;
        case 3: // Cancel
          summary.cancelledBookings = row.count;
          break;
      }
    });
    
    res.json(summary);
  });
});

// 2. API ข้อมูลการจองตามวันที่
// แก้ไขใน routes/dashboard.js
// เพิ่ม API endpoint สำหรับข้อมูลการจองตามวันที่พร้อมสถานะ
router.get('/bookings-by-date', (req, res) => {
    const { staff, start, end } = req.query;
    
    let sql = `
      SELECT 
        DATE(bookingDate) as date, 
        COUNT(*) as count,
        SUM(CASE WHEN bookingStatusID = 1 THEN 1 ELSE 0 END) as pendingCount,
        SUM(CASE WHEN bookingStatusID = 2 THEN 1 ELSE 0 END) as confirmedCount,
        SUM(CASE WHEN bookingStatusID = 3 THEN 1 ELSE 0 END) as cancelledCount
      FROM Booking
    `;
    
    const params = [];
    
    if (staff) {
      sql += " WHERE username = ?";
      params.push(staff);
      
      if (start && end) {
        sql += " AND bookingDate BETWEEN ? AND ?";
        params.push(start, end);
      }
    } else if (start && end) {
      sql += " WHERE bookingDate BETWEEN ? AND ?";
      params.push(start, end);
    }
    
    sql += " GROUP BY DATE(bookingDate) ORDER BY date";
    
    connection.query(sql, params, (err, results) => {
      if (err) {
        console.error('Error querying database:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json(results);
    });
  });

// 3. API ข้อมูลการจองตามเดือน
router.get('/bookings-by-month', (req, res) => {
    const { year, staff } = req.query;
    const currentYear = new Date().getFullYear();
    const yearToUse = year || currentYear;
    
    let sql = `
      SELECT 
        CONCAT(YEAR(bookingDate), '-', LPAD(MONTH(bookingDate), 2, '0')) as yearMonth,
        MONTHNAME(bookingDate) as month,
        COUNT(*) as count,
        SUM(CASE WHEN bookingStatusID = 1 THEN 1 ELSE 0 END) as pendingCount,
        SUM(CASE WHEN bookingStatusID = 2 THEN 1 ELSE 0 END) as confirmedCount,
        SUM(CASE WHEN bookingStatusID = 3 THEN 1 ELSE 0 END) as cancelledCount
      FROM Booking
      WHERE YEAR(bookingDate) = ?
    `;
    
    const params = [yearToUse];
    
    if (staff) {
      sql += " AND username = ?";
      params.push(staff);
    }
    
    sql += " GROUP BY yearMonth, month ORDER BY yearMonth";
    
    connection.query(sql, params, (err, results) => {
      if (err) {
        console.error('Error querying database:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json(results);
    });
  });

// 4. API ข้อมูลการจองตามเลน
router.get('/bookings-by-lane', (req, res) => {
  const { start, end } = req.query;
  
  let sql = `
    SELECT 
      targetLaneID as lane,
      COUNT(*) as count 
    FROM Booking
  `;
  
  const params = [];
  
  if (start && end) {
    sql += " WHERE bookingDate BETWEEN ? AND ?";
    params.push(start, end);
  }
  
  sql += " GROUP BY targetLaneID ORDER BY targetLaneID";
  
  connection.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json(results);
  });
});

// 5. API ข้อมูลประสิทธิภาพของ Staff
router.get('/staff-performance', (req, res) => {
  const { start, end } = req.query;
  
  console.log('=== STAFF PERFORMANCE API DEBUG ===');
  console.log('Parameters:', { start, end });
  
  // Query 1: ดึง Staff ทั้งหมด
  const staffQuery = `
    SELECT username, name, roleID 
    FROM User 
    WHERE roleID IN ('2', '3')
    ORDER BY name
  `;
  
  connection.query(staffQuery, (err, staffResults) => {
    if (err) {
      console.error('Error querying staff:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    console.log('Staff found:', staffResults);
    
    if (staffResults.length === 0) {
      return res.json([]);
    }
    
    // Query 2: ดึงข้อมูลการจองของ Staff แต่ละคน (ที่เขาเป็นคนจอง)
    let bookingQuery = `
      SELECT 
        username,
        SUM(CASE WHEN bookingStatusID = 2 THEN 1 ELSE 0 END) as confirmedBookings,
        SUM(CASE WHEN bookingStatusID = 3 THEN 1 ELSE 0 END) as cancelledBookings,
        SUM(CASE WHEN bookingStatusID = 1 THEN 1 ELSE 0 END) as pendingBookings,
        COUNT(bookingID) as totalBookings
      FROM Booking
      WHERE username IN (${staffResults.map(() => '?').join(',')})
    `;
    
    const bookingParams = staffResults.map(staff => staff.username);
    
    if (start && end) {
      bookingQuery += " AND bookingDate BETWEEN ? AND ?";
      bookingParams.push(start, end);
    }
    
    bookingQuery += " GROUP BY username";
    
    console.log('Booking Query:', bookingQuery);
    console.log('Booking Params:', bookingParams);
    
    connection.query(bookingQuery, bookingParams, (err, bookingResults) => {
      if (err) {
        console.error('Error querying bookings:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      console.log('Booking results:', bookingResults);
      
      // รวมข้อมูล Staff กับข้อมูลการจอง
      const result = staffResults.map(staff => {
        const bookingData = bookingResults.find(b => b.username === staff.username) || {
          confirmedBookings: 0,
          cancelledBookings: 0,
          pendingBookings: 0,
          totalBookings: 0
        };
        
        const staffData = {
          username: staff.username,
          name: staff.name,
          roleID: staff.roleID,
          confirmedBookings: parseInt(bookingData.confirmedBookings) || 0,
          cancelledBookings: parseInt(bookingData.cancelledBookings) || 0,
          pendingBookings: parseInt(bookingData.pendingBookings) || 0,
          totalBookings: parseInt(bookingData.totalBookings) || 0
        };
        
        console.log(`Data for ${staff.name}:`, staffData);
        return staffData;
      });
      
      console.log('=== FINAL RESULT ===');
      console.log('Total staff:', result.length);
      result.forEach(staff => {
        console.log(`${staff.name}: Total=${staff.totalBookings}, Confirmed=${staff.confirmedBookings}, Cancelled=${staff.cancelledBookings}, Pending=${staff.pendingBookings}`);
      });
      console.log('====================');
      
      res.json(result);
    });
  });
});

// 6. API ข้อมูลการจองล่าสุด
router.get('/recent-bookings', (req, res) => {
  const { staff, limit = 20 } = req.query;
  
  let sql = `
    SELECT 
      b.bookingID as id,
      b.username,
      u.name as userName,
      b.targetLaneID as lane,
      DATE_FORMAT(b.bookingDate, '%Y-%m-%d') as date,
      s.shiftInfo as time,
      bs.statusName as status
    FROM Booking b
    JOIN User u ON b.username = u.username
    JOIN BookingStatus bs ON b.bookingStatusID = bs.bookingStatusID
    JOIN Shift s ON b.shiftID = s.shiftID
  `;
  
  const params = [];
  
  if (staff) {
    sql += " WHERE b.username = ?";
    params.push(staff);
  }
  
  sql += " ORDER BY b.bookingDate DESC LIMIT ?";
  params.push(parseInt(limit));
  
  connection.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json(results);
  });
});

// API ข้อมูลการจองตาม shift
router.get('/bookings-by-shift', (req, res) => {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ error: 'Date parameter is required' });
    }
    
    const sql = `
      SELECT 
        s.shiftID, 
        s.shiftInfo as shift, 
        COUNT(b.bookingID) as count 
      FROM Shift s
      LEFT JOIN Booking b ON s.shiftID = b.shiftID AND DATE(b.bookingDate) = ?
      GROUP BY s.shiftID, s.shiftInfo
    `;
    
    connection.query(sql, [date], (err, results) => {
      if (err) {
        console.error('Error querying database:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json(results);
    });
  });

  // API ข้อมูลการจองตามคณะ
router.get('/bookings-by-faculty', (req, res) => {
    const { start, end } = req.query;
    
    let sql = `
      SELECT 
        b.username,
        u.name,
        b.bookingID
      FROM Booking b
      JOIN User u ON b.username = u.username
    `;
    
    const params = [];
    
    if (start && end) {
      sql += " WHERE b.bookingDate BETWEEN ? AND ?";
      params.push(start, end);
    }
    
    connection.query(sql, params, (err, results) => {
      if (err) {
        console.error('Error querying database:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json(results);
    });
  });

module.exports = router;