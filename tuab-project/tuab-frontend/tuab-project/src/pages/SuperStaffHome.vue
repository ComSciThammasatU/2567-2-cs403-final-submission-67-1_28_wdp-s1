<template lang="">
  <div class="container">
    <body>
      <div class="menubar">
        <div class="namebar">
          <h3>{{roleName}}: {{name}}
            <img v-if="roleName === 'Super Staff'" src="/crown.png" width="20x" height="20px"> 
            <img v-if="roleName === 'Super Staff'" src="/crown.png" width="20x" height="20px"> 
          </h3>
        </div>
        <br><br>
        <p Align=center><LogoutBotton /></p>
        <br><br>
        <p Align=center><button class="menu" @click="booking"><span> BOOK NOW </span></button></p><br>
        <p Align=center><button class="menu" @click="cancel"><span> CANCEL BOOKING </span></button></p><br>
        <p Align=center><button class="menu" @click="history"><span> BOOKING HISTORY </span></button></p><br>
        <p Align=center><button class="staffmenu tooltip-btn" @click="StaffTimesheet" data-tooltip="ดูตารางเวลาการทำงานของฉันและสมาชิก"><span><img src="setting.png" width=9%> Staff Timesheet </span></button></p><br>
        <p Align=center><button class="staffmenu tooltip-btn" @click="shiftSchedule" data-tooltip="จัดการตารางเวลาการทำงานของฉัน"><span><img src="setting.png" width=9%> Manage Timesheet </span></button></p><br>
        <p Align=center><button class="staffmenu tooltip-btn" @click="operation" data-tooltip="แก้ไขช่วงวันเปิดสนาม"><span><img src="setting.png" width=9%> Edit Settings </span></button></p><br>
        <p Align=center><button class="staffmenu tooltip-btn" @click="Dashboard" data-tooltip="ดูภาพรวมข้อมูลการจองและสถิติต่างๆ"><span><img src="setting.png" width=9%> Dashboard </span></button></p><br>
      </div>

      <div class="content">
        <div class="content-wrapper">
          <h1>Welcome to TU Archery Booking system</h1>
          <h4>You're in Super Staff mode. Please select a date on the calendar to view and manage bookings.</h4>
          <br>
          <!-- ใช้ FullCalendar ด้วยโหมด superstaff -->
          <div class="calendar-container">
            <StaffCalendar mode="superstaff" @date-selected="handleCalendarDateSelect" />
          </div>
        </div>
      </div>

      <!-- Booking Management PopUp -->
      <div class="booking-popup" v-if="showBookingPopup">
        <div class="booking-popup-content">
          <div class="booking-popup-header">
            <h2>Bookings for: {{ formatDisplayDate(selectedDate) }}</h2>
            <span class="close-btn" @click="closeBookingPopup">&times;</span>
          </div>
          <div class="booking-popup-body">
            <div v-if="bookings.length === 0" class="no-bookings">
              <p>No bookings for this date.</p>
            </div>
            
            <div v-else>
              <!-- Bookings Slot -->
              <div v-for="(booking, index) in bookings" :key="index" class="slot">
                <template v-if="booking.bookingStatusID !== 3">
                  <h2>Username: {{ booking.username }}</h2>
                  <h2>Name: {{ booking.name }}</h2>
                  <h2>Tel: {{booking.telNumber}}</h2>
                  <h2>Shift: {{ formatShiftTime(booking.shiftID) }}</h2>
                  <h2>Lane: {{ formatLaneNumber(booking.targetLaneID) }}</h2>
                  <button class="slipbtn" @click="showSlip(booking)">Payment</button>
                  <h2>Select Status</h2>
                  <select v-model="selectedStatus[index]" class="status-select" id="status">
                    <option v-if="!selectedStatus[index]" :value="null" disabled selected>Please select one:</option>
                    <option v-for="status in status" :key="status.id" :value="status.id">{{ status.name }}</option>
                  </select>
                  <button class="update-btn" @click="updateSingleBooking(booking.bookingID, index)" 
                          :disabled="!selectedStatus[index]">
                          Update Status
                  </button>
                  <br>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Payment Slip PopUp -->
      <div class="popup" id="popup">
        <a class="close" @click="closePopup">X</a>
        <p1>Payment Detail</p1>
        <p2>Bank:  {{ bankName }}</p2>
        <p2>Last 4 digits of account no.: {{ accountDigit }}</p2>
        <p2>Proceed date and time: {{ dateATime }}</p2>
        <p1>Booking for another person</p1>
        <p2>Name: {{ FriendName }}</p2>
        <p2>Tel: {{ FriendTel }}</p2>
      </div>
    </body>
  </div>
</template>

<script>
import axios from 'axios';
import NotToken from '../components/NotToken.vue';
import LogoutBotton from '../components/LogoutBotton.vue';
import StaffCalendar from './StaffCalendar.vue';
import Dashboard from './Dashboard.vue';

export default {
  components:{
    LogoutBotton,
    StaffCalendar
  },
  data() {
    return {
      roleName: '',
      name: '',
      selectedLane: '',
      selectedDate: '', // Selected date
      minDate: '',      // Minimum date
      maxDate: '',       // Maximum date
      status: [
        {id: 1, name: 'Pending'},
        {id: 2, name: 'Confirm'},
        {id: 3, name: 'Cancel'},
      ],
      bookings: [],
      tel: '',
      bankName: '',
      accountDigit: '',
      dateATime: '',
      FriendName: '',
      FriendTel: '',
      selectedStatus: [],
      showBookingPopup: false // เพิ่มตัวแปรควบคุมการแสดง popup
    };
  },
  mixins: [NotToken],
  methods: {
    // รับค่าวันที่จากปฏิทินเมื่อมีการคลิก
    handleCalendarDateSelect(formattedDate) {
      console.log("Received date from calendar:", formattedDate);
      this.selectedDate = formattedDate;
      this.fetchBookings(); // เรียกฟังก์ชันเพื่อดึงข้อมูลการจองสำหรับวันที่เลือก
    },
    formatShiftTime(shiftID) {
      // สร้าง mapping ระหว่าง shiftID และช่วงเวลา
      const shiftMap = {
        "1": "1 (17.00-17.30)",
        "2": "2 (17.30-18.00)"
      };
      
      // ตรวจสอบว่ามีค่าใน mapping หรือไม่
      return shiftMap[shiftID] || shiftID;
    },
    
    // Method สำหรับแปลงรหัส Lane เป็นหมายเลข Lane ที่เข้าใจง่าย
    formatLaneNumber(laneID) {
      // ถ้า laneID อยู่ในช่วง 101-106 ให้ลบ 100 ออก
      if (laneID >= 101 && laneID <= 106) {
        return laneID - 100;
      }
      return laneID; // ส่งค่าเดิมกลับถ้าไม่ตรงกับเงื่อนไข
    },
    
    // แสดงวันที่ในรูปแบบที่อ่านง่าย
    formatDisplayDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('th-TH', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    },
    
    booking() {
      console.log("กำลังนำทางไปยัง booking");
      this.$router.push("bookingProcess");
    },
    history() {
      this.$router.push("history");
    },
    cancel() {
      this.$router.push("cancel");
    },
    operation() {
      this.$router.push("operation");
    },
    shiftSchedule() {
      this.$router.push("shift-schedule");
    },
    StaffTimesheet() {
      this.$router.push("staff-timesheet");
    },
    Dashboard() {
      this.$router.push("Dashboard");
    },
    showSlip(booking) {
      const { username, bookingID } = booking;

      axios.get(`${import.meta.env.VITE_API_BASE_URL}/checkSlip`, { params: { username, bookId: bookingID } })
      .then(response => {
        this.bankName = response.data[0].bankName
        this.accountDigit = response.data[0].accountDigit
        this.dateATime = response.data[0].dateATime
        this.FriendName = response.data[0].FriendName || ''; 
        this.FriendTel = response.data[0].FriendTel || '';
        this.openPopup()
      })
      .catch(error => {
        console.error('Error fetching payment details:', error);
      });
    },
    openPopup(){
      popup.classList.add('open-popup')
    },
    closePopup(){
      popup.classList.remove('open-popup')
    },
    
    // ปิด popup การจัดการการจอง
    closeBookingPopup() {
      this.showBookingPopup = false;
    },
    
    // ดึงข้อมูลการจองและแสดง popup
    fetchBookings() {
      axios.get(`${import.meta.env.VITE_API_BASE_URL}/checkBookStaff`, { params: { date: this.selectedDate } })
      .then(response => {
        this.bookings = response.data;
        
        // กำหนดค่าเริ่มต้นอาร์เรย์ selectedStatus ด้วยสถานะการจองปัจจุบัน
        this.selectedStatus = this.bookings.map(booking => booking.bookingStatusID);
        
        // แสดง popup หลังจากดึงข้อมูลเสร็จ
        this.showBookingPopup = true;
      })
      .catch(error => {
        console.error('Error fetching bookings:', error);
      });
    },
    
    fetchOperation() {
      axios.get(`${import.meta.env.VITE_API_BASE_URL}/checkoperation`)
      .then(response => {
        if (response.data && response.data.length > 0) {
          const operationDay = response.data[0];
          const endDate = operationDay.endDate;
          localStorage.setItem("endDate", endDate);
        } else {
          console.error('No data received or invalid response format.');
        }
      })
      .catch(error => {
        console.error('Error fetching bookings:', error);
      });
    },

  // ฟังก์ชันสำหรับอัพเดตสถานะทีละรายการ
  updateSingleBooking(bookingID, index) {
      const selectedStatus = this.selectedStatus[index];
      
      if (!selectedStatus) {
        alert('กรุณาเลือกสถานะก่อนอัพเดต');
        return;
      }
      
      axios.post(`${import.meta.env.VITE_API_BASE_URL}/staffApprove`, {
        bookId: bookingID,
        status: selectedStatus
      })
      .then(response => {
        console.log(`อัพเดตสถานะสำหรับการจอง ID ${bookingID} สำเร็จ`);
        alert(`อัพเดตสถานะเรียบร้อยแล้ว!`);
        
        // รีโหลดข้อมูลการจองเพื่อแสดงสถานะล่าสุด
        this.fetchBookings();
      })
      .catch(error => {
        console.error(`เกิดข้อผิดพลาดในการอัพเดตสถานะสำหรับการจอง ID ${bookingID}:`, error);
        alert('เกิดข้อผิดพลาดในการอัพเดต โปรดลองอีกครั้ง');
      });
    }
  },
  mounted() {
    // Get today's date
    const today = new Date();

    // Set the minimum date to today
    this.minDate = today.toISOString().split('T')[0];

    // Get tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    // Set the maximum date to tomorrow
    this.maxDate = tomorrow.toISOString().split('T')[0];
    this.fetchOperation();
  }
}
</script>

<style scoped>
@import '@/assets/css/SuperStaffHome.css';
@import '@/assets/css/Calendar.css';

.tooltip-btn {
  position: relative;
}

.tooltip-btn::after {
  content: attr(data-tooltip);
  position: absolute;
  top: 50%;            /* ตำแหน่งกึ่งกลางด้านบนของปุ่ม */
  right: -10px;        /* เริ่มจากด้านขวาของปุ่ม */
  transform: translateX(100%) translateY(-50%); /* ย้ายไปทางขวา 100% และขึ้นข้างบน 50% */
  padding: 6px 10px;
  background: #333;
  color: white;
  border-radius: 6px;
  font-size: 14px;
  white-space: nowrap;
  visibility: hidden;
  opacity: 0;
  transition: 0.3s;
  z-index: 10;
}

.tooltip-btn::before {
  content: "";
  position: absolute;
  top: 50%;           /* ตำแหน่งกึ่งกลางด้านบนของปุ่ม */
  right: -10px;       /* เริ่มจากด้านขวาของปุ่ม */
  transform: translateY(-50%); /* ขึ้นข้างบน 50% */
  border-width: 5px;
  border-style: solid;
  border-color: transparent #333 transparent transparent; /* เปลี่ยนลูกศรชี้ไปทางซ้าย */
  visibility: hidden;
  opacity: 0;
  transition: 0.3s;
  z-index: 10;
}

.tooltip-btn:hover::after,
.tooltip-btn:hover::before {
  visibility: visible;
  opacity: 1;
}
</style>