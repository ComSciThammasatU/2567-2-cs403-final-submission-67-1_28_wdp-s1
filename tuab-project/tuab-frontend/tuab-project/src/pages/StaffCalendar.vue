<template>
<div class="calendar-container">
  <div class="calendar-header">
    <button @click="changeMonth(-1)" class="btn-nav">&lt;</button>
    <h2><strong>{{ currentMonthName }} {{ currentYear }}</strong></h2>
    <button @click="changeMonth(1)" class="btn-nav">&gt;</button>
  </div>

  <div class="role-info" style="text-align: center; margin-bottom: 10px; padding: 5px; background-color: #f5f5f5; border-radius: 4px;">
    Role: {{ roleName }}
  </div>
  
  <div class="calendar-legend">
    <div class="legend-item">
      <span class="legend-color bg-green"></span>
      <span class="legend-color bg-special"></span>
      <span>วันเปิดทำการ/วันพิเศษ (คลิกเพื่อจัดการการจอง)</span>
    </div>
    <div class="legend-item">
      <span class="legend-color bg-red"></span>
      <span>วันหยุดนักขัตฤกษ์</span>
    </div>
    <div class="legend-item">
      <span class="legend-color bg-gray"></span>
      <span>ปิดทำการ</span>
    </div>
  </div>
  
  <div class="calendar-grid">
    <!-- วันในสัปดาห์ - เริ่มต้นจากวันอาทิตย์ -->
    <div v-for="day in weekDays" :key="day" class="calendar-weekday">
      {{ day }}
    </div>
    
    <!-- วันในเดือน -->
    <div
      v-for="(day, index) in calendarDays"
      :key="index"
      :class="[
        'calendar-day',
        { 'outside-month': day.isOutsideMonth },
        { 'closed-day': day.isClosed },
        { 'special-bookable-day': day.isSpecialBookableDay },
        { 'holiday-day': day.isHoliday },
        { 'special-day': day.isSpecialDay && !day.isHoliday && !day.isClosed && !day.isSpecialBookableDay },
        { 'open-day': !day.isOutsideMonth && !day.isClosed && !day.isHoliday && !day.isSpecialDay },
        { 'past-date': day.isPastDate }
      ]"
      @click="handleDateClick(day)"
      :title="day.isHoliday ? day.holidayName : day.isSpecialDay ? day.specialDayName : ''"
    >
      <div class="day-number">{{ day.date.getDate() }}</div>
      <div v-if="day.isHoliday" class="holiday-name">{{ day.holidayName }}</div>
      <div v-else-if="day.isSpecialDay" class="special-day-name">{{ day.specialDayName }}</div>
    </div>
  </div>

  <!-- Modal สำหรับจัดการวันหยุด (สำหรับ Staff) -->
  <div v-if="showHolidayModal && (roleName === 'Super Staff' || roleName === 'Staff')" class="holiday-modal">
    <div class="modal-content">
      <div class="modal-header">
        <h3>จัดการวันหยุด</h3>
        <button @click="showHolidayModal = false" class="btn-close">&times;</button>
      </div>
      <div class="modal-body">
        <div class="holiday-list">
          <h4>วันหยุดปัจจุบัน</h4>
          <div v-if="holidays.length === 0" class="no-holidays">ไม่มีวันหยุดที่กำหนดเพิ่มเติม</div>
          <ul v-else>
            <li v-for="(holiday, index) in holidays" :key="index" class="holiday-item">
              <div class="holiday-info">
                <span>{{ formatDate(holiday.date) }}: {{ holiday.name }}</span>
                <span class="holiday-type">({{ holiday.type === 'holiday' ? 'วันหยุด' : 'วันพิเศษ' }})</span>
              </div>
              <button @click="removeHoliday(holiday.id)" class="btn-remove">ลบ</button>
            </li>
          </ul>
        </div>
        
        <div class="add-holiday-form">
          <h4>เพิ่มวันหยุดใหม่</h4>
          <div class="form-group">
            <label for="holidayDate">วันที่:</label>
            <input type="date" id="holidayDate" v-model="newHoliday.date" class="form-control">
          </div>
          <div class="form-group">
            <label for="holidayName">ชื่อวันหยุด:</label>
            <input type="text" id="holidayName" v-model="newHoliday.name" class="form-control" placeholder="เช่น วันหยุดพิเศษ">
          </div>
          <div class="form-group">
            <label for="holidayType">ประเภท:</label>
            <select id="holidayType" v-model="newHoliday.type" class="form-control">
              <option value="holiday">วันหยุด (ไม่สามารถจองได้)</option>
              <option value="special">วันพิเศษ (สามารถจองได้)</option>
            </select>
          </div>
          <div class="form-group">
            <label>
              <input type="checkbox" v-model="newHoliday.isRecurring">
              เป็นวันหยุดประจำปี
            </label>
          </div>
          <button @click="addHoliday" class="btn-add">เพิ่มวันหยุด</button>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import NotToken from '../components/NotToken.vue';

export default {
name: 'ArcheryBookingCalendar',
props: {
    mode: {
      type: String,
      default: 'general' // 'general' หรือ 'superstaff'
    }
  },
data() {
  return {
    roleName: '',
    currentDate: new Date(),
    selectedDate: null,
    // เปลี่ยนลำดับวันในสัปดาห์ให้เริ่มจากวันอาทิตย์ตาม requirement
    weekDays: ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'],
    // วันหยุดนักขัตฤกษ์ (จะถูกโหลดจาก API)
    holidays: [], // วันหยุดที่กำหนดเพิ่มเติม
    thaiHolidays: [], // วันหยุดราชการ
    specialDays: [], //วันพิเศษ วันวาเลนไทน์ วันฮาโลวีน
    buddhistHolidays: [], // วันหยุดทางศาสนา/วัฒนธรรม
    showHolidayModal: false,
    bookedDates: [], 
    newHoliday: {
      date: '',
      name: '',
      isRecurring: false,
      type: 'holiday' // เพิ่ม type โดยค่าเริ่มต้นเป็น 'holiday'
    }
  }
},
computed: {
  canManageHolidays() {
    return this.roleName === 'Super Staff' || this.roleName === 'Staff';
  },
  currentMonthName() {
    const months = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 
                    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
    return months[this.currentDate.getMonth()];
  },
  currentYear() {
    // แสดงปีเป็น พ.ศ.
    return this.currentDate.getFullYear();
  },
  calendarDays() {
    const monthStart = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
    const monthEnd = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
    const startDate = new Date(monthStart);
    const endDate = new Date(monthEnd);
    
    // ปรับให้เริ่มต้นจากวันอาทิตย์ของสัปดาห์แรกของเดือน (วันอาทิตย์คือ 0)
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);
    
    // ปรับให้สิ้นสุดที่วันเสาร์ของสัปดาห์สุดท้ายของเดือน
    const endDayOfWeek = endDate.getDay();
    if (endDayOfWeek < 6) {
      endDate.setDate(endDate.getDate() + (6 - endDayOfWeek));
    }
    
    const days = [];
    let day = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // รีเซ็ทเวลาให้เป็น 00:00:00 เพื่อเปรียบเทียบเฉพาะวันที่
    
    while (day <= endDate) {
    const isOutsideMonth = day.getMonth() !== this.currentDate.getMonth();
    const isClosed = this.isFieldClosed(day);
    const isHoliday = this.isHoliday(day);
    const isSpecialDay = this.isSpecialDay(day) || this.isCustomSpecialDay(day);
    const holidayName = isHoliday ? this.getHolidayName(day) : '';
    const specialDayName = isSpecialDay ? this.getSpecialDayName(day) || this.getCustomSpecialDayName(day) : '';
    const isPastDate = day < today;
    
    // เพิ่มการตรวจสอบว่ามีการจองหรือไม่
    const hasBooking = this.hasBooking(day);
    
    // ปรับเงื่อนไข: วันที่ไม่มีการจองให้ isClosed = true (ยกเว้นวันพิเศษ/วันหยุด)
    const effectivelyClosed = isClosed || (!hasBooking && !isOutsideMonth && !isHoliday && !isSpecialDay && !isPastDate);
    
    const isSpecialBookableDay = isSpecialDay && !isHoliday && !isClosed && !isOutsideMonth && !isPastDate;
      
    days.push({
      date: new Date(day),
      isOutsideMonth,
      isClosed: effectivelyClosed, // ใช้ effectivelyClosed แทน isClosed
      isHoliday,
      isSpecialDay,
      isSpecialBookableDay,
      holidayName,
      specialDayName,
      isPastDate,
      hasBooking // เพิ่มข้อมูลว่ามีการจองหรือไม่
    });
    
    day.setDate(day.getDate() + 1);
  }
  return days;
  }
},
methods: {
  async loadBookedDates() {
  const startDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
  const endDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
  
  const startDateStr = this.formatDateParam(startDate);
  const endDateStr = this.formatDateParam(endDate);
  
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/bookingSchedule?startDate=${startDateStr}&endDate=${endDateStr}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    this.bookedDates = await response.json();
    console.log('Booked dates:', this.bookedDates);
  } catch (error) {
    console.error('Error loading booked dates:', error);
    this.bookedDates = [];
  }
},

// เพิ่มเมธอดตรวจสอบว่ามีการจองในวันนั้นหรือไม่
hasBooking(date) {
  const formattedDate = this.formatDateParam(date);
  return this.bookedDates.includes(formattedDate);
},
  isFieldClosed(date) {
    // วันเสาร์ (6) และ วันอาทิตย์ (0) = ปิด
    return date.getDay() === 0 || date.getDay() === 6;
  },

  isHoliday(date) {
    // ถ้าเป็นวันพิเศษที่กำหนดเอง ไม่ถือเป็นวันหยุด
    if (this.isCustomSpecialDay(date)) {
      return false;
    }
    
    // ตรวจสอบทั้งวันหยุดราชการ วันหยุดทางศาสนา และวันหยุดที่กำหนดเพิ่มเติม (เฉพาะที่ type เป็น holiday)
    return this.thaiHolidays.some(holiday => 
      this.isSameDate(new Date(holiday.date), date)
    ) || this.buddhistHolidays.some(holiday => 
      this.isSameDate(new Date(holiday.date), date)
    ) || this.holidays.some(holiday => 
      this.isSameDate(new Date(holiday.date), date) && holiday.type === 'holiday'
    );
  },

  isSameDate(date1, date2) {
    return date1.getDate() === date2.getDate() && 
            date1.getMonth() === date2.getMonth() && 
            date1.getFullYear() === date2.getFullYear();
  },

  // ตรวจสอบว่าเป็นวันพิเศษระบบหรือไม่ (วันวาเลนไทน์, ฮาโลวีน, คริสต์มาส)
  isSpecialDay(date) {
    return this.specialDays.some(day => 
      this.isSameDate(new Date(day.date), date)
    );
  },

  // ตรวจสอบว่าเป็นวันพิเศษที่ผู้ใช้กำหนดเองหรือไม่
  isCustomSpecialDay(date) {
    return this.holidays.some(holiday => 
      this.isSameDate(new Date(holiday.date), date) && holiday.type === 'special'
    );
  },

  getHolidayName(date) {
    // ตรวจสอบวันหยุดราชการ
    const thaiHoliday = this.thaiHolidays.find(h => 
      this.isSameDate(new Date(h.date), date)
    );
    
    if (thaiHoliday) return thaiHoliday.name;
    
    // ตรวจสอบวันหยุดทางศาสนา
    const buddhistHoliday = this.buddhistHolidays.find(h => 
      this.isSameDate(new Date(h.date), date)
    );
    
    if (buddhistHoliday) return buddhistHoliday.name;
    
    // ตรวจสอบวันหยุดที่กำหนดเพิ่มเติม (เฉพาะที่ type เป็น holiday)
    const customHoliday = this.holidays.find(h => 
      this.isSameDate(new Date(h.date), date) && h.type === 'holiday'
    );
    
    return customHoliday ? customHoliday.name : "";
  },

  getSpecialDayName(date) {
    // หาชื่อวันพิเศษระบบ
    const specialDay = this.specialDays.find(day => 
      this.isSameDate(new Date(day.date), date)
    );
    
    return specialDay ? specialDay.name : "";
  },

  getCustomSpecialDayName(date) {
    // หาชื่อวันพิเศษที่ผู้ใช้กำหนดเอง
    const customSpecialDay = this.holidays.find(h => 
      this.isSameDate(new Date(h.date), date) && h.type === 'special'
    );
    
    return customSpecialDay ? customSpecialDay.name : "";
  },

  // เพิ่มวันพิเศษ (ไม่ใช่วันหยุด)
  addSpecialDays(year) {
    // ไม่ต้องเคลียร์ข้อมูลเก่า เพราะเราจะเพิ่มเข้าไปเรื่อยๆ
    // this.specialDays = [];
    
    // สร้างรายการวันพิเศษที่ต้องมี
    const mustHaveSpecialDays = [
      { date: new Date(year, 1, 14), name: 'วันวาเลนไทน์' },  // 14 กุมภาพันธ์
      { date: new Date(year, 9, 31), name: 'วันฮาโลวีน' },    // 31 ตุลาคม
      { date: new Date(year, 11, 24), name: 'วันคริสต์มาสอีฟ' }, // 24 ธันวาคม
      { date: new Date(year, 11, 25), name: 'วันคริสต์มาส' }   // 25 ธันวาคม
    ];
    
    // เพิ่มวันพิเศษที่ยังไม่มีในรายการ
    for (const specialDay of mustHaveSpecialDays) {
      // ตรวจสอบว่ามีในรายการแล้วหรือไม่
      const exists = this.specialDays.some(day => 
        this.isSameDate(new Date(day.date), specialDay.date)
      );
      
      // ถ้ายังไม่มี ให้เพิ่มเข้าไป
      if (!exists) {
        this.specialDays.push({
          date: specialDay.date,
          name: specialDay.name,
          type: 'special'
        });
      }
    }
  },

  async changeMonth(increment) {
  const newDate = new Date(this.currentDate);
  newDate.setMonth(newDate.getMonth() + increment);
  this.currentDate = newDate;
  
  // โหลดข้อมูลวันหยุดใหม่เมื่อเปลี่ยนปี
  if (this.currentDate.getFullYear() !== new Date().getFullYear()) {
    await this.loadHolidays(this.currentDate.getFullYear());
  }
  
  // โหลดข้อมูลการจองสำหรับเดือนใหม่
  await this.loadBookedDates();
},

  handleDateClick(day) {
    if ((!day.isOutsideMonth && !day.isClosed && !day.isHoliday && !day.isPastDate) || 
        (day.isSpecialBookableDay && !day.isPastDate)) {
      this.selectedDate = day.date;
      // นำทางไปยังหน้าจอง
      const formattedDate = this.formatDateParam(day.date);
      console.log(`วันที่ที่เลือก: ${formattedDate}, โหมด: ${this.mode}`);
      
      // ใช้ Vue Router เพื่อนำทางไปยังหน้าจอง
      // ตรวจสอบโหมดการทำงาน
      if (this.mode === 'superstaff') {
          // โหมด superstaff - ส่ง event เพื่อดูการจองในวันนั้น
          this.$emit('date-selected', formattedDate);
        } else {
          // โหมดทั่วไป - นำทางไปยังหน้าจอง
          this.$router.push({
            name: 'booking',
            params: { date: formattedDate }
        });
      }
    }
  },

  formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('th-TH', options);
  },

  formatDateParam(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  },

  addHoliday() {
    if (this.newHoliday.date && this.newHoliday.name) {
      // เพิ่มวันหยุดใหม่ด้วย API
      const holidayData = {
        date: this.newHoliday.date,
        name: this.newHoliday.name,
        isRecurring: this.newHoliday.isRecurring,
        type: this.newHoliday.type // เพิ่ม type เข้าไปในข้อมูลที่ส่งไปยัง API
      };
      
      // ส่งข้อมูลไปยัง API
      const dayOffUrl = `${import.meta.env.VITE_API_BASE_URL}/holidays`;
      fetch(dayOffUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(holidayData)
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('เพิ่มวันหยุดเรียบร้อยแล้ว', data);
        // โหลดข้อมูลวันหยุดใหม่
        this.loadCustomHolidays();
        
        // รีเซ็ตฟอร์ม
        this.newHoliday = {
          date: '',
          name: '',
          isRecurring: false,
          type: 'holiday'
        };
      })
      .catch(error => {
        console.error('เกิดข้อผิดพลาดในการเพิ่มวันหยุด', error);
        alert('เกิดข้อผิดพลาดในการเพิ่มวันหยุด: ' + error.message);
      });
    }
  },

  async removeHoliday(id) {
    try {
      // ลบวันหยุดด้วย API
      const dayOffUrl = `${import.meta.env.VITE_API_BASE_URL}/holidays/${id}`;
      const response = await fetch(dayOffUrl, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        // พยายามอ่านข้อความข้อผิดพลาดจาก response body
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์';
        } catch (e) {
          errorMessage = `HTTP Error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('ลบวันหยุดเรียบร้อยแล้ว', data);
      
      // โหลดข้อมูลวันหยุดใหม่
      await this.loadCustomHolidays();
      
      // แสดงข้อความสำเร็จ
      alert('ลบวันหยุดเรียบร้อยแล้ว');
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการลบวันหยุด', error);
      alert('เกิดข้อผิดพลาดในการลบวันหยุด: ' + error.message);
    }
  },

  async loadHolidays(year = null) {
    const currentYear = year || this.currentDate.getFullYear();
    console.log('Loading holidays for year:', currentYear);
    
    try {
      // ดึงข้อมูลวันหยุดจาก Google Calendar API
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/googleholidays?year=${currentYear}`);
      
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      
      const googleHolidays = await response.json();
      
      // แยกประเภทวันหยุด
      this.thaiHolidays = googleHolidays.filter(h => h.type === 'national');
      this.buddhistHolidays = googleHolidays.filter(h => 
        h.type === 'buddhist' || h.type === 'cultural'
      );
      
      // กรองเฉพาะวันพิเศษ (special) จาก API
      const specialDaysFromAPI = googleHolidays.filter(h => h.type === 'special');
      
      console.log('Google holidays loaded:', {
        national: this.thaiHolidays.length,
        buddhistAndCultural: this.buddhistHolidays.length,
        special: specialDaysFromAPI.length
      });
      
      // ดึงข้อมูลวันหยุดที่กำหนดเพิ่มเติม
      await this.loadCustomHolidays(currentYear);
      
      // เพิ่มวันพิเศษจาก API ก่อน
      this.specialDays = specialDaysFromAPI.map(day => ({
        date: new Date(day.date),
        name: day.name,
        type: 'special'
      }));
      
      // เพิ่มวันพิเศษเพิ่มเติม (เช่น วันที่ไม่มีใน API)
      this.addSpecialDays(currentYear);
    } catch (error) {
      console.error('Error loading Google holidays:', error);
      // ใช้ข้อมูลสำรอง
      this.useDefaultHolidays();
      // เพิ่มวันพิเศษเข้าไปด้วย
      this.addSpecialDays(currentYear);
    }
  },

  async loadCustomHolidays(year = null) {
    const currentYear = year || this.currentDate.getFullYear();
    
    try {
      // URL สำหรับดึงข้อมูลวันหยุดที่กำหนดเพิ่มเติม
      const dayOffUrl = `${import.meta.env.VITE_API_BASE_URL}/holidays?year=${currentYear}`;
      
      const response = await fetch(dayOffUrl);
      if (!response.ok) {
        throw new Error('Network response was not ok: ' + response.statusText);
      }
      
      const data = await response.json();
      console.log('Custom holidays loaded:', data);
      
      // เก็บข้อมูลวันหยุดที่กำหนดเพิ่มเติม
      this.holidays = data;
    } catch (error) {
      console.error('Error loading custom holidays:', error);
      this.holidays = [];
    }
  },
},
async mounted() {
  console.log('Calendar component mounted');
  // โหลดข้อมูลวันหยุดจาก API เมื่อ component ถูกโหลด
  await this.loadHolidays();
  await this.loadBookedDates();
},
mixins: [NotToken]
}
</script>

<style scoped>
@import '@/assets/css/Calendar.css';
</style>