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
      <div class="legend-items-container">
        <div class="legend-item">
          <span class="legend-color bg-green"></span>
          <span class="legend-color bg-special"></span>
          <span>วันเปิดทำการ/วันพิเศษ (คลิกเพื่อจัดการ Shift)</span>
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
      <div class="manage-button">
        <button @click="openManageModal" class="btn-manage">แก้ไขการทำงาน</button>
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
        
        <!-- แสดงรูป PNG สำหรับวันที่มีการลงทะเบียน -->
        <div v-if="isRegisteredDate(day.date)" class="shift-icon-container">
          <template v-if="getShiftType(day.date) === '3'">
            <!-- แสดงทั้ง shift 1 และ shift 2 เมื่อเป็น shift 3 -->
            <img src="/numberone.png" alt="Shift 1" class="shift-icon-img">
            <img src="/numbertwo.png" alt="Shift 2" class="shift-icon-img">
          </template>
          <template v-else>
            <!-- แสดงตามปกติสำหรับ shift อื่นๆ -->
            <img v-if="getShiftType(day.date) === '1'" src="/numberone.png" alt="Shift 1" class="shift-icon-img">
            <img v-else-if="getShiftType(day.date) === '2'" src="/numbertwo.png" alt="Shift 2" class="shift-icon-img">
          </template>
        </div>
      </div>
    </div>

    <div class="manage-modal" v-if="showManageModal">
      <div class="manage-modal-content">
        <div class="modal-header">
          <h3>จัดการ Shift</h3>
          <button class="btn-close" @click="closeManageModal">×</button>
        </div>
        <div class="modal-body">
          <div v-if="registeredDates.length === 0" class="no-shifts">
            ไม่พบข้อมูลการลง Shift
          </div>
          <table v-else class="shift-table">
            <thead>
              <tr>
                <th>วันที่</th>
                <th>Shift ที่ลงทำงาน</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(shift, index) in registeredDates" :key="index">
                <td>{{ formatThaiDate(new Date(shift.workingDate)) }}</td>
                <td>
                  <!-- แสดงรูป PNG พร้อมกับข้อความใน Modal -->
                  <span class="shift-label">
                    <img v-if="shift.workingShift === '1'" src="/numberone.png" alt="Shift 1" class="shift-icon-img">
                    <img v-else-if="shift.workingShift === '2'" src="/numbertwo.png" alt="Shift 2" class="shift-icon-img">
                    <img v-else-if="shift.workingShift === '3'" src="/numberthree.png" alt="Shift 1&2" class="shift-icon-img">
                    {{ displayShiftText(shift.workingShift) }}
                  </span>
                </td>
                <td>
                  <button class="btn-edit" @click="editShift(shift)">แก้ไข</button>
                  <button class="btn-delete-small" @click="confirmDeleteShift(shift)">ลบ</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <!-- Shift Selection Popup -->
    <div class="shift-popup" v-if="showShiftPopup">
      <div class="shift-popup-content">
        <h3>{{ isEditing ? 'แก้ไข Shift วันที่' : 'เลือก Shift วันที่' }} {{ formatDateForDisplay(selectedDate) }}</h3>
        <div class="shift-options">
          <div class="shift-option">
            <input type="checkbox" id="shift1" v-model="selectedShifts" value="1">
            <label for="shift1">
              <img src="/numberone.png" alt="Shift 1" class="shift-icon-img"> 17.00 - 17.30
            </label>
          </div>
          <div class="shift-option">
            <input type="checkbox" id="shift2" v-model="selectedShifts" value="2">
            <label for="shift2">
              <img src="/numbertwo.png" alt="Shift 2" class="shift-icon-img"> 17.30 - 18.00
            </label>
          </div>
        </div>
        <div class="shift-buttons">
          <button class="btn-cancel" @click="closeShiftPopup">ยกเลิก</button>
          <button class="btn-save" @click="saveShift">บันทึก</button>
        </div>
      </div>
    </div>

    <!-- Confirmation Popup -->
    <div class="warning-popup" v-if="showConfirmPopup">
      <div class="warning-popup-content">
        <h3>{{ confirmMessage }}</h3>
        <div class="confirm-buttons">
          <button class="btn-cancel" @click="closeConfirmPopup">ยกเลิก</button>
          <button class="btn-delete" @click="proceedWithDelete">ยืนยัน</button>
        </div>
      </div>
    </div>
        
    <!-- Success Popup -->
    <div class="success-popup" v-if="showSuccessPopup">
      <div class="success-popup-content">
        <img src="/paychecked.png" width="100" height="100">
        <h3>บันทึก Shift เรียบร้อยแล้ว!</h3>
        <button @click="closeSuccessPopup">ตกลง</button>
      </div>
    </div>
    
    <!-- Warning Popup -->
    <div class="warning-popup" v-if="showWarningPopup">
      <div class="warning-popup-content">
        <img src="/warning.png" width="100" height="100">
        <h3>{{ warningMessage }}</h3>
        <button @click="closeWarningPopup">ตกลง</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import NotToken from '../components/NotToken.vue';
export default {
  name: 'CalendarComponent',
  props: {
    mode: {
      type: String,
      default: 'general'
    }
  },
  data() {
    return {
      currentDate: new Date(),
      selectedDate: null,
      weekDays: ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'],
      holidays: [],
      thaiHolidays: [],
      specialDays: [],
      buddhistHolidays: [],
      // เพิ่มข้อมูลสำหรับ Shift Popup
      showShiftPopup: false,
      selectedShifts: [],
      username: '',
      showSuccessPopup: false,
      showWarningPopup: false,
      warningMessage: '',
      isEditing: false,
      existingScheduleId: null,
      registeredDates: [], // เก็บวันที่ลงทะเบียนแล้ว
      showManageModal: false,
      showConfirmPopup: false,
      confirmMessage: '',
      shiftToDelete: null,
      operationEndDate: null
    }
  },
  computed: {
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

        // เพิ่มการตรวจสอบว่าเป็นวันที่ผ่านมาแล้วหรือไม่
        const isPastDate = day < today;

        // คำนวณ isSpecialBookableDay ให้ถูกต้อง
        const isSpecialBookableDay = isSpecialDay && !isHoliday && !isClosed && !isOutsideMonth && !isPastDate;
          
        days.push({
          date: new Date(day),
          isOutsideMonth,
          isClosed,
          isHoliday,
          isSpecialDay,
          isSpecialBookableDay,
          holidayName,
          specialDayName,
          isPastDate 
        });
        
        day.setDate(day.getDate() + 1);
      }
      return days;
    }
  },
  methods: {
    checkIfCanCancelShift(shift) {
  return new Promise((resolve, reject) => {
    // 1. กำหนดว่าต้องตรวจสอบ Shift ไหนบ้าง
    // ถ้าเป็น Shift 3 ต้องตรวจสอบทั้ง Shift 1 และ 2
    // ถ้าเป็น Shift 1 หรือ 2 ตรวจสอบเฉพาะ Shift นั้น
    const shiftsToCheck = shift.workingShift === 3 ? ['1', '2'] : [shift.workingShift];
    
    // 2. สร้างรายการคำขอเพื่อตรวจสอบแต่ละ Shift
    const checkPromises = shiftsToCheck.map(shiftId => {
      return axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/staff/count-by-shift`, {
        params: {
          date: this.formatDateParam(new Date(shift.workingDate)),
          shiftId: shiftId
        }
      });
    });
    
    // 3. ดำเนินการตรวจสอบทั้งหมด
    Promise.all(checkPromises)
      .then(responses => {
        // ตรวจสอบว่ามี Shift ใดที่จะไม่มีสต๊าฟทำงานหากยกเลิกหรือไม่
        const canCancel = responses.every(response => {
          // ถ้ามีสต๊าฟมากกว่า 1 คน สามารถยกเลิกได้
          return response.data.staffCount > 1;
        });
        
        resolve(canCancel);
      })
      .catch(error => {
        console.error('Error checking staff count:', error);
        // หากเกิดข้อผิดพลาด ไม่อนุญาตให้ยกเลิก
        resolve(false);
      });
  });
},

processSaveShift(workShift) {
  const formData = {
    username: this.username,
    workDate: this.formatDateParam(this.selectedDate),
    workShift: workShift
  };
  
  console.log('Saving data:', formData);
  
  if (this.isEditing && this.existingScheduleId) {
    // อัพเดทข้อมูลที่มีอยู่แล้ว
    axios.put(`${import.meta.env.VITE_API_BASE_URL}/workSchedule/${this.existingScheduleId}`, formData)
      .then(response => {
        console.log('Shift schedule updated successfully!');
        this.closeShiftPopup();
        this.showSuccessPopup = true;
        // อัพเดทรายการวันที่ลงทะเบียน
        this.loadRegisteredDates();
      })
      .catch(error => {
        console.error('Error updating shift schedule:', error);
        this.showWarningPopup = true;
        this.warningMessage = 'เกิดข้อผิดพลาดในการอัพเดทข้อมูล';
      });
  } else {
    // บันทึกข้อมูลใหม่
    axios.post(`${import.meta.env.VITE_API_BASE_URL}/workSchedule`, formData)
      .then(response => {
        console.log('Shift schedule saved successfully!');
        this.closeShiftPopup();
        this.showSuccessPopup = true;
        // อัพเดทรายการวันที่ลงทะเบียน
        this.loadRegisteredDates();
      })
      .catch(error => {
        console.error('Error saving shift schedule:', error);
        this.showWarningPopup = true;
        this.warningMessage = 'เกิดข้อผิดพลาดในการบันทึกข้อมูล';
      });
  }
},

// ฟังก์ชันเสริมสำหรับดึงรายชื่อสต๊าฟ (ใช้สำหรับการดีบัก)
getStaffListForDate(date) {
  return axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/staff/by-date`, {
    params: {
      date: this.formatDateParam(date)
    }
  })
  .then(response => {
    console.log('Staff list for date:', response.data);
    return response.data;
  })
  .catch(error => {
    console.error('Error fetching staff list:', error);
    return { status: 'error', staff: [] };
  });
},
    fetchLatestOperationDay() {
      axios.get(`${import.meta.env.VITE_API_BASE_URL}/checkoperation`)
        .then(response => {
          if (response.data && response.data.length > 0) {
            // เนื่องจาก API ส่งข้อมูลกลับมาเรียงตาม operationID DESC อยู่แล้ว
            // จึงสามารถใช้ข้อมูลแรกได้เลย
            const latestOperation = response.data[0];
            
            // แปลงวันที่ string เป็น Date object
            // ตรวจสอบรูปแบบวันที่ที่ได้จาก API ก่อน
            // หากมีรูปแบบเป็น "YYYY-MM-DD"
            this.operationEndDate = new Date(latestOperation.endDate);
            console.log('Latest operation end date:', this.operationEndDate);
          }
        })
        .catch(error => {
          console.error('Error fetching operation days:', error);
        });
    },

    formatThaiDate(date) {
      if (!date) return '';
      const thaiMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 
                        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
      return `${date.getDate()} ${thaiMonths[date.getMonth()]} ${date.getFullYear() + 543}`;
    },

    getShiftClass(date) {
      const shiftType = this.getShiftType(date);
      
      if (!shiftType) return '';
      
      switch(shiftType) {
        case '1': return 'shift-1';
        case '2': return 'shift-2';
        case '3': return 'shift-3';
        default: return '';
      }
    },

    isFieldClosed(date) {
      // ตรวจสอบว่าเป็นวันเสาร์หรืออาทิตย์
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      
      // ตรวจสอบว่าวันที่เกินกว่า endDate ล่าสุดหรือไม่
      const isAfterEndDate = this.operationEndDate && date > this.operationEndDate;
      
      // วันปิดคือวันที่เป็นวันเสาร์อาทิตย์หรือวันที่อยู่หลัง endDate
      return isWeekend || isAfterEndDate;
    },
    
    // โหลดรายการวันที่ลงทะเบียนแล้ว
    loadRegisteredDates() {
      if (!this.username) return;
      
      axios.get(`${import.meta.env.VITE_API_BASE_URL}/workSchedule/user/${this.username}`)
        .then(response => {
          this.registeredDates = response.data;
          console.log('Registered dates loaded:', this.registeredDates);
        })
        .catch(error => {
          console.error('Error loading registered dates:', error);
        });
    },
    
    // ตรวจสอบว่าวันที่ใดมีการลงทะเบียนแล้ว
    isRegisteredDate(date) {
      return this.registeredDates.some(item => 
        this.isSameDate(new Date(item.workingDate), date)
      );
    },

    getShiftType(date) {
    const registration = this.registeredDates.find(item => 
      this.isSameDate(new Date(item.workingDate), date)
    );
    
    if (!registration) return null;
    
    // แปลงเป็น string เพื่อให้แน่ใจว่าการเปรียบเทียบทำงานได้ถูกต้อง
    return String(registration.workingShift);
    },

    displayShiftText(shift) {
      // แปลงเป็น string เพื่อให้ switch ทำงานได้ถูกต้อง
      const shiftStr = String(shift);
      
      switch(shiftStr) {
        case '1': return 'Shift 1: 17.00 - 17.30';
        case '2': return 'Shift 2: 17.30 - 18.00';
        case '3': return 'Shift 1 & 2: 17.00 - 18.00';
        default: return 'ไม่ระบุ';
      }
    },
    

    isHoliday(date) {
      // ตรวจสอบวันหยุด
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

    isSpecialDay(date) {
      return this.specialDays.some(day => 
        this.isSameDate(new Date(day.date), date)
      );
    },

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
      
      // ตรวจสอบวันหยุดที่กำหนดเพิ่มเติม
      const customHoliday = this.holidays.find(h => 
        this.isSameDate(new Date(h.date), date) && h.type === 'holiday'
      );
      
      return customHoliday ? customHoliday.name : "";
    },

    getSpecialDayName(date) {
      const specialDay = this.specialDays.find(day => 
        this.isSameDate(new Date(day.date), date)
      );
      
      return specialDay ? specialDay.name : "";
    },

    getCustomSpecialDayName(date) {
      const customSpecialDay = this.holidays.find(h => 
        this.isSameDate(new Date(h.date), date) && h.type === 'special'
      );
      
      return customSpecialDay ? customSpecialDay.name : "";
    },

    changeMonth(increment) {
      const newDate = new Date(this.currentDate);
      newDate.setMonth(newDate.getMonth() + increment);
      this.currentDate = newDate;
      
      // โหลดข้อมูลวันหยุดใหม่เมื่อเปลี่ยนปี
      if (this.currentDate.getFullYear() !== new Date().getFullYear()) {
        this.loadHolidays(this.currentDate.getFullYear());
      }
    },

    handleDateClick(day) {
      // ถ้าไม่ใช่วันนอกเดือน และไม่ใช่วันปิด (รวมถึงไม่เกินวัน endDate) และไม่ใช่วันหยุด และไม่ใช่วันที่ผ่านมาแล้ว
      if ((!day.isOutsideMonth && !day.isClosed && !day.isHoliday && !day.isPastDate) || 
          (day.isSpecialBookableDay && !day.isPastDate)) {
        // เงื่อนไขเพิ่มเติมเพื่อตรวจสอบว่าวันที่ไม่เกิน endDate ล่าสุด
        if (this.operationEndDate && day.date > this.operationEndDate) {
          return; // ถ้าเกิน endDate ล่าสุด ไม่ทำอะไร
        }
        
        this.selectedDate = day.date;
        const formattedDate = this.formatDateParam(day.date);
        console.log(`วันที่ที่เลือก: ${formattedDate}`);
        
        // เช็คว่ามีการลงทะเบียนไว้แล้วหรือไม่
        this.checkExistingSchedule(formattedDate);
      }
    },

    formatDateParam(date) {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    },
    
    formatDateForDisplay(date) {
      if (!date) return '';
      return `${date.getDate()} ${this.currentMonthName} ${this.currentYear}`;
    },

    // Method to check if there's already a schedule for the selected date
    checkExistingSchedule(date) {
      // ดึงชื่อผู้ใช้จาก localStorage หรือ state ของแอป
      this.username = localStorage.getItem('username') || '';
      
      if (!this.username) {
        this.showWarningPopup = true;
        this.warningMessage = 'กรุณาเข้าสู่ระบบก่อนลงทะเบียน Shift';
        return;
      }
      
      const formData = {
        username: this.username,
        workDate: date
      };
      
      axios.get(`${import.meta.env.VITE_API_BASE_URL}/checkWork`, { params: formData })
        .then(response => {
          const userSchedules = response.data;
          if (userSchedules.length > 0) {
            // ถ้ามีการลงทะเบียนแล้ว ให้ดึงข้อมูล shift มาแสดงและให้สามารถแก้ไขได้
            const existingShift = userSchedules[0].workingShift; // ใช้ workingShift แทน workShift
            this.existingScheduleId = userSchedules[0].workID; // ใช้ workID แทน id
            
            // แปลงค่า workShift เป็น array ของ shift ที่เลือก
            this.selectedShifts = this.parseWorkShift(existingShift);
            
            // เปิด popup แบบแก้ไข
            this.isEditing = true;
            this.showShiftPopup = true;
          } else {
            // ถ้ายังไม่มีการลงทะเบียน เปิด Popup ให้เลือก Shift
            this.selectedShifts = [];
            this.isEditing = false;
            this.showShiftPopup = true;
          }
        })
        .catch(error => {
          console.error('Error checking existing schedule:', error);
          this.showWarningPopup = true;
          this.warningMessage = 'เกิดข้อผิดพลาดในการตรวจสอบ Shift';
        });
    },
        
    // แปลงค่า workShift เป็น array ของ shift ที่เลือก
    parseWorkShift(workShift) {
      const shifts = [];
      
      if (workShift === '1' || workShift === '3') {
        shifts.push('1');
      }
      
      if (workShift === '2' || workShift === '3') {
        shifts.push('2');
      }
      
      return shifts;
    },
    
    // ปิด Popup เลือก Shift
    closeShiftPopup() {
      this.showShiftPopup = false;
      this.selectedShifts = [];
    },

    closeConfirmPopup() {
      this.showConfirmPopup = false;
      this.shiftToDelete = null;
    },

    proceedWithDelete() {
      if (!this.shiftToDelete) return;
      
      // ใช้ workID แทน id
      const id = this.shiftToDelete.workID;
      
      console.log('Deleting workID:', id); // เพิ่ม log สำหรับ debug
      
      axios.delete(`${import.meta.env.VITE_API_BASE_URL}/workSchedule/${id}`)
        .then(response => {
          console.log('Shift schedule deleted successfully!', response);
          this.closeConfirmPopup();
          this.loadRegisteredDates(); // โหลดข้อมูลใหม่
          this.showSuccessPopup = true;
        })
        .catch(error => {
          console.error('Error deleting shift schedule:', error);
          this.closeConfirmPopup();
          this.showWarningPopup = true;
          this.warningMessage = `เกิดข้อผิดพลาดในการยกเลิก Shift: ${error.message}`;
        });
    },

    confirmDeleteShift(shift) {
  this.checkIfCanCancelShift(shift)
    .then(canCancel => {
      if (canCancel) {
        // สามารถยกเลิกได้ - แสดงหน้าต่างยืนยัน
        this.shiftToDelete = shift;
        console.log('Shift to delete:', shift);
        this.confirmMessage = `ยืนยันการยกเลิก Shift วันที่ ${this.formatThaiDate(new Date(shift.workingDate))}?`;
        this.showConfirmPopup = true;
      } else {
        // ไม่สามารถยกเลิกได้ - แสดงข้อความเตือน
        this.showWarningPopup = true;
        this.warningMessage = `ไม่สามารถยกเลิก Shift วันที่ ${this.formatThaiDate(new Date(shift.workingDate))} ได้ เนื่องจากคุณเป็นสต๊าฟเพียงคนเดียวที่ทำงานในช่วงเวลานี้`;
      }
    });
},


    deleteShift() {
      if (!this.existingScheduleId) {
        this.showWarningPopup = true;
        this.warningMessage = 'ไม่พบข้อมูล Shift ที่ต้องการยกเลิก';
        return;
      }
      
      this.confirmMessage = `ยืนยันการยกเลิก Shift วันที่ ${this.formatDateForDisplay(this.selectedDate)}?`;
      this.showConfirmPopup = true;
      this.shiftToDelete = { workID: this.existingScheduleId }; // ใช้ workID แทน id
      this.closeShiftPopup();
    },
    // ปุ่มบันทึก Shift
    saveShift() {
  if (this.selectedShifts.length === 0) {
    this.showWarningPopup = true;
    this.warningMessage = 'กรุณาเลือกอย่างน้อย 1 Shift';
    return;
  }
  
  // คำนวณค่า workShift ใหม่ (1, 2, หรือ 3)
  const newWorkShift = this.calculateWorkShift();
  
  // ถ้ากำลังแก้ไขและเปลี่ยนประเภท Shift ต้องตรวจสอบ
  if (this.isEditing && this.existingScheduleId) {
    // ค้นหา Shift ที่มีอยู่ใน registeredDates
    const existingShift = this.registeredDates.find(shift => shift.workID === this.existingScheduleId);
    
    if (existingShift && existingShift.workingShift !== newWorkShift) {
      // ประเภท Shift กำลังเปลี่ยน ต้องตรวจสอบ
      this.checkIfCanCancelShift(existingShift)
        .then(canModify => {
          if (canModify) {
            this.processSaveShift(newWorkShift);
          } else {
            this.showWarningPopup = true;
            this.warningMessage = `ไม่สามารถเปลี่ยนแปลง Shift วันที่ ${this.formatThaiDate(this.selectedDate)} ได้ เนื่องจากคุณเป็นสต๊าฟเพียงคนเดียวที่ทำงานในช่วงเวลานี้`;
          }
        });
    } else {
      // ไม่มีการเปลี่ยนประเภท Shift หรือไม่พบ ดำเนินการบันทึกต่อ
      this.processSaveShift(newWorkShift);
    }
  } else {
    // การลงทะเบียนใหม่ ไม่ต้องตรวจสอบ
    this.processSaveShift(newWorkShift);
  }
},
    
    // คำนวณค่า workShift เหมือนใน ShiftSchedule.vue
    calculateWorkShift() {
      const shift1Selected = this.selectedShifts.includes('1');
      const shift2Selected = this.selectedShifts.includes('2');

      if (shift1Selected && shift2Selected) {
        return '3';
      } else if (shift1Selected) {
        return '1';
      } else if (shift2Selected) {
        return '2';
      } else {
        return '';
      }
    },

    // เปิดหน้าต่างจัดการเวร
    openManageModal() {
      this.loadRegisteredDates(); // โหลดข้อมูลล่าสุด
      this.showManageModal = true;
    },

    // ปิดหน้าต่างจัดการเวร
    closeManageModal() {
      this.showManageModal = false;
    },

    // แก้ไขเวรจากหน้าจัดการ
    editShift(shift) {
  this.checkIfCanCancelShift(shift)
    .then(canEdit => {
      if (canEdit) {
        // สามารถแก้ไขได้ - แสดงหน้าต่างแก้ไข
        this.selectedDate = new Date(shift.workingDate);
        this.existingScheduleId = shift.workID; 
        this.selectedShifts = this.parseWorkShift(shift.workingShift);
        this.isEditing = true;
        this.showShiftPopup = true;
        this.closeManageModal();
      } else {
        // ไม่สามารถแก้ไขได้ - แสดงข้อความเตือน
        this.showWarningPopup = true;
        this.warningMessage = `ไม่สามารถแก้ไข Shift วันที่ ${this.formatThaiDate(new Date(shift.workingDate))} ได้ เนื่องจากคุณเป็นสต๊าฟเพียงคนเดียวที่ทำงานในช่วงเวลานี้`;
        this.closeManageModal();
      }
    });
},

    
    // ปิด Success Popup
    closeSuccessPopup() {
      this.showSuccessPopup = false;
    },
    
    // ปิด Warning Popup
    closeWarningPopup() {
      this.showWarningPopup = false;
    },

    // Method that can be implemented to load holidays
    loadHolidays(year = null) {
      // Implement holiday loading logic
      console.log('Loading holidays for year:', year || new Date().getFullYear());
      
      // Example data for testing
      this.thaiHolidays = [
        { date: new Date(2025, 0, 1), name: 'วันขึ้นปีใหม่', type: 'national' }
      ];
      
      this.specialDays = [
        { date: new Date(2025, 1, 14), name: 'วันวาเลนไทน์', type: 'special' }
      ];
    },

    async loadHolidays(year = null) {
      const currentYear = year || this.currentDate.getFullYear();
      console.log('Loading holidays for year:', currentYear);
      
      try {
        // ดึงข้อมูลวันหยุดจาก Google API
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/googleholidays?year=${currentYear}`);
        
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        
        const googleHolidays = await response.json();
        
        // แยกประเภทวันหยุด
        this.thaiHolidays = googleHolidays.filter(h => h.type === 'national');
        this.buddhistHolidays = googleHolidays.filter(h => h.type === 'buddhist');
        
        // กรองเฉพาะวันพิเศษ (special) จาก API
        this.specialDays = googleHolidays.filter(h => h.type === 'special').map(day => ({
          date: new Date(day.date),
          name: day.name,
          type: 'special'
        }));
        
        // ดึงข้อมูลวันหยุดที่ถูกจัดการไว้แล้ว (custom holidays)
        try {
          const customResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/holidays?year=${currentYear}`);
          if (customResponse.ok) {
            this.holidays = await customResponse.json();
            console.log('Custom holidays loaded:', this.holidays);
          }
        } catch (customError) {
          console.error('Error loading custom holidays:', customError);
          this.holidays = [];
        }
        
      } catch (error) {
        console.error('Error loading holidays:', error);
        // ใช้ข้อมูลสำรอง
        this.useDefaultHolidays(currentYear);
      }
    },

    // เพิ่ม method สำรองกรณี API ไม่ทำงาน
    useDefaultHolidays(year = null) {
      const currentYear = year || new Date().getFullYear();
      
      this.thaiHolidays = [
        { date: new Date(currentYear, 0, 1), name: 'วันขึ้นปีใหม่', type: 'national' },
        { date: new Date(currentYear, 3, 13), name: 'วันสงกรานต์', type: 'national' },
        { date: new Date(currentYear, 3, 14), name: 'วันสงกรานต์', type: 'national' },
        { date: new Date(currentYear, 3, 15), name: 'วันสงกรานต์', type: 'national' },
        { date: new Date(currentYear, 11, 31), name: 'วันสิ้นปี', type: 'national' }
      ];
      
      this.buddhistHolidays = [];
      this.specialDays = [
        { date: new Date(currentYear, 1, 14), name: 'วันวาเลนไทน์', type: 'special' },
        { date: new Date(currentYear, 11, 24), name: 'วันคริสต์มาสอีฟ', type: 'special' },
        { date: new Date(currentYear, 11, 25), name: 'วันคริสต์มาส', type: 'special' }
      ];
      this.holidays = [];
    },
    // เพิ่มวันพิเศษ
    addSpecialDays(year) {
      const mustHaveSpecialDays = [
        { date: new Date(year, 1, 14), name: 'วันวาเลนไทน์' },
        { date: new Date(year, 9, 31), name: 'วันฮาโลวีน' },
        { date: new Date(year, 11, 24), name: 'วันคริสต์มาสอีฟ' },
        { date: new Date(year, 11, 25), name: 'วันคริสต์มาส' }
      ];
      
      for (const specialDay of mustHaveSpecialDays) {
        const exists = this.specialDays.some(day => 
          this.isSameDate(new Date(day.date), specialDay.date)
        );
        
        if (!exists) {
          this.specialDays.push({
            date: specialDay.date,
            name: specialDay.name,
            type: 'special'
          });
        }
      }
    }
  },
  mounted() {
    console.log('Calendar component mounted');
  
    // เรียกใช้ method เพื่อดึงข้อมูล operation days
    this.fetchLatestOperationDay();
    
    // โค้ดเดิม
    this.loadHolidays();
    this.username = localStorage.getItem('username') || '';
    if (this.username) {
      this.loadRegisteredDates();
    }
  },
  
  mixins: [NotToken],
}
</script>

<style scoped>
@import '@/assets/css/StaffShiftCalendar.css';
/* CSS สำหรับรูป PNG ของ Shift */
.shift-icon-img {
  width: 18px;
  height: 18px;
  object-fit: contain;
  vertical-align: middle;
}

.legend-icon {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 20px;
  height: 20px;
  margin-right: 5px;
}

.shift-icon-container {
  position: absolute;
  bottom: 2px;
  right: 2px;
}

.shift-label {
  display: flex;
  align-items: center;
}

.shift-label img {
  margin-right: 5px;
}

.shift-icon-container {
  position: absolute;
  bottom: 2px;
  right: 2px;
  display: flex;
  gap: 2px; /* เว้นระยะห่างระหว่างรูป */
}
</style>