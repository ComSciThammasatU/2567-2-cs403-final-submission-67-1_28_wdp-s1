<template lang="">
  <div class="container">
    <body>
      <div class="menubar">
        <div class="namebar"  :style="namebarStyle">
          <h4>{{roleName}}: {{name}}
              <img v-if="roleName === 'Super Staff'" src="/crown.png" width="20x" height="20px"> 
              <img v-if="roleName === 'Super Staff'" src="/crown.png" width="20x" height="20px"> 
          </h4>
        </div>
        <br><br>
        <p Align=center><button class="backbtn" @click="backbook"><span> BACK </span></button></p><br>
      </div>

      <div class="content" v-if="status">
        <br><br>
        <h1>You are about to book an archery lane</h1><br>
        <h2>Please verify the following information before proceed.</h2><br><br><br>
        <div class="line">
        <h2>Date:</h2> <span class="info">{{ date }}</span>
        <h2>Time:</h2> <span class="info">{{ Rshift }}</span>
        </div>

        <div class="line">
        <h2>Lane:</h2> <span class="info">{{ Tlane }}</span>
        <h2>Name:</h2> <span class="info">{{ name }}</span>
        </div>

        <div class="line">
        <h2>Student ID:</h2> <span class="info">{{ username }}</span><br>
        </div>

        <div class="line">
        <h2>Tel Number:</h2> <input type="text" v-model="tel" maxlength="10"> 
        <h3>Please fill-in your tel number (example: 0812345678)*</h3>
        </div>

        <div class="line">
        <h5>Would you like to make a reservation for someone else?</h5>
        </div>

        <div class="box">
          <input type="checkbox" id="reserveForFriend" v-model="reserveForFriend" class="small-checkbox">
        </div>

        <div v-if="reserveForFriend">
          
          <div class="line">
            <h2>Student ID:</h2><input type="text" v-model="friendID">
          </div>

          <div class="line2">
            <h2>Name:</h2><input type="text" v-model="friendName">
          </div>

          <div class="line">
            <h2>Tel Number:</h2><input type="text" v-model="friendTel" maxlength="10">
          </div>
          
        </div>
        
        <br>
        <center><button class="submit" type="submit" @click="payment"><span> NEXT </span></button></center>
        <br><br>
      </div>
      <div class="content" v-else>
        <br><br><br>
        <h1>Please verify information</h1><br><br>
        <h2>Date</h2><div class="info"> {{date}} </div><br><br>
        <h2>Lane</h2><div class="info"> {{Tlane}} </div><br><br>
        <h2>Time</h2><div class="info"> {{Rshift}} </div><br><br>
        <h2>Name</h2><div class="info"> {{name}} </div><br><br>
        <h2>Student ID</h2><div class="info"> {{username}} </div><br><br>
        <h2>Tel Number</h2><div class="info"> {{tel}} </div><br>
        <h3>Please fill-in and verify your tel number (example: 0812345678)*</h3><br>



        <center><button class="submit" type="submit" @click="payment"><span> NEXT </span></button></center>
        <br><br>
      </div>
    </body>
  </div>
</template>

<script>
import axios from 'axios';
import NotToken from '../components/NotToken.vue';
export default {
  data() {
    return {
      status: true,
      roleName: '',
      name: '',
      username: '',
      tel: '',
      date: '',
      Tlane: '',
      Rshift: '',
      reserveForFriend: false,
      friendName: '',
      friendID: '',
      friendTel: ''
    };
  },
  methods: {
    backbook () {
      this.$router.push('/booking')
    },

    payment () {
      const { date, lane, shift } = this;
      const formData = {
        date: this.date,
        lane: this.lane,
        username: this.username,
        shift: this.shift,
        reserveForOther: this.reserveForOther,
        friendName: this.friendName || null,
        friendID: this.friendID || null,
        friendTel: this.friendTel || null
      };
      localStorage.setItem("date", date)
      localStorage.setItem("lane", lane)
      localStorage.setItem("shift", shift)

      axios.post(`${import.meta.env.VITE_API_BASE_URL}/booking`, formData)
      .then(response => {
        console.log('Booking saved successfully!');
        this.openPopup();
      })
      .catch(error => {
        console.error('Error saving Booking:', error);
      });

      if (this.status = true) {
        const telFormData = {
          tel: this.tel,
          username: this.username
        };

        axios.post(`${import.meta.env.VITE_API_BASE_URL}/addTelnumber`, telFormData)
        .then(response => {
          console.log('TelNumber updated successfully!');
        })
        .catch(error => {
          console.error('Error updating TelNumber:', error);
        });
      }
      this.$router.push('/payment')
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
  mounted() {
    const { date, lane, shift } = this.$route.query;
    this.date = date
    this.lane = lane
    this.shift = shift
    var Tlane
    if (this.lane == '101') {
      this.Tlane = "1"
    } else if (this.lane == '102') {
      this.Tlane = "2"
    } else if (this.lane == '103') {
      this.Tlane = "3"
    } else if (this.lane == '104') {
      this.Tlane = "4"
    } else if (this.lane == '105') {
      this.Tlane = "5"
    } else if (this.lane == '106') {
      this.Tlane = "6"
    }
    var Rshift
    if (this.shift == '1') {
      this.Rshift = "17:00"
    } else if (this.shift == '2') {
      this.Rshift = "17:30"
    }

    if (this.tel) {
      this.status = false;
    }
  },
}
</script>

<style scoped>
@import '@/assets/css/VerifyInfo.css';
</style>