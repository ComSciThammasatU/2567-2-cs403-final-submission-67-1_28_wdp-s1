import Vue from 'vue'
import Router from 'vue-router'
import LoginTuab from './pages/LoginTuab.vue'
import GeneralHome from './pages/GeneralHome.vue'
import SuperStaffHome from './pages/SuperStaffHome.vue'
import StaffHome from './pages/StaffHome.vue'
import Booking from './pages/Booking.vue'
import VerifyInfo from './pages/VerifyInfo.vue'
import Payment from './pages/Payment.vue'
import History from './pages/History.vue'
import AddPayment from './pages/AddPayment.vue'
import Cancel from './pages/Cancel.vue'
import Operation from './pages/Operation.vue'
import ShiftSchedule from './pages/ShiftSchedule.vue'
import StaffTimesheet from './pages/StaffTimesheet.vue'
import UserCalendar from './pages/UserCalendar.vue'
import StaffShiftCalendar from './pages/StaffShiftCalendar.vue'
import StaffCalendar from './pages/StaffCalendar.vue'
import OperationCalendar from './pages/OperationCalendar.vue'
import SuperStaffDashboard from './pages/SuperStaffDashboard.vue'
import OperationList from './pages/OperationList.vue'
import Dashboard from './pages/Dashboard.vue'
import BookingProcess from './pages/BookingProcess.vue'


Vue.use(Router)

export default new Router({
    mode: 'history',
    routes:[
    { 
        path: '/',
        name: 'login',
        component: LoginTuab
    },
    { 
        path: '/general-home',
        name: 'general-home',
        component: GeneralHome
    },
    { 
        path: '/superStaff-home',
        name: 'superStaff-home',
        component: SuperStaffHome
    },
    { 
        path: '/staff-home',
        name: 'staff-home',
        component: StaffHome
    },
    { 
        path: '/booking',
        name: 'booking',
        component: Booking
    },
    {
        path: '/verify-info',
        name: 'verify-info',
        component: VerifyInfo
    },
    {
        path: '/payment',
        name: 'payment',
        component: Payment
    },
    {
        path: '/history',
        name: 'history',
        component: History
    },
    {
        path: '/add-payment',
        name: 'add-payment',
        component: AddPayment
    },
    {
        path: '/cancel',
        name: 'cancel',
        component: Cancel
    },
    {
        path: '/operation',
        name: 'operation',
        component: Operation
    },
    {
        path: '/shift-schedule',
        name: 'shift-schedule',
        component: ShiftSchedule
    },
    {
        path: '/staff-timesheet',
        name: 'StaffTimesheet',
        component: StaffTimesheet
    },
    {
        path: '/user-calendar',
        name: 'UserCalendar',
        component: UserCalendar
    },
    {
        path: '/staffshift-calendar',
        name: 'StaffShiftCalendar',
        component: StaffShiftCalendar
    },
    {
        path: '/staff-calendar',
        name: 'StaffCalendar',
        component: StaffCalendar
    },
    {
        path: '/Operation-calendar',
        name: 'OperationCalendar',
        component: OperationCalendar
    },
    {
        path: '/SuperStaffDashboard',
        name: 'SuperStaffDashboard',
        component: SuperStaffDashboard
    },
    {
        path: '/OperationList',
        name: 'OperationList',
        component: OperationList
    },
    {
        path: '/Dashboard',
        name: 'Dashboard',
        component: Dashboard
    },
    {
        path: '/BookingProcess',
        name: 'BookingProcess',
        component: BookingProcess
    }
    ]
})