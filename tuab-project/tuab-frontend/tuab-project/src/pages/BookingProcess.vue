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
          <br>
          <h1>Book the Archery</h1><br>
          <h2>Please select an available date on Calendar</h2><br>
          
          <UserCalendar/>
          <br><br><br><br><br><br>
  
        </div>
      </body>
    </div>
  </template>
  
  <script>
  import UserCalendar from './UserCalendar.vue';
  import NotToken from '../components/NotToken.vue';
  import axios from 'axios';
  export default {
    components:{
      UserCalendar
    },
    data() {
      return {
        status: false,
        roleName: '',
        roles: '',
        date: '2018-03-02', // YYYY-MM-DD
        selectedLane: '',
        name: '',
        selectedDate: '', // Selected date
        minDate: '',      // Minimum date
        maxDate: '',       // Maximum date
        lanes: [
        { id: 101, shifts: [{ id: 1, time: '17:00' }, { id: 2, time: '17:30' }] },
        { id: 102, shifts: [{ id: 1, time: '17:00' }, { id: 2, time: '17:30' }] },
        { id: 103, shifts: [{ id: 1, time: '17:00' }, { id: 2, time: '17:30' }] },
        { id: 104, shifts: [{ id: 1, time: '17:00' }, { id: 2, time: '17:30' }] },
        { id: 105, shifts: [{ id: 1, time: '17:00' }, { id: 2, time: '17:30' }] },
        { id: 106, shifts: [{ id: 1, time: '17:00' }, { id: 2, time: '17:30' }] }
      ]
      };
    },
    methods: {
      getIndexById(laneId) {
        const index = this.lanes.findIndex(lane => lane.id === laneId);
        return index !== -1 ? index + 1 : 0;
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
      selectLane(laneId, shiftId) {
        if (!this.selectedDate) {
          alert('please selected date')
          return;
        }
  
        const dataToSend = {
          date: this.selectedDate,
          lane: laneId,
          shift: shiftId
        }
  
        const friendName = this.friendName || null;
        const friendID = this.friendID || null;
        const friendTel = this.friendTel || null;
  
        this.$router.push({path: '/verify-info', query: dataToSend,});
      },
      async submitForm() {
        try {
          const dayOffResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/checkdayoff`, {
            params: {
              workDate: this.selectedDate
            }
          });
  
          if (dayOffResponse.data.length === 0) {
            const laneButtons = document.querySelectorAll('.blueround, .redround');
            laneButtons.forEach(button => {
              button.className = 'greyround';
              button.disabled = true;
            });
          } else {
            this.status = true;
            const bookingCheckResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/bookingcheck`, {
              params: {
                workDate: this.selectedDate
              }
            });
            const laneAvailabilityData = bookingCheckResponse.data;
            const workingShift = dayOffResponse.data.map(item => item.workingShift);
            const laneButtons = document.querySelectorAll('.blueround, .redround');
            
            laneButtons.forEach(button => {
              const laneId = button.getAttribute('data-lane-id');
              const shiftId = button.getAttribute('data-shift-id');
  
              const isLaneShiftAvailable = laneAvailabilityData.some(item => {
                return item.lane === parseInt(laneId) && item.shift === parseInt(shiftId);
              });
  
              if (workingShift.includes(1) && workingShift.includes(2) && workingShift.includes(3)) {
                if (shiftId === '1' || shiftId === '2') {
                  button.className = isLaneShiftAvailable ? 'blueround' : 'redround';
                } else {
                  button.className = 'greyround';
                }
              } else if (workingShift.includes(1) && workingShift.includes(3)) {
                if (shiftId === '1' || shiftId === '2') {
                  button.className = isLaneShiftAvailable ? 'blueround' : 'redround';
                } else {
                  button.className = 'greyround';
                }
              } else if (workingShift.includes(2) && workingShift.includes(3)) {
                if (shiftId === '1' || shiftId === '2') {
                  button.className = isLaneShiftAvailable ? 'blueround' : 'redround';
                } else {
                  button.className = 'greyround';
                }
              } else if (workingShift.includes(1)) {
                if (shiftId === '1') {
                  button.className = isLaneShiftAvailable ? 'blueround' : 'redround';
                } else {
                  button.className = 'greyround';
                }
              } else if (workingShift.includes(2)) {
                if (shiftId === '2') {
                  button.className = isLaneShiftAvailable ? 'blueround' : 'redround';
                } else {
                  button.className = 'greyround';
                }
              } else if (workingShift.includes(3)) {
                if (shiftId === '1' || shiftId === '2') {
                  button.className = isLaneShiftAvailable ? 'blueround' : 'redround';
                } else {
                  button.className = 'greyround';
                }
              } 
              button.disabled = false;
            });
          }
          } catch (error) {
            console.error('Error:', error);
          }
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
  
      const dateParam = this.$route.params.date;
      if (dateParam) {
        // กำหนดค่าวันที่ที่เลือกตามพารามิเตอร์
        this.selectedDate = dateParam;
        
        // เรียกใช้ฟังก์ชัน submitForm เพื่อแสดงเลนส์ที่ว่างโดยอัตโนมัติ
        this.$nextTick(() => {
          this.submitForm();
        })
      }
    },
    computed: {
      namebarStyle() {
        if (this.roleName === "Super Staff" || this.roleName === "Staff") {
          return { backgroundColor: '#90f2e3' };
        } else {
          return { backgroundColor: '#F9D871'};
        }
      }
    },
    mixins: [NotToken],
  }
  </script>
  
  <style scoped>
  @import '@/assets/css/Calendar.css';
  @import '@/assets/css/Booking.css';
  </style>