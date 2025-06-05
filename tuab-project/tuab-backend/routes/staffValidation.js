var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
const axios = require('axios');
var jwt = require('jsonwebtoken');

var connection = require('../connection/db.js');

// นับจำนวนสต๊าฟในแต่ละวัน/Shift
// GET /api/staff/count-by-shift?date=2025-05-30&shiftId=1
router.get('/count-by-shift', function(req, res) {
    const { date, shiftId } = req.query;
    
    let query, params;
    
    if (shiftId && shiftId !== 'all') {
        // นับสต๊าฟใน Shift เฉพาะ
        query = `
            SELECT COUNT(*) as staffCount 
            FROM WorkSchedule 
            WHERE workingDate = ? 
            AND (workingShift = ? OR workingShift = 3)
            AND isActive IS NULL
        `;
        params = [date, shiftId];
    } else {
        // นับสต๊าฟทั้งหมดในวันนั้น
        query = `
            SELECT COUNT(*) as staffCount
            FROM WorkSchedule 
            WHERE workingDate = ?
            AND isActive IS NULL
        `;
        params = [date];
    }
    
    connection.execute(query, params, (err, results) => {
        if (err) {
            console.error('Error counting staff:', err);
            return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
        }
        
        res.json({
            status: 'ok',
            staffCount: results[0].staffCount,
            date: date,
            shiftId: shiftId || 'all'
        });
    });
});

// ดึงรายชื่อสต๊าฟที่ทำงานในวันที่กำหนด
// GET /api/staff/by-date?date=2025-05-30
router.get('/by-date', function(req, res) {
    const { date } = req.query;
    
    const query = `
        SELECT ws.*, u.name, u.telNumber
        FROM WorkSchedule ws
        JOIN User u ON ws.username = u.username
        WHERE ws.workingDate = ?
        AND ws.isActive IS NULL
        ORDER BY ws.workingShift, u.name
    `;
    
    connection.execute(query, [date], (err, results) => {
        if (err) {
            console.error('Error fetching staff by date:', err);
            return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
        }
        
        res.json({
            status: 'ok',
            date: date,
            staff: results,
            totalStaff: results.length
        });
    });
});

module.exports = router;