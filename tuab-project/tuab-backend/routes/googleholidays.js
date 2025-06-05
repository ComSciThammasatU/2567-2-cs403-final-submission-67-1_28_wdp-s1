const express = require('express');
const router = express.Router();
const axios = require('axios'); 

// API Key ควรเก็บใน environment variable
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// Endpoint สำหรับดึงข้อมูลวันหยุดไทย
router.get('/', async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    
    // Calendar ID สำหรับวันหยุดประเทศไทย
    const calendarId = 'th.th#holiday@group.v.calendar.google.com';
    const startDate = `${year}-01-01T00:00:00Z`;
    const endDate = `${year}-12-31T23:59:59Z`;
    
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?key=${GOOGLE_API_KEY}&timeMin=${startDate}&timeMax=${endDate}&singleEvents=true`;
    
    const response = await axios.get(url);
    const events = response.data.items;
    
    // แปลงข้อมูลให้ใช้งานง่ายขึ้น
    const holidays = events.map(event => {
      // ตรวจสอบประเภทวันหยุด
      let type = 'national';
      const name = event.summary;
      const description = event.description || '';
      
      // ตรวจสอบวันพิเศษที่ไม่ใช่วันหยุด
      if (
        name.includes('วันวาเลนไทน์') || 
        name.includes('วันคริสต์มาส') || 
        name.includes('วันคริสต์มาสอีฟ') ||
        name.includes('วันฮาโลวีน')
      ) {
        type = 'special';
      }
      // ตรวจสอบวันหยุดทางพุทธศาสนา
      else if (
        name.includes('มาฆบูชา') || 
        name.includes('วิสาขบูชา') || 
        name.includes('อาสาฬหบูชา') || 
        name.includes('เข้าพรรษา') ||
        name.includes('ออกพรรษา')
      ) {
        type = 'buddhist';
      } 
      // ตรวจสอบวันหยุดทางวัฒนธรรม
      else if (name.includes('ลอยกระทง')) {
        type = 'cultural';
      }
      // ตรวจสอบจากคำอธิบาย
      else if (description && description.includes('วันสำคัญ') && !description.includes('วันหยุดนักขัตฤกษ์')) {
        type = 'special';
      }
      
      return {
        date: event.start.date,
        name: event.summary,
        description: description,
        type: type
      };
    });
    
    res.json(holidays);
  } catch (error) {
    console.error('Error fetching holidays:', error);
    res.status(500).json({ error: 'Failed to fetch holidays' });
  }
});

router.get('/test', (req, res) => {
  res.json({ message: 'Test route works!' });
});

module.exports = router;