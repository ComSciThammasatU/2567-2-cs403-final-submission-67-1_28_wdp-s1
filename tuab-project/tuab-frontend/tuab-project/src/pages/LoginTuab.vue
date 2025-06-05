<template>
  <div id="Login" class="main-box">
    <body>
      <br><br><br><br>
      <form @submit.prevent="login">
        <p Align="center"><label for="username">Username</label></p>
        <p Align="center"><input type="text" v-model="username"></p><br>
        <p Align="center"><label for="password">Password</label></p>
        <p Align="center"><input type="password" v-model="password"></p>
        <br><br>
        <p Align="center" class="note">*Login via TU account</p>
        <p Align="center"><button class="login" type="submit"><span>LOGIN</span></button></p>
      </form>
    </body>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  data() {
    return {
      username: '',
      password: '',
    };
  },
  methods: {
    async login() {
      try {
        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/login`, {
          username: this.$data.username,
          password: this.$data.password,
        });
        if (response.data.status == 'ok'){
          // sessionStorage.setItem("name", response.data.name);
          // sessionStorage.setItem("role", response.data.roles);
          localStorage.setItem('token', response.data.token); // Store JWT token

          axios.get(`${import.meta.env.VITE_API_BASE_URL}/user-detail`, {
            headers: {
              Authorization: `Bearer ${response.data.token}`
            }
          })
          .then(response => {
              // Update the name property with user information retrieved from the server
            localStorage.setItem("username", response.data.username)
            localStorage.setItem("name", response.data.name)
            var roleName;
            let roleID = response.data.roleID
            if (roleID == '1') {
              roleName = "General User"
            } else if (roleID == '2') {
              roleName = "Super Staff"
            } else if (roleID == '3') {
              roleName = "Staff"
            }

            localStorage.setItem("roleName", roleName)

            if (roleID == '1'){
              this.$router.replace("general-home");
            }
            else if (roleID == '2'){
              this.$router.replace("superStaff-home");
            }
            else if (roleID == '3'){
              this.$router.replace("staff-home");
            }
          })
          .catch(error => {
            console.error('Error fetching user information:', error);
          });       
        }
        if (response.data.status == 'error'){
          alert('Invalid Username or Password!');
        }
        else{
          this.errorMessage = response.data.message;
        }
      } catch (error) {
        console.error('Error:', error.response.data);
      }
    },
  },
};
</script>

<style scoped>
@import '@/assets/css/LoginTuab.css';
</style>