const express = require('express');
const router = express.Router();  // ต้องมีบรรทัดนี้เพื่อกำหนดตัวแปร router
const connection = require('../connection/db.js');

// สำหรับดึงข้อมูลวันหยุดทั้งหมด - endpoint: /holidays
router.get('/', (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    console.log(`Fetching holidays for year: ${year}`); // บันทึก log เพื่อ debug
    
    // ดึงข้อมูลวันหยุดที่เกิดซ้ำทุกปี และวันหยุดที่กำหนดเฉพาะปีนั้นๆ
    const query = `
      SELECT id, day, month, year, name, is_recurring, type 
      FROM holidays 
      WHERE (year IS NULL OR year = ?) 
      ORDER BY month, day
    `;
    
    connection.query(query, [year], (err, rows) => {
      if (err) {
        console.error('Error fetching holidays:', err);
        return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลวันหยุด' });
      }
      
      console.log(`Found ${rows.length} holidays`); // บันทึก log จำนวนวันหยุดที่พบ
      
      // แปลงข้อมูลให้อยู่ในรูปแบบที่ frontend ใช้งานได้
      const holidays = rows.map(row => {
        // สร้าง date string ในรูปแบบ ISO (YYYY-MM-DD)
        const dateStr = `${row.year || year}-${String(row.month).padStart(2, '0')}-${String(row.day).padStart(2, '0')}`;
        return {
          id: row.id,
          date: dateStr,
          name: row.name,
          isRecurring: row.is_recurring === 1, // แปลงจาก tinyint เป็น boolean
          type: row.type || 'holiday'
        };
      });
      
      res.json(holidays);
    });
  } catch (error) {
    console.error('Error in holidays route:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลวันหยุด' });
  }
});

// API สำหรับเพิ่มวันหยุดใหม่
router.post('/', (req, res) => {
  try {
    const { date, name, isRecurring, type } = req.body;
    
    if (!date || !name) {
      return res.status(400).json({ error: 'กรุณาระบุวันที่และชื่อวันหยุด' });
    }
    
    // แปลงวันที่จากรูปแบบ ISO (YYYY-MM-DD) เป็น day, month, year
    const dateParts = date.split('-');
    const year = isRecurring ? null : parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]);
    const day = parseInt(dateParts[2]);
    
    // เพิ่มข้อมูลลงในฐานข้อมูล
    const query = `
      INSERT INTO holidays (day, month, year, name, is_recurring, type)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    connection.query(query, [day, month, year, name, isRecurring, type || 'holiday'], (err, result) => {
      if (err) {
        console.error('Error adding holiday:', err);
        return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเพิ่มวันหยุด: ' + err.message });
      }
      
      res.json({ 
        success: true, 
        message: 'เพิ่มวันหยุดเรียบร้อยแล้ว',
        id: result.insertId 
      });
    });
  } catch (error) {
    console.error('Error in add holiday route:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเพิ่มวันหยุด: ' + error.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'DELETE FROM holidays WHERE id = ?';
    
    connection.query(query, [id], (err, result) => {
      if (err) {
        console.error('Error deleting holiday:', err);
        return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบวันหยุด' });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'ไม่พบวันหยุดที่ต้องการลบ' });
      }
      
      res.json({ success: true, message: 'ลบวันหยุดเรียบร้อยแล้ว' });
    });
  } catch (error) {
    console.error('Error in delete holiday route:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบวันหยุด' });
  }
});

module.exports = router;