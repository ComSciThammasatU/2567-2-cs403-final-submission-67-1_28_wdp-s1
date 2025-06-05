var express = require('express');
var router = express.Router();
var connection = require('../connection/db.js');

// ใส่ route ด้วย '/' เพราะ prefix ถูกกำหนดไว้แล้วในไฟล์ app.js
router.get('/', (req, res) => {
  connection.query(
    'SELECT username, name, telNumber, roleID FROM User WHERE roleID IN (?, ?) AND isActive IS NULL ORDER BY name',
    ['2', '3'],
    function(err, results) {
      if (err) {
        console.error('Error fetching staff data:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch staff data' });
        return;
      }
      res.json({ success: true, staff: results });
    }
  );
});

module.exports = router;