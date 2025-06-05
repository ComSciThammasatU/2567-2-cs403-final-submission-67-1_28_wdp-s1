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
        <p Align=center><button class="backbtn" @click="backverify"><span> BACK </span></button></p><br>
      </div>

      <div class="content">
        <br><br><br>
        <h1>Bank Transfer</h1><br><br>
        <center>
          <h2>20 THB</h2><br>
          <img src="bkkbank.jpg" width=60% height=20%>
        </center>
        <br>
        <h5>Please check the account no., account name, and the amount of money prior<br>to completing your transfer</h5>
        <n1>Note: When finish your payment, please insert the payment detail below.</n1>     

        <!-- Payment detail -->
        <h1>Your payment detail</h1><br>
        <form @submit.prevent="upload">
          <h4>Please select bank: </h4>
          <select v-model="selectedBank" id="bank" required>
              <option v-for="bank in bank" :key="bank.id" :value="bank">{{ bank.name }}</option>
          </select>
          <br><br>
          <h4>Last 4 digits of your account no.: </h4>
          <input class="bankno" type="text" v-model="bankno" maxlength="4" required>
          <br><br>
          <h4>Proceed date and time: </h4>
          <input class="datepicker" v-model="proceedDate" type="datetime-local" required>
          <h6>Note: Please pay within 1 hour and after submitting your payment, please wait for our confirming</h6>
          <center><button class="submit" type="submit" @click="upload">SUBMIT</button></center>
        </form>
      </div>

      <div class="popup" id="popup">
        <img src="paychecked.png" width=30% height=30%><br>
          <h7>Thank you for supporting us!</h7><br>
          <h8>We have recieving your slip photo, Please wait for our confirming</h8><br>
          <button type="submit" @click="closePopup">DONE</button>
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
        selectedBank: null,
        proceedDate: '',
        bankno: '',
        bank: [
          {id: null, name: 'Please select bank:'},
          {id: 1, name: 'KTB - Krungthai Bank'},
          {id: 2, name: 'KBANK - Kasikorn Bank'},
          {id: 3, name: 'SCB - Siam Commercail Bank'},
          {id: 4, name: 'BBL - Bangkok Bank'},
          {id: 5, name: 'TTB - TTB Thanachart'},
          {id: 6, name: 'BAY - Krungsri Bank'},
          {id: 7, name: 'UOBT - United Overseas Bank Thai'},
          {id: 8, name: 'etc.'},
        ],
        isSubmitting: false,
      };
    },
    methods: {
      backverify () {
        this.$router.push('/history')
      },
      upload () {
        if(!this.isSubmitting && this.selectedBank && this.bankno && this.proceedDate){
          this.isSubmitting = true;
          this.bookingID = this.$route.query.bookingID;

          let bankName = '';

          switch (this.selectedBank.id) {
            case 1:
              bankName = 'KTB';
              break;
            case 2:
              bankName = 'KBANK';
              break;
            case 3:
              bankName = 'SCB';
              break;
            case 4:
              bankName = 'BBL';
              break;
            case 5:
              bankName = 'TTB';
              break;
            case 6:
              bankName = 'BAY';
              break;
            case 7:
              bankName = 'UOBT';
              break;
            default:
              bankName = '';
              break;
          }

          if (bankName) {
            axios.post(`${import.meta.env.VITE_API_BASE_URL}/uploadSlip`, {
              bank: bankName,
              username: this.username,
              bankno: this.bankno,
              proceedDate: this.proceedDate,
              bookingID: this.bookingID
            })
            .then(response => {
              console.log('Data sent successfully:', response.data);
              const popup = document.getElementById('popup');
              popup.classList.add('open-popup')
            })
            .catch(error => {
              console.error('Error canceling booking:', error);
            })
            .finally(() => {
              this.isSubmitting = false;
            });
          } else {
            console.error('Invalid bank selected.');
            this.isSubmitting = false;
          }
        }
      },
      closePopup(){
        this.$router.push('/history')
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
@import '@/assets/css/AddPayment.css';
</style>
