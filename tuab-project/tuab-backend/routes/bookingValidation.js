var express = require('express');
var router = express.Router();
var connection = require('../connection/db.js');

// ตรวจสอบว่ามีการจองในวันที่กำหนดหรือไม่
// GET /api/bookings/check-existing?date=2025-05-30&shiftId=1
router.get('/check-existing', function(req, res) {
    const { date, shiftId } = req.query;
    
    let query, params;
    
    if (shiftId && shiftId !== 'both') {
        query = `
            SELECT COUNT(*) as bookingCount 
            FROM Booking 
            WHERE bookingDate = ? 
            AND shiftID = ? 
            AND bookingStatusID IN (1, 2)
        `;
        params = [date, shiftId];
    } else {
        query = `
            SELECT COUNT(*) as bookingCount 
            FROM Booking 
            WHERE bookingDate = ? 
            AND bookingStatusID IN (1, 2)
        `;
        params = [date];
    }
    
    connection.execute(query, params, (err, results) => {
        if (err) {
            console.error('Error checking existing bookings:', err);
            return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
        }
        
        const bookingCount = results[0].bookingCount;
        res.json({
            status: 'ok',
            hasBookings: bookingCount > 0,
            bookingCount: bookingCount,
            date: date,
            shiftId: shiftId || 'all'
        });
    });
});

// ตรวจสอบว่าสามารถจองได้หรือไม่
// GET /api/bookings/can-book?date=2025-05-30&shiftId=1
router.get('/can-book', function(req, res) {
    const { date, shiftId } = req.query;
    
    // 1. ตรวจสอบว่ามีสต๊าฟทำงานหรือไม่
    const checkStaffQuery = `
        SELECT COUNT(*) as staffCount 
        FROM WorkSchedule 
        WHERE workingDate = ? 
        AND (workingShift = ? OR workingShift = 3)
        AND isActive IS NULL
    `;
    
    connection.execute(checkStaffQuery, [date, shiftId], (err, staffResults) => {
        if (err) {
            console.error('Error checking staff availability:', err);
            return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
        }
        
        const hasStaff = staffResults[0].staffCount > 0;
        
        if (!hasStaff) {
            return res.json({
                status: 'ok',
                canBook: false,
                reason: 'ไม่มีสต๊าฟทำงานในช่วงเวลานี้',
                staffCount: 0
            });
        }
        
        // 2. ตรวจสอบว่าช่องยิงเต็มหรือไม่
        const checkLanesQuery = `
            SELECT COUNT(*) as bookedLanes
            FROM Booking 
            WHERE bookingDate = ? 
            AND shiftID = ?
            AND bookingStatusID IN (1, 2)
        `;
        
        connection.execute(checkLanesQuery, [date, shiftId], (err, lanesResults) => {
            if (err) {
                console.error('Error checking lane availability:', err);
                return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
            }
            
            const totalLanes = 6; // จำนวนช่องยิงทั้งหมด
            const bookedLanes = lanesResults[0].bookedLanes;
            const availableLanes = totalLanes - bookedLanes;
            
            res.json({
                status: 'ok',
                canBook: availableLanes > 0,
                staffCount: staffResults[0].staffCount,
                availableLanes: availableLanes,
                bookedLanes: bookedLanes,
                totalLanes: totalLanes,
                date: date,
                shiftId: shiftId
            });
        });
    });
});

module.exports = router;