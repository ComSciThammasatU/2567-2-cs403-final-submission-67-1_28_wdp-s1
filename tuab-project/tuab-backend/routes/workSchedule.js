var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
const axios = require('axios');
var jwt = require('jsonwebtoken');

var connection = require('../connection/db.js');

// Added workingDate staff to Database.
router.post('/', jsonParser, function(req, res, next) {
    const { username, workDate, workShift } = req.body;
    const formattedDate = new Date(workDate).toISOString().split('T')[0];
    
    connection.execute("INSERT INTO WorkSchedule (username, workingDate, workingShift) VALUES (?, ?, ?)",
        [username, workDate, workShift],
        (err, results) => {
            if (err) {
                console.error('Error inserting workSchedule into database:', err);
                return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
            }
            res.json({ status: 'ok', message: 'WorkSchedule successful', workId: results.insertId });
        });
});

// Update existing workSchedule
router.put('/:id', jsonParser, function(req, res, next) {
    const scheduleId = req.params.id;
    const { username, workDate, workShift } = req.body;
    
    connection.execute(
        "UPDATE WorkSchedule SET username = ?, workingDate = ?, workingShift = ? WHERE workID = ?",
        [username, workDate, workShift, scheduleId],
        (err, results) => {
            if (err) {
                console.error('Error updating workSchedule in database:', err);
                return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
            }
            
            if (results.affectedRows === 0) {
                return res.status(404).json({ status: 'error', message: 'WorkSchedule not found' });
            }
            
            res.json({ status: 'ok', message: 'WorkSchedule updated successfully' });
        }
    );
});

// Delete workSchedule
router.delete('/:id', jsonParser, function(req, res, next) {
    const scheduleId = req.params.id;
    
    connection.execute(
        "DELETE FROM WorkSchedule WHERE workID = ?",
        [scheduleId],
        (err, results) => {
            if (err) {
                console.error('Error deleting workSchedule from database:', err);
                return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
            }
            
            if (results.affectedRows === 0) {
                return res.status(404).json({ status: 'error', message: 'WorkSchedule not found' });
            }
            
            res.json({ status: 'ok', message: 'WorkSchedule deleted successfully' });
        }
    );
});

// Get workSchedule by username
router.get('/user/:username', function(req, res, next) {
    const username = req.params.username;
    
    connection.execute(
        "SELECT * FROM WorkSchedule WHERE username = ? ORDER BY workingDate",
        [username],
        (err, results) => {
            if (err) {
                console.error('Error fetching workSchedule from database:', err);
                return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
            }
            
            res.json(results);
        }
    );
});

// Check work schedule for a specific date and username (existing endpoint in your code)
// Assuming this is already implemented elsewhere, but adding here for completeness
router.get('/checkWork', function(req, res, next) {
    const { username, workDate } = req.query;
    
    connection.execute(
        "SELECT * FROM WorkSchedule WHERE username = ? AND workingDate = ?",
        [username, workDate],
        (err, results) => {
            if (err) {
                console.error('Error checking workSchedule in database:', err);
                return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
            }
            
            res.json(results);
        }
    );
});

// Get all working dates (dates with at least one staff scheduled) for userCalendar
router.get('/working-dates', function(req, res, next) {
    const startDate = req.query.startDate || new Date().toISOString().split('T')[0];
    const endDate = req.query.endDate || new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0];
    
    const query = `
        SELECT DISTINCT DATE_FORMAT(workingDate, '%Y-%m-%d') as workDate 
        FROM WorkSchedule 
        WHERE workingDate BETWEEN ? AND ?
        ORDER BY workingDate
    `;
    
    connection.execute(
        query,
        [startDate, endDate],
        (err, results) => {
            if (err) {
                console.error('Error fetching working dates from database:', err);
                return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
            }
            
            // แปลงผลลัพธ์เป็นอาร์เรย์ของวันที่
            const workingDates = results.map(row => row.workDate);
            
            res.json({ status: 'ok', data: workingDates });
        }
    );
});

module.exports = router;