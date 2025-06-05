<template lang="">
  <div class="container">
    <body>
      <div class="menubar">
        <div class="namebar" :style="namebarStyle">
          <h3>{{roleName}}: {{name}}
            <img v-if="roleName === 'Super Staff'" src="/crown.png" width="20x" height="20px"> 
            <img v-if="roleName === 'Super Staff'" src="/crown.png" width="20x" height="20px"> 
            <img v-else-if="roleName === 'Staff'" src="/crown.png" width="20x" height="20px"> 
          </h3>
        </div>
        <br><br>
        <p Align=center><button class="backbtn" @click="backhome"><span> BACK </span></button></p><br>
      </div>

      <div class="content">
        <br><br><br>
        <h1>Booking History</h1>
        <br>
        
        <div class="content2">
          <!-- กลุ่มการจองตามวันที่ -->
          <div v-for="(bookingGroup, date) in groupedBookings" :key="date" class="date-group">
            <div class="date-header">{{ formatDateHeader(date) }}</div>
            
            <div v-for="(booking, index) in bookingGroup" :key="booking.bookingID" class="booking-item">
              <div class="booking-info-row">
                <!-- ข้อมูลเลน -->
                <div class="lane-box">Lane {{ booking.targetLaneID }}</div>
                
                <!-- ข้อมูลเวลาการจอง -->
                <div class="time-box">{{ booking.shiftID }}</div>
                
                <!-- ข้อมูลสถานะ -->
                <div v-if="booking.bookingStatusID === 1" class="time-info pending-time">
                  <strong>Pending</strong>
                </div>
                <div v-if="booking.bookingStatusID === 3 && booking.cancelTime" class="time-info cancel-time">
                  <strong>Canceled:</strong> {{ formatCancelTime(booking.cancelTime) }}
                </div>
                <div v-if="booking.bookingStatusID === 2 && booking.confirmTime" class="time-info confirm-time">
                  <strong>Confirmed:</strong> {{ formatConfirmTime(booking.confirmTime) }}
                </div>
                
                <!-- ปุ่ม Payment -->
                <!-- <button class="payment-btn" 
                      :class="{ 'disabled-btn': booking.bookingStatusID === 2 || booking.bookingStatusID === 3 }" 
                      @click="addslip(booking.bookingID)"
                      :disabled="booking.bookingStatusID === 2 || booking.bookingStatusID === 3">
                  PAYMENT
                </button> -->
              </div>
            </div>
          </div>
          <br><br>
        </div>
      </div>
    </body>
  </div>
</template>

<script>
import NotToken from '../components/NotToken.vue';
import axios from 'axios';
export default {
  data() {
    return {
      roleName: '',
      name: '',
      username: '',
      roles: '',
      bookings: []
    };
  },
  mixins: [NotToken],
  mounted() {
    this.username = localStorage.getItem("username");
    this.name = localStorage.getItem("name") || '';
    this.roleName = localStorage.getItem("roleName") || '';
    this.roles = localStorage.getItem("roles") || '';
    this.fetchBookings();
    
    // Log ข้อมูลดิบเพื่อตรวจสอบ
    axios.get(`${import.meta.env.VITE_API_BASE_URL}/filterBookMonth`, {params: {username: this.username}})
      .then(response => {
        console.log('Raw booking data sample:', response.data[0]);
      });
  },
  computed: {
    namebarStyle() {
      if (this.roleName === "Super Staff") {
        return { backgroundColor: '#90f2e3' };
      } else if (this.roleName === "Staff") {
        return { backgroundColor: '#90f2e3' };
      } else {
        return { backgroundColor: '#F9D871' };
      }
    },
    // จัดกลุ่มการจองตามวันที่
    groupedBookings() {
      const grouped = {};
      
      this.bookings.forEach(booking => {
        const bookingDate = booking.bookingDate;
        if (!grouped[bookingDate]) {
          grouped[bookingDate] = [];
        }
        grouped[bookingDate].push(booking);
      });
      
      // เรียงลำดับตาม Lane ID ในแต่ละวัน
      for (const date in grouped) {
        grouped[date].sort((a, b) => a.targetLaneID - b.targetLaneID);
      }
      
      return grouped;
    }
  },
  methods: {
    // แสดงข้อความสถานะ
    getStatusText(statusID) {
      switch (parseInt(statusID)) {
        case 1: return 'รอการยืนยัน';
        case 2: return 'ยืนยันแล้ว';
        case 3: return 'ยกเลิกแล้ว';
        default: return 'ไม่ทราบสถานะ';
      }
    },
    
    formatCancelTime(timeString) {
      if (!timeString) return '';
      
      try {
        // เนื่องจากเวลาถูกแปลงแล้วจาก server ให้ใช้ค่าโดยตรง
        if (timeString.includes('/')) {
          return timeString;
        }
        
        const date = new Date(timeString);
        if (isNaN(date.getTime())) return timeString;
        
        // จัดรูปแบบ: วัน/เดือน/ปี ชั่วโมง:นาที
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        
        return `${day}/${month}/${year} ${hours}:${minutes}`;
      } catch (error) {
        console.error('Error formatting cancel time:', error);
        return timeString;
      }
    },

    // ฟังก์ชันสำหรับแสดงเวลาที่ยืนยัน
    formatConfirmTime(timeString) {
      if (!timeString) return '';
      
      try {
        // เนื่องจากเวลาถูกแปลงแล้วจาก server ให้ใช้ค่าโดยตรง
        if (timeString.includes('/')) {
          return timeString;
        }
        
        const date = new Date(timeString);
        if (isNaN(date.getTime())) return timeString;
        
        // จัดรูปแบบ: วัน/เดือน/ปี ชั่วโมง:นาที
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        
        return `${day}/${month}/${year} ${hours}:${minutes}`;
      } catch (error) {
        console.error('Error formatting confirm time:', error);
        return timeString;
      }
    },
    
    // ฟังก์ชันจัดรูปแบบวันที่
    formatDate(dateString) {
      if (!dateString) return '';
      
      // ตรวจสอบรูปแบบวันที่ก่อน
      if (dateString.includes('-')) {
        const parts = dateString.split('-');
        if (parts.length === 3) {
          // ถ้าเป็นรูปแบบ YYYY-MM-DD
          if (parts[0].length === 4) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
          }
          // ถ้าเป็นรูปแบบ DD-MM-YYYY
          else if (parts[2].length === 4) {
            return `${parts[0]}/${parts[1]}/${parts[2]}`;
          }
        }
      }
      
      // กรณีอื่นๆ แปลงเป็น Date object และจัดรูปแบบ
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
          return dateString; // ถ้าแปลงไม่ได้ ส่งค่าเดิมกลับไป
        }
        
        // จัดรูปแบบวันที่เป็น DD/MM/YYYY
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        
        return `${day}/${month}/${year}`;
      } catch (error) {
        console.error('Error formatting date:', error);
        return dateString;
      }
    },

    formatDateHeader(dateString) {
      // ใช้ฟังก์ชัน formatDate ที่มีอยู่แล้ว
      return this.formatDate(dateString);
    },
    
    fetchBookings() {
      axios.get(`${import.meta.env.VITE_API_BASE_URL}/filterBookMonth`, {params: {username: this.username}})
      .then(response => {
        const bookings = response.data;
        // เรียงตามวันที่และ Lane ID
        bookings.sort((a, b) => {
          // เรียงตามวันที่ (ล่าสุดขึ้นก่อน)
          const dateA = new Date(this.parseDateString(a.bookingDate));
          const dateB = new Date(this.parseDateString(b.bookingDate));
          
          if (dateA > dateB) return -1;
          if (dateA < dateB) return 1;
          
          // ถ้าวันที่เท่ากัน เรียงตาม Lane ID
          return a.targetLaneID - b.targetLaneID;
        });
        
        console.log('Parsed bookings data:', bookings);
        this.bookings = bookings;
      })
      .catch(error => {
        console.error('Error fetching bookings:', error);
      });
    },
    
    // Helper function สำหรับแปลงรูปแบบวันที่ DD/MM/YYYY หรือ DD-MM-YYYY เป็น YYYY-MM-DD
    parseDateString(dateStr) {
      if (!dateStr) return new Date();
      
      try {
        // รองรับรูปแบบ DD/MM/YYYY หรือ DD-MM-YYYY
        if (dateStr.includes('/')) {
          const parts = dateStr.split('/');
          if (parts.length === 3) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
          }
        } else if (dateStr.includes('-')) {
          const parts = dateStr.split('-');
          if (parts.length === 3) {
            // ถ้าเป็นรูปแบบ DD-MM-YYYY
            if (parts[2].length === 4) {
              return `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
            // ถ้าเป็นรูปแบบ YYYY-MM-DD (เป็นรูปแบบที่ถูกต้องสำหรับ Date แล้ว)
            else if (parts[0].length === 4) {
              return dateStr;
            }
          }
        }
        
        // ถ้าไม่ตรงกับรูปแบบใดๆ ส่งคืนค่าเดิม
        return dateStr;
      } catch (error) {
        console.error('Error parsing date string:', error);
        return dateStr;
      }
    },
    
    backhome () {
      if(this.roles == '1'){
        this.$router.push('/general-home')
      }
      else if(this.roles == '2'){
        this.$router.push('/superStaff-home')
      }
      else if(this.roles == '3'){
        this.$router.push('/staff-home')
      }
    },
    addslip (bookingID) {
      this.$router.push({
        path: '/add-payment',
        query: { bookingID: bookingID }
      });
    },
  },
}  
</script>

<style scoped>
@import '@/assets/css/History.css';
</style>