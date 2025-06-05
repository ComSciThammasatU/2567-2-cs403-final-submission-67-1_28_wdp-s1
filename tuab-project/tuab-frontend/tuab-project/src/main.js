import Vue from 'vue'
import App from './App.vue'
import router from './router'
import VueGoodTablePlugin from 'vue-good-table'


import './assets/main.css'
import vuetify from './plugins/vuetify'

// import css for vue-good-table
import 'vue-good-table/dist/vue-good-table.css'

// ลงทะเบียน vue-good-table plugin
Vue.use(VueGoodTablePlugin);

new Vue({
  router,
  vuetify,
  render: (h) => h(App)
}).$mount('#app')
