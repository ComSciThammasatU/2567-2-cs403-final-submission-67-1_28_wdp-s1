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
          
          <SuperStaffDashboard/>
          
        </div>
      </body>
    </div>
  </template>
  
  <script>
  import NotToken from '../components/NotToken.vue';
  import axios from 'axios';
  import SuperStaffDashboard from './SuperStaffDashboard.vue';
  export default {
    components:{
    SuperStaffDashboard
  },

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
     
    },
    methods: {
    
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
      
    },
  }  
  </script>
  
  <style scoped>
  @import '@/assets/css/Dashboard.css';
  </style>