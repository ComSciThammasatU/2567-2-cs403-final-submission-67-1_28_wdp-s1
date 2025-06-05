<template lang="">
  <div class="container">
    <body>
      <div class="menubar">
        <div class="namebar">
            <h4>{{roleName}}: {{name}}
              <img v-if="roleName === 'Super Staff'" src="/crown.png" width="20x" height="20px"> 
              <img v-if="roleName === 'Super Staff'" src="/crown.png" width="20x" height="20px"> 
            </h4>
        </div>
        <br><br>
        <p Align=center><button class="backbtn" @click="backhome"><span> BACK </span></button></p><br>
      </div>

      <div class="content">
        <br>
        <h1>Edit Settings</h1>
        <h2>Please select start and end date to set an opening day</h2><br>

        <div class="operation-components">
          <div class="calendar-wrapper">
            <OperationCalendar/>
          </div>
          <br><br><br><br><br><br>
          <div class="list-wrapper">
            <OperationList/>
          </div>
        </div>
      </div> 
    </body>
  </div>
</template>

<script>
import NotToken from '../components/NotToken.vue';
import axios from 'axios';
import OperationCalendar from './OperationCalendar.vue';
import OperationList from './OperationList.vue';

export default {
  components:{
    OperationCalendar,
    OperationList
  },
  data() {
    return {
      isSubmitting: false,
      roleName: '',
      startDate: '',
      endDate:'',
      minDate: '',      // Minimum date
      name: '',
      holidays: [],
    };
  },
  methods: {
    async fetchHolidays() {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/holidays`);
      this.holidays = response.data.holidays
        .filter(holiday => holiday.public)  // กรองเฉพาะวันหยุดที่ public: true
        .map(holiday => holiday.date);      // เก็บแค่วันที่

      console.log(this.holidays);  // ตรวจสอบข้อมูลที่ดึงมา
    } catch (error) {
      console.error('Error fetching holidays:', error);
    }
  },

  isDateDisabled(date) {
    const day = new Date(date).getDay();
    
    // วันเสาร์ (6) หรือวันอาทิตย์ (0)
    const isWeekend = (day === 0 || day === 6);

    // วันหยุดนักขัตฤกษ์
    const isHoliday = this.holidays.includes(date);
    
    // ไม่สามารถเลือกวันเสาร์, อาทิตย์ หรือวันหยุด
    return isWeekend || isHoliday;
  }, 
    
  backhome() {
      this.$router.push('/superStaff-home')
      localStorage.removeItem("opID");
    },
    fetchOperation() {
      axios.get(`${import.meta.env.VITE_API_BASE_URL}/checkoperation`)
      .then(response => {
        if (response.data && response.data.length > 0) {
          const operationDay = response.data[0];
          const operationID = operationDay.operationID;
          localStorage.setItem("opID", operationID);
        } else {
          console.error('No data received or invalid response format.');
        }
      })
      .catch(error => {
        console.error('Error fetching bookings:', error);
      });
    },
    submitForm() {
      if (this.startDate && this.endDate && this.startDate === this.endDate){
        this.openPopupForAlert();
        return;
      }

      if (this.startDate && this.endDate && !this.isSubmitting && this.startDate !== this.endDate) {
        this.isSubmitting = true;
        const formData = {
          opID: localStorage.getItem("opID"),
          Nstart: this.startDate,
          Nend: this.endDate
        };

        console.log('Sending form data:', formData); 

        axios.post(`${import.meta.env.VITE_API_BASE_URL}/editoperation`, formData)
        .then((response) => {
          console.log('Response from server:', response);
          this.openPopup();
        })
        .catch((error) => {
          console.error('Error inserting operation into database:', error);
        })
        .finally(() => {
          this.isSubmitting = false;
        });
      }
    },
    openPopup(){
      const completePopup = document.getElementById('completePopup');
      completePopup.classList.add('open-popup')
    },
    closePopup(){
      const completePopup = document.getElementById('completePopup');
      completePopup.classList.remove('open-popup')
    },
    openPopupForAlert(){
      const completePopup = document.getElementById('completePopupForAlert');
      completePopup.classList.add('open-popup')
    },
    closePopupForAlert(){
      const completePopup = document.getElementById('completePopupForAlert');
      completePopup.classList.remove('open-popup')
    },
    disableWeekends (date) {
      const day = new Date(date).getDay()
      return day === 0 || day === 6
    },
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
    this.fetchHolidays();

    console.log(this.holidays)
  },
  computed: {
  nextDayStartDate() {
    if (this.startDate) {
      const date = new Date(this.startDate);
      date.setDate(date.getDate() + 1);
      return date.toISOString().split('T')[0];
    } 
    return null; // หากยังไม่มี startDate
  }
},
  mixins: [NotToken],
}
</script>

<style scoped>
@import '@/assets/css/Operation.css';
@import '@/assets/css/Calendar.css';

.operation-components {
  display: flex;
  flex-direction: column;
  gap: 20px; /* ระยะห่างระหว่างคอมโพเนนต์ */
  width: 100%;
}

.calendar-wrapper {
  width: 100%;
}

.list-wrapper {
  width: 100%;
  margin-top: 20px; /* เพิ่มระยะห่างด้านบน */
}
</style>