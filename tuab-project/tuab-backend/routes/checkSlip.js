var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
const axios = require('axios');
var jwt = require('jsonwebtoken');

var connection = require('../connection/db.js');

// Check whether the user has paid or not.
router.get('/', jsonParser, function(req, res, next) {
  const { username, bookId } = req.query;

  connection.execute(
    "SELECT p.bankName, p.accountDigit, p.dateATime, b.FriendName, b.FriendTel " +
    "FROM Payment p " +
    "LEFT JOIN Booking b ON p.bookingID = b.bookingID " +
    "WHERE p.bookingID = ?",
    [bookId],
    (err, rows) => {
      if (err) {
        console.error('Error executing SELECT query:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      const transformedRows = rows.map(row => ({
        bankName: row.bankName,
        accountDigit: row.accountDigit,
        dateATime: formatDateTime(row.dateATime),
        FriendName: row.FriendName || '- (No booking for another person)',       
        FriendTel: row.FriendTel || '- (No booking for another person)'
      }));

      res.json(transformedRows);
    }
  );
});

function formatDateTime(dateTimeString) {
  const dateTime = new Date(dateTimeString);
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Asia/Bangkok'
  };

  return dateTime.toLocaleString('en-US', options);
}

module.exports = router;