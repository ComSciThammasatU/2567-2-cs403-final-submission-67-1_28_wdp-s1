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
        <h1>Cancel Booking</h1>
        <br>
        
        <div class="content2">
          <!-- Group bookings by date -->
          <div v-for="(bookingGroup, date) in groupedBookings" :key="date" class="date-group">
            <div class="date-header">{{ formatDateHeader(date) }}</div>
            
            <div v-for="(booking, index) in bookingGroup" :key="index" class="booking-item">
              <div class="booking-info-row">
                <!-- Lane information -->
                <div class="lane-box">Lane {{ booking.targetLaneID }}</div>
                
                <!-- Shift/Time information -->
                <div class="time-box">{{ booking.shiftID }}</div>
                
                <!-- Cancel button -->
                <button class="cancel-btn" @click="cancelBooking(booking)">
                  CANCEL
                </button>
              </div>
            </div>
          </div>
          <br><br>
        </div>
      </div>
    
      <!-- Confirmation Popup -->
      <div class="popup" id="popup">
        <a class="close" @click="closePopup">X</a>
        <img src="warning.png" width=40% height=40%><br>
        <h5>Cancel your booking?</h5><br>
        <h6>Please click SUBMIT below, to cancel your booking</h6><br>
        <button type="submit" @click="submitCancellation"> SUBMIT </button>
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
      bookings: [],
      bookingToCancel: null
    };
  },
  methods: {
    fetchBookings() {
      const today = new Date().toISOString().split('T')[0];
      const futureDate = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

      axios.get(`${import.meta.env.VITE_API_BASE_URL}/bookingHistory`, {
        params: {
          username: this.username
        }
      })
      .then(response => {
        console.log('Retrieved bookings:', response.data);
        const filteredBookings = response.data.filter(booking => {
          // Parse booking date from YYYY-MM-DD to Date object
          const parts = booking.bookingDate.split('-');
          const bookingDate = new Date(
            parseInt(parts[0]),  // year
            parseInt(parts[1]) - 1,  // month (0-11)
            parseInt(parts[2])   // day
          );
          
          const bookingStatusID = parseInt(booking.bookingStatusID);
          console.log(`Booking ID: ${booking.bookingID}, Status: ${bookingStatusID}, Date: ${bookingDate}, Shift: ${booking.shiftID}`);
          
          const isNotCancelledOrRejected = bookingStatusID !== 3;
          const isWithinDateRange = bookingDate >= new Date(today) && bookingDate <= new Date(futureDate);

          return isNotCancelledOrRejected && isWithinDateRange;
        });
        
        console.log('Filtered bookings:', filteredBookings);
        this.bookings = filteredBookings;
      })
      .catch(error => {
        console.error('Error fetching bookings:', error);
      });
    },
    
    // Format date from YYYY-MM-DD to YYYY-MM-DD
    formatDateForMySQL(dateString) {
      try {
        // If already in YYYY-MM-DD format
        const datePattern = /^\d{4}-\d{2}-\d{2}$/;
        if (datePattern.test(dateString)) {
          return dateString;
        }
        
        // If in DD-MM-YYYY format
        if (dateString.includes('-')) {
          const parts = dateString.split('-');
          if (parts.length === 3) {
            // Check if year has 4 digits
            if (parts[0].length === 4) {
              // Already in YYYY-MM-DD format
              return dateString;
            } else if (parts[2].length === 4) {
              // In DD-MM-YYYY format
              return `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
          }
        }
        
        // If doesn't match any supported format, try to convert to Date object
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
        
        console.error('Invalid date format:', dateString);
        return dateString;
      } catch (error) {
        console.error('Error formatting date:', error);
        return dateString;
      }
    },
    
    cancelBooking(booking) {
      this.bookingToCancel = booking;
      console.log('Selected booking for cancellation:', booking);
      this.openPopup();
    },
    
    submitCancellation() {
      if (!this.bookingToCancel) {
        console.error('No booking selected for cancellation');
        this.closePopup();
        return;
      }

      console.log('Cancelling booking:', this.bookingToCancel);
      
      // Format the date correctly
      const formattedDate = this.formatDateForMySQL(this.bookingToCancel.bookingDate);
      console.log('Original date:', this.bookingToCancel.bookingDate);
      console.log('Formatted date for API:', formattedDate);
      
      // Convert targetLaneID back to the format stored in the database (if DB stores as 101-106)
      const originalLaneID = parseInt(this.bookingToCancel.targetLaneID) + 100;
      
      // Send shiftID to cancel the specific time slot
      axios.post(`${import.meta.env.VITE_API_BASE_URL}/cancelBooking`, {
        date: formattedDate,
        status: 3, // Cancel status
        username: this.username,
        targetLaneID: originalLaneID,
        shiftID: this.bookingToCancel.shiftID
      })
      .then(response => {
        console.log('Booking canceled successfully:', response.data);
        
        // Remove the canceled booking from the bookings array
        this.bookings = this.bookings.filter(booking => 
          !(booking.bookingDate === this.bookingToCancel.bookingDate && 
            booking.targetLaneID === this.bookingToCancel.targetLaneID &&
            booking.shiftID === this.bookingToCancel.shiftID)
        );
        
        alert('Booking canceled successfully!');
        
        this.closePopup();
        this.bookingToCancel = null;
        this.fetchBookings(); // Refresh bookings
      })
      .catch(error => {
        console.error('Error canceling booking:', error);
        alert('An error occurred while canceling your booking. Please try again.');
        console.log('Error details:', error.response ? error.response.data : error.message);
        this.closePopup();
        this.bookingToCancel = null;
      });
    },
    
    // Format date for display in the header
    formatDateHeader(dateString) {
      if (!dateString) return '';
      
      try {
        // Check date format first
        if (dateString.includes('-')) {
          const parts = dateString.split('-');
          if (parts.length === 3) {
            // If format is YYYY-MM-DD
            if (parts[0].length === 4) {
              return `${parts[2]}/${parts[1]}/${parts[0]}`;
            }
            // If format is DD-MM-YYYY
            else if (parts[2].length === 4) {
              return `${parts[0]}/${parts[1]}/${parts[2]}`;
            }
          }
        }
        
        // Otherwise, convert to Date object and format
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
          return dateString; // If conversion fails, return original
        }
        
        // Format date as DD/MM/YYYY
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        
        return `${day}/${month}/${year}`;
      } catch (error) {
        console.error('Error formatting date:', error);
        return dateString;
      }
    },
    
    backhome() {
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
    openPopup(){
      popup.classList.add('open-popup')
    },
    closePopup(){
      popup.classList.remove('open-popup')
      this.bookingToCancel = null;
    }
  },
  computed: {
    namebarStyle() {
      if (this.roleName === "Super Staff" || this.roleName === "Staff") {
        return { backgroundColor: '#90f2e3' };
      } else {
        return { backgroundColor: '#F9D871'};
      }
    },
    // Group bookings by date
    groupedBookings() {
      const grouped = {};
      
      this.bookings.forEach(booking => {
        const bookingDate = booking.bookingDate;
        if (!grouped[bookingDate]) {
          grouped[bookingDate] = [];
        }
        grouped[bookingDate].push(booking);
      });
      
      // Sort by lane ID within each date
      for (const date in grouped) {
        grouped[date].sort((a, b) => a.targetLaneID - b.targetLaneID);
      }
      
      return grouped;
    }
  },
  mixins: [NotToken],
  mounted() {
    this.username = localStorage.getItem("username");
    this.name = localStorage.getItem("name") || '';
    this.roleName = localStorage.getItem("roleName") || '';
    this.roles = localStorage.getItem("roles") || '';
    this.fetchBookings();
  },
}  
</script>

<style scoped>
body {
  background-color: #DFE9F5;
  width:100%;
}

.namebar {
  background-color: #F9D871;
  width: 100%;
  float: left;
}

h3 {
  color: #000000;
  font-size: 90%;
  font-family: Verdana;
  text-align: center;
  padding-top: 2%;
  padding-bottom: 2%;
  text-transform: uppercase;
}

.menubar {
  background-color: #abc3e8;
  width: 25%;
  height:100%;
  padding-bottom: 47%;
  float: left;
  display: flex;
  flex-direction: column;
}

.content {
  background-color: #DFE9F5;
  width: 75%;
  float: left;
}

.backbtn {
  border-radius: 10px;
  background-color: #3871c5;
  font-family: Verdana;
  color: #FFFFFF;
  text-align: center;
  font-size: 100%;
  width: 80%;
  height: 60px;
  transition: all 0.5s;
  cursor: pointer;
  margin: 5px;
}

.backbtn span {
  cursor: pointer;
  display: inline-block;
  position: relative;
  transition: 0.6s;
}

.backbtn span:after {
  content:'<';
  position: absolute;
  opacity: 0;
  top: 0;
  left: -5%;
  transition: 0.6s;
}

.backbtn:hover span {
  padding-left: 10%;
}

.backbtn:hover span:after {
  opacity: 1;
  left: 0;
}

h1 {
  color: #000000;
  font-size: 200%;
  font-weight: bold;
  font-family: Verdana;
  padding-left: 10%;
}

h5 {
  font-size: 140%;
  font-weight: bold;
  font-family: Verdana;
}

h6 {
  font-size: 100%;
  font-family: Verdana;
}

.container {
  display: flex;
}

/* Group styling */
.date-group {
  margin-bottom: 30px;
  width: 90%;
  margin-left: 5%;
}

/* Date header styling */
.date-header {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  padding: 10px 15px;
  background-color: #e3eaf2;
  border-radius: 8px 8px 0 0;
  border-bottom: 2px solid #c5d4eb;
  margin-bottom: 0;
}

/* Booking item styling */
.booking-item {
  padding: 15px;
  background-color: rgba(240, 245, 250, 0.7);
  border-bottom: 1px solid #dde6f2;
}

.booking-item:last-child {
  border-bottom: none;
  border-radius: 0 0 8px 8px;
}

/* Flexbox row for booking info */
.booking-info-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

/* Lane and time box styling */
.lane-box, .time-box {
  background-color: rgba(120, 144, 180, 0.2);
  color: #2c3e50;
  border: 1px solid rgba(120, 144, 180, 0.3);
  padding: 8px 15px;
  border-radius: 6px;
  font-weight: 500;
  text-align: center;
  min-width: 90px;
}

/* Status styling */
.time-info {
  font-size: 0.9em;
  display: inline-block;
  border-radius: 6px;
  width: auto;
  min-width: 230px;
  text-align: center;
  padding: 8px 12px;
  line-height: 1.4;
  font-weight: 500;
  overflow: hidden;
  box-sizing: border-box;
  white-space: nowrap;
}

/* Pending status */
.pending-time {
  background-color: rgba(255, 193, 7, 0.15);
  border: 1px solid rgba(255, 193, 7, 0.3);
  color: #856404;
}

/* Cancel button */
.cancel-btn {
  border-radius: 6px;
  background-color: #ED2939;
  font-family: Verdana;
  font-weight: bold;
  color: #FFFFFF;
  text-align: center;
  font-size: 14px;
  padding: 8px 15px;
  min-width: 120px;
  transition: all 0.3s;
  cursor: pointer;
  margin-left: auto; /* Push button to the right */
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.cancel-btn:hover {
  background-color: #f06772;
}

/* Popup styling */
.popup {
  width: 30%;
  background: #ebebeb;
  border-radius: 10px;
  box-shadow: 0 5px 5px rgba(0,0,0,0.2);
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.1);
  text-align: center;
  visibility: hidden;
  transition: all 0.4s ease-in-out;
  z-index: 1000;
}

.open-popup {
  visibility: visible;
  top: 50%;
  transform: translate(-50%, -50%) scale(1);
}

.popup img {
  padding-top: 8%;
  padding-bottom: 2%;
}

.popup button {
  width: 60%;
  margin-top: 7%;
  margin-bottom: 7%;
  padding: 10px 0;
  background-color: #013399;
  color: #FFFFFF;
  font-family: Verdana;
  font-size: 120%;
  font-weight: bolder;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 5px 5px rgba(0,0,0,0.2);
  border: none;
}

.popup button:hover {
  background-color: #3871c5;
}

.popup .close {
  position: absolute;
  top: 20px;
  right: 30px;
  transition: all 200ms;
  font-size: 30px;
  cursor: pointer;
  text-decoration: none;
  color: #000000;
}

/* Responsive styles */
@media screen and (max-width: 768px) {
  .booking-info-row {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .lane-box, .time-box, .time-info, .cancel-btn {
    width: 100%;
    margin-bottom: 8px;
    margin-left: 0;
  }
  
  .time-info {
    min-width: unset;
  }
  
  .container {
    width: 100%;
    padding: 0 20px;
  }
  
  .namebar {
    width: 100%;
    padding: 0 20px;
  }
  
  .popup {
    width: 80%;
  }
}

@media screen and (max-width: 576px) {
  .container {
    width: 100%;
    padding: 0 20px;
  }
  
  .namebar {
    width: 100%;
    padding: 0 20px;
  }
}
</style>