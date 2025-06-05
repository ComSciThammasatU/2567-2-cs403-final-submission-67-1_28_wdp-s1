<template>
  <div class="dashboard-container">
    <h1>Dashboard</h1>
    
    <!-- ส่วนหัวที่ปรับปรุงใหม่ -->
    <div class="header-section">
      <div class="current-date">วันที่ปัจจุบัน: {{ formatCurrentDate() }}</div>
      <div class="date-filter">
        <button :class="{ active: dateRange === 'today' }" @click="setDateRange('today')">วันนี้</button>
        <button :class="{ active: dateRange === 'week' }" @click="setDateRange('week')">สัปดาห์</button>
        <button :class="{ active: dateRange === 'month' }" @click="setDateRange('month')">เดือน</button>
        <button :class="{ active: dateRange === '3months' }" @click="setDateRange('3months')">3 เดือน</button>
        <button :class="{ active: dateRange === 'custom' }" @click="setDateRange('custom')">กำหนดเอง</button>
      </div>
      <div v-if="dateRange === 'custom'" class="custom-date-section">
        <div class="custom-date-container">
          <input type="date" v-model="startDate" class="custom-date-input" />
          <span>ถึง</span>
          <input type="date" v-model="endDate" class="custom-date-input" />
          <button @click="applyCustomRange" class="submit-btn">ตกลง</button>
        </div>
      </div>
    </div>
  
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>กำลังโหลดข้อมูล...</p>
    </div>
  
    <div v-else class="superstaff-dashboard">
      <div class="summary-cards">
        <div class="card">
          <h3>การจองทั้งหมด</h3>
          <div class="card-value">{{ dashboardData.summary.totalBookings }}</div>
        </div>
        <div class="card confirmed">
          <h3>ยืนยันแล้ว</h3>
          <div class="card-value">{{ dashboardData.summary.confirmedBookings }}</div>
        </div>
        <div class="card cancelled">
          <h3>ยกเลิกแล้ว</h3>
          <div class="card-value">{{ dashboardData.summary.cancelledBookings }}</div>
        </div>
        <div class="card pending">
          <h3>รอดำเนินการ</h3>
          <div class="card-value">{{ dashboardData.summary.pendingBookings }}</div>
        </div>
      </div>
  
    <!-- Inside the charts-grid div, find and modify this section -->
    <div class="charts-grid">
        <!-- กราฟสำหรับฟิลเตอร์ "วันนี้" -->
        <div v-if="dateRange === 'today'" class="chart-card">
            <h2>การจองตามช่วงเวลาการทำงาน</h2>
            <canvas ref="shiftBookingsChart" style="height: 300px; width: 100%;"></canvas>
        </div>
        
        <!-- กราฟรายวัน - สำหรับฟิลเตอร์สัปดาห์ -->
        <div v-if="dateRange === 'week'" class="chart-card">
            <h2>การจองสัปดาห์นี้</h2>
            <canvas ref="dailyBookingsChart" style="height: 300px; width: 100%;"></canvas>
        </div>
        
        <!-- กราฟรายวัน - สำหรับฟิลเตอร์เดือน -->
        <div v-if="dateRange === 'month'" class="chart-card">
            <h2>การจองเดือนนี้</h2>
            <canvas ref="dailyBookingsChart" style="height: 300px; width: 100%;"></canvas>
        </div>
        
        <!-- กราฟรายวัน - สำหรับฟิลเตอร์กำหนดเองที่น้อยกว่า 32 วัน -->
        <div v-if="dateRange === 'custom' && customDateRangeDuration < 32" class="chart-card">
            <h2>การจองตามช่วงเวลาที่กำหนด</h2>
            <canvas ref="dailyBookingsChart" style="height: 300px; width: 100%;"></canvas>
        </div>
        
        <!-- กราฟรายเดือน - สำหรับฟิลเตอร์ 3 เดือน -->
        <div v-if="dateRange === '3months'" class="chart-card">
            <h2>การจองย้อนหลัง 3 เดือน</h2>
            <canvas ref="monthlyBookingsChart" style="height: 300px; width: 100%;"></canvas>
        </div>
        
        <!-- กราฟรายเดือน - สำหรับฟิลเตอร์กำหนดเองที่มากกว่า 31 วัน -->
        <div v-if="dateRange === 'custom' && customDateRangeDuration >= 32" class="chart-card">
            <h2>การจองย้อนหลังตามเดือนที่กำหนด</h2>
            <canvas ref="monthlyBookingsChart" style="height: 300px; width: 100%;"></canvas>
        </div>
        
        <!-- สถานะการจอง (Pie chart สำหรับวันนี้) -->
        <div v-if="dateRange === 'today'" class="chart-card">
            <h2>สถานะการจอง</h2>
            <canvas ref="bookingStatusPieChart" style="height: 300px; width: 100%;"></canvas>
        </div>
        
        <!-- สถานะการจอง (Stack Bar chart สำหรับสัปดาห์, เดือน, 3 เดือน) -->
        <div v-if="dateRange !== 'today'" class="chart-card">
            <h2>สถานะการจอง</h2>
            <canvas ref="bookingStatusStackedChart" style="height: 300px; width: 100%;"></canvas>
        </div>
        
        <!-- การใช้งานแต่ละช่องยิง (ทุกฟิลเตอร์) -->
        <div class="chart-card">
            <h2>สัดส่วนการจองแต่ละช่องยิง</h2>
            <canvas ref="laneUsageChart" style="height: 300px; width: 100%;"></canvas>
        </div>
        
        <!-- การจองแยกตามคณะและบุคลากร (ทุกฟิลเตอร์) -->
        <div class="chart-card">
            <h2>การจองแยกตามกลุ่มนักศึกษาและบุคลากร</h2>
            <canvas ref="facultyPieChart" style="height: 300px; width: 100%;"></canvas>
        </div>
    </div>
      
      <div class="staff-performance">
        <h2>ประสิทธิภาพการมีส่วนร่วมกับระบบของสมาชิกชมรม</h2>
        <div class="staff-filter">
          <select v-model="selectedStaff" @change="filterByStaff">
            <option value="">ทั้งหมด</option>
            <option v-for="staff in staffList" :key="staff.username" :value="staff.username">
              {{ staff.name }}
            </option>
          </select>
        </div>
        <canvas ref="staffPerformanceChart" style="height: 300px; width: 100%;"></canvas>
      </div>

      <div class="staff-timesheet">
        <h2>ประสิทธิภาพการเข้าทำงานของสมาชิกชมรม</h2>
        <canvas ref="staffShiftsChart" style="height: 300px; width: 100%;"></canvas>
      </div>
    </div>
  </div>
</template>
  
<script>
import { VueGoodTable } from 'vue-good-table';
import Chart from 'chart.js';
import axios from 'axios';
import NotToken from '../components/NotToken.vue';

export default {
components: {
    VueGoodTable
},
data() {
    return {
    loading: true,
    dateRange: 'month',
    startDate: '',
    endDate: '',
    selectedStaff: '',

    selectedPeriod: 'today',  // เช่น วันนี้, สัปดาห์นี้, 3 เดือน
    chartData: null,          // ข้อมูลที่ใช้สร้างกราฟ
    
    showBookingModal: false,
    selectedBooking: {},
    customDateRangeDuration: 0,
    
    dashboardData: {
        summary: {
        totalBookings: 0,
        pendingBookings: 0,
        confirmedBookings: 0,
        cancelledBookings: 0
        },
        bookingsByDate: [],
        bookingsByMonth: [],
        bookingsByLane: [],
        staffPerformance: [],
        staffShifts: [],
        recentBookings: [],
        bookingsByShift: [], // ข้อมูลการจองแยกตาม shift
        bookingsByFaculty: []
    },
    
    staffList: [],
    
    // กราฟสำหรับ Chart.js
    charts: {
        bookingStatusChart: null,
        dailyBookingsChart: null,
        monthlyBookingsChart: null,
        laneUsageChart: null,
        staffPerformanceChart: null,
        staffShiftsChart: null,
        shiftBookingsChart: null,
        bookingStatusPieChart: null,
        bookingStatusStackedChart: null,
        facultyPieChart: null
    },
    
    // คอลัมน์สำหรับตาราง
    bookingColumns: [
        { label: 'รหัสการจอง', field: 'id' },
        { label: 'ชื่อผู้จอง', field: 'userName' },
        { label: 'เลขประจำตัว', field: 'username' },
        { label: 'เลน', field: 'lane' },
        { label: 'วันที่', field: 'date' },
        { label: 'เวลา', field: 'time' },
        { label: 'สถานะ', field: 'status' },
        { label: 'การจัดการ', field: 'actions', sortable: false }
    ]
    };
},
    
async mounted() {
    try {
        this.initDateRange();
        this.calculateCustomDateRange(); // เพิ่มบรรทัดนี้
        await this.fetchDashboardData();
    } catch (error) {
        console.error("Error loading data:", error);
    }

    this.username = localStorage.getItem("username");
    this.name = localStorage.getItem("name") || '';
    this.roleName = localStorage.getItem("roleName") || '';
    this.roles = localStorage.getItem("roles") || '';
},
            
methods: {

calculateCustomDateRange() {
    if (this.dateRange !== 'custom') {
    // กำหนดค่าสำหรับช่วงอื่นๆ ที่ไม่ใช่ custom
    switch (this.dateRange) {
        case 'today':
        this.customDateRangeDuration = 1;
        break;
        case 'week':
        this.customDateRangeDuration = 7;
        break;
        case 'month':
        const now = new Date();
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        this.customDateRangeDuration = lastDayOfMonth;
        break;
        case '3months':
        this.customDateRangeDuration = 90; // ประมาณ 3 เดือน
        break;
        default:
        this.customDateRangeDuration = 30; // ค่าเริ่มต้น
    }
    console.log(`Set customDateRangeDuration for ${this.dateRange}: ${this.customDateRangeDuration}`);
    return;
    }

    // สำหรับ custom date range
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);

    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
    // คำนวณจำนวนวันระหว่างวันที่เริ่มต้นและวันที่สิ้นสุด
    const diffTime = Math.abs(end - start);
    this.customDateRangeDuration = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 เพื่อรวมวันสุดท้าย
    console.log(`Calculated customDateRangeDuration for custom range: ${this.customDateRangeDuration}`);
    } else {
    this.customDateRangeDuration = 0;
    console.warn("Invalid date range provided");
    }
},  

initDateRange() {
    const now = new Date();

    // สำหรับ custom date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1); // เริ่มจาก 1 เดือนก่อน

    this.startDate = this.formatDateForInput(startDate);
    this.endDate = this.formatDateForInput(endDate);
},

setDateRange(range) {
    this.dateRange = range;
    this.calculateCustomDateRange(); // เพิ่มบรรทัดนี้
    this.fetchDashboardData();
},
    
applyCustomRange() {
    // ตรวจสอบว่ามีการระบุวันที่ครบถ้วนหรือไม่
    if (!this.startDate || !this.endDate) {
        alert('กรุณาระบุวันที่เริ่มต้นและวันที่สิ้นสุด');
        return;
    }
            
    this.calculateCustomDateRange();
    this.fetchDashboardData();
},

getDateRangeParams() {
    const now = new Date();
    let start, end;

    switch (this.dateRange) {
        case 'today':
        start = this.formatDateForAPI(now);
        end = this.formatDateForAPI(now);
        break;
        
        case 'week':
        start = new Date(now);
        start.setDate(now.getDate() - now.getDay()); // วันแรกของสัปดาห์ (วันอาทิตย์)
        end = new Date(now);
        end.setDate(start.getDate() + 6); // วันสุดท้ายของสัปดาห์ (วันเสาร์)
        start = this.formatDateForAPI(start);
        end = this.formatDateForAPI(end);
        break;
        
        case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        start = this.formatDateForAPI(start);
        end = this.formatDateForAPI(end);
        break;
        
        case '3months':
        start = new Date(now);
        start.setMonth(now.getMonth() - 2);
        start.setDate(1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        start = this.formatDateForAPI(start);
        end = this.formatDateForAPI(end);
        break;
        
        case 'custom':
        start = this.startDate;
        end = this.endDate;
        break;
        
        default:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        start = this.formatDateForAPI(start);
        end = this.formatDateForAPI(end);
    }

    return { start, end };
},
      
async fetchDashboardData() {
  this.loading = true;
  
  try {
    const { start, end } = this.getDateRangeParams();
    
    // 1. ดึงข้อมูลสรุป
    const summaryResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/dashboard/summary`, {
      params: {
        staff: this.selectedStaff || undefined,
        start,
        end
      }
    });
    this.dashboardData.summary = summaryResponse.data;
    
    // 2. ดึงข้อมูลการจองตามวันที่ (พร้อมข้อมูลสถานะแล้ว)
    const bookingsByDateResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/dashboard/bookings-by-date`, {
      params: {
        staff: this.selectedStaff || undefined,
        start,
        end
      }
    });
    this.dashboardData.bookingsByDate = bookingsByDateResponse.data;
    console.log('Bookings by date (with status):', this.dashboardData.bookingsByDate);
    
    // 3. ดึงข้อมูลการจองตามเดือน (พร้อมข้อมูลสถานะแล้ว)
    const bookingsByMonthResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/dashboard/bookings-by-month`, {
      params: {
        year: new Date().getFullYear(),
        staff: this.selectedStaff || undefined
      }
    });
    this.dashboardData.bookingsByMonth = bookingsByMonthResponse.data;
    console.log('Bookings by month (with status):', this.dashboardData.bookingsByMonth);
    
    // 4. ดึงข้อมูลการจองตามเลน
    const bookingsByLaneResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/dashboard/bookings-by-lane`, {
      params: {
        start,
        end
      }
    });
    this.dashboardData.bookingsByLane = bookingsByLaneResponse.data;
    
    // 5. ดึงข้อมูลประสิทธิภาพของ Staff
    const staffPerformanceResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/dashboard/staff-performance`, {
      params: {
        start,
        end
      }
    });
    this.dashboardData.staffPerformance = staffPerformanceResponse.data;
    this.staffList = this.dashboardData.staffPerformance.map(staff => ({
      username: staff.username,
      name: staff.name
    }));
    
    // 6. ดึงข้อมูลการจัดตารางงานของ Staff
    const staffShiftsResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/countStaffShifts`, {
      params: {
        start,
        end
      }
    });
    this.dashboardData.staffShifts = staffShiftsResponse.data;
    
    // 7. ดึงข้อมูลการจองตาม shift (สำหรับฟิลเตอร์วันนี้)
    if (this.dateRange === 'today') {
      const bookingsByShiftResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/dashboard/bookings-by-shift`, {
        params: {
          date: start
        }
      });
      this.dashboardData.bookingsByShift = bookingsByShiftResponse.data;
    }
    
    // 8. ดึงข้อมูลการจองแยกตามคณะ
    const bookingsByFacultyResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/dashboard/bookings-by-faculty`, {
      params: {
        start,
        end
      }
    });
    this.dashboardData.bookingsByFaculty = bookingsByFacultyResponse.data;
  
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    alert('เกิดข้อผิดพลาดในการดึงข้อมูล กรุณาลองใหม่อีกครั้ง');
  } finally {
    this.loading = false;
    
    // สร้างกราฟหลังจากข้อมูลโหลดเสร็จและ DOM อัพเดตแล้ว
    this.$nextTick(() => {
      setTimeout(() => {
        // สร้างกราฟตามฟิลเตอร์ที่เลือก
        if (this.dateRange === 'today') {
          this.createShiftBookingsChart();
          this.createBookingStatusPieChart();
        } else {
          if (['week', 'month', 'custom'].includes(this.dateRange) && this.customDateRangeDuration < 32) {
            this.createDailyBookingsChart();
          }
          
          if (this.dateRange === '3months' || (this.dateRange === 'custom' && this.customDateRangeDuration >= 32)) {
            this.createMonthlyBookingsChart();
          }
          
          this.createBookingStatusStackedChart();
        }
        
        // สร้างกราฟที่แสดงในทุกฟิลเตอร์
        this.createLaneUsageChart();
        this.createFacultyPieChart();
        this.createStaffPerformanceChart();
        this.createStaffShiftsChart();
      }, 100);
    });
  }
},
      
createBookingStatusChart() {
    if (!this.$refs.bookingStatusChart) {
        console.warn("ไม่เจอ bookingStatusChart canvas!");
        return;
    }

    const ctx = this.$refs.bookingStatusChart.getContext('2d');

    // ตรวจสอบว่ากราฟเดิมมีอยู่หรือไม่ ถ้ามีให้ทำลายก่อน
    if (this.charts.bookingStatusChart) {
        this.charts.bookingStatusChart.destroy();
    }

    this.charts.bookingStatusChart = new Chart(ctx, {
        type: 'pie',
        data: {
        labels: ['รอดำเนินการ', 'ยืนยันแล้ว', 'ยกเลิกแล้ว'],
        datasets: [{
            data: [
            this.dashboardData.summary.pendingBookings,
            this.dashboardData.summary.confirmedBookings,
            this.dashboardData.summary.cancelledBookings
            ],
            backgroundColor: ['rgba(255, 206, 86, 0.7)', 'rgba(75, 192, 192, 0.7)', 'rgba(255, 99, 132, 0.7)'],
            borderColor: ['rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
            borderWidth: 1
        }]
        },
        options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
            position: 'bottom'
            }
        }
        }
    });
},

createBookingStatusPieChart() {
  if (!this.$refs.bookingStatusPieChart) {
    console.warn("ไม่เจอ bookingStatusPieChart canvas!");
    return;
  }
  
  const ctx = this.$refs.bookingStatusPieChart.getContext('2d');
  
  // ตรวจสอบว่ากราฟเดิมมีอยู่หรือไม่ ถ้ามีให้ทำลายก่อน
  if (this.charts.bookingStatusPieChart) {
    this.charts.bookingStatusPieChart.destroy();
  }
  
  // ตรวจสอบว่ามีข้อมูลหรือไม่
  const hasData = this.dashboardData.summary &&
                  (this.dashboardData.summary.pendingBookings > 0 || 
                  this.dashboardData.summary.confirmedBookings > 0 || 
                  this.dashboardData.summary.cancelledBookings > 0);
  
  // กรณีไม่มีข้อมูล ให้แสดงข้อความแทนกราฟว่าง
  if (!hasData) {
    // ล้างพื้นที่ canvas และวาดข้อความ
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.font = '14px Prompt, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#666';
    
    const message = 'ไม่พบข้อมูลสถานะการจองในวันนี้';
    
    ctx.fillText(message, ctx.canvas.width / 2, ctx.canvas.height / 2);
    
    // กำหนดให้ชาร์ตเป็น null เพื่อไม่ให้มีการเรียกใช้การอัพเดตของชาร์ต
    this.charts.bookingStatusPieChart = null;
    
    return;
  }
  
  this.charts.bookingStatusPieChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['รอดำเนินการ', 'ยืนยันแล้ว', 'ยกเลิกแล้ว'],
      datasets: [{
        data: [
          this.dashboardData.summary.pendingBookings,
          this.dashboardData.summary.confirmedBookings,
          this.dashboardData.summary.cancelledBookings
        ],
        backgroundColor: ['rgba(255, 206, 86, 0.7)', 'rgba(75, 192, 192, 0.7)', 'rgba(255, 99, 132, 0.7)'],
        borderColor: ['rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      legend: {
        position: 'bottom',
        labels: {
          fontStyle: 'bold',
          fontColor: '#000',
          fontSize: 12,
          fontFamily: 'Prompt, sans-serif'
        }
      },
      tooltips: {
        callbacks: {
          label: function(tooltipItem, data) {
            const dataset = data.datasets[tooltipItem.datasetIndex];
            const value = dataset.data[tooltipItem.index];
            const total = dataset.data.reduce((acc, val) => acc + val, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${data.labels[tooltipItem.index]}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  });
},

createBookingStatusStackedChart() {
  if (!this.$refs.bookingStatusStackedChart) {
    console.warn("ไม่เจอ bookingStatusStackedChart canvas!");
    return;
  }
  
  const ctx = this.$refs.bookingStatusStackedChart.getContext('2d');
  
  // ตรวจสอบว่ากราฟเดิมมีอยู่หรือไม่ ถ้ามีให้ทำลายก่อน
  if (this.charts.bookingStatusStackedChart) {
    this.charts.bookingStatusStackedChart.destroy();
  }
  
  // ตรวจสอบข้อมูลสำหรับกราฟตามช่วงเวลาที่เลือก
  let hasData = false;
  
  if (this.dateRange === 'week' || (this.dateRange === 'custom' && this.customDateRangeDuration <= 7) || 
      this.dateRange === 'month' || (this.dateRange === 'custom' && this.customDateRangeDuration > 7 && this.customDateRangeDuration < 32)) {
    // สำหรับสัปดาห์และเดือน: ใช้ข้อมูลรายวัน
    hasData = this.dashboardData.bookingsByDate && 
              this.dashboardData.bookingsByDate.length > 0 &&
              this.dashboardData.bookingsByDate.some(item => 
                (item.pendingCount > 0 || item.confirmedCount > 0 || item.cancelledCount > 0));
  } else {
    // สำหรับ 3 เดือนหรือกำหนดเองที่มากกว่า 31 วัน: ใช้ข้อมูลรายเดือน
    hasData = this.dashboardData.bookingsByMonth && 
              this.dashboardData.bookingsByMonth.length > 0 &&
              this.dashboardData.bookingsByMonth.some(item => 
                (item.pendingCount > 0 || item.confirmedCount > 0 || item.cancelledCount > 0));
  }
  
  // กรณีไม่มีข้อมูล ให้แสดงข้อความแทนกราฟว่าง
  if (!hasData) {
    // ล้างพื้นที่ canvas และวาดข้อความ
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.font = '14px Prompt, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#666';
    
    let message = 'ไม่พบข้อมูลสถานะการจอง';
    if (this.dateRange === 'week') {
      message += 'ในสัปดาห์นี้';
    } else if (this.dateRange === 'month') {
      message += 'ในเดือนนี้';
    } else if (this.dateRange === '3months') {
      message += 'ใน 3 เดือนที่ผ่านมา';
    } else if (this.dateRange === 'custom') {
      message += 'ในช่วงเวลาที่เลือก';
    }
    
    ctx.fillText(message, ctx.canvas.width / 2, ctx.canvas.height / 2);
    
    // กำหนดให้ชาร์ตเป็น null เพื่อไม่ให้มีการเรียกใช้การอัพเดตของชาร์ต
    this.charts.bookingStatusStackedChart = null;
    
    return;
  }
  
  // เตรียมข้อมูลสำหรับกราฟ (ส่วนที่เหลือคงเดิม)
  let labels = [];
  let pendingData = [];
  let confirmedData = [];
  let cancelledData = [];
  
  if (this.dateRange === 'week' || (this.dateRange === 'custom' && this.customDateRangeDuration <= 7) || 
      this.dateRange === 'month' || (this.dateRange === 'custom' && this.customDateRangeDuration > 7 && this.customDateRangeDuration < 32)) {
    // สำหรับสัปดาห์และเดือน: ใช้ข้อมูลรายวัน
    labels = this.dashboardData.bookingsByDate.map(item => this.formatDateDisplay(item.date));
    pendingData = this.dashboardData.bookingsByDate.map(item => parseInt(item.pendingCount || 0, 10));
    confirmedData = this.dashboardData.bookingsByDate.map(item => parseInt(item.confirmedCount || 0, 10));
    cancelledData = this.dashboardData.bookingsByDate.map(item => parseInt(item.cancelledCount || 0, 10));
  } else {
    // สำหรับ 3 เดือนหรือกำหนดเองที่มากกว่า 31 วัน: ใช้ข้อมูลรายเดือน
    labels = this.dashboardData.bookingsByMonth.map(item => item.month);
    pendingData = this.dashboardData.bookingsByMonth.map(item => parseInt(item.pendingCount || 0, 10));
    confirmedData = this.dashboardData.bookingsByMonth.map(item => parseInt(item.confirmedCount || 0, 10));
    cancelledData = this.dashboardData.bookingsByMonth.map(item => parseInt(item.cancelledCount || 0, 10));
  }
  
  // กำหนดสีแยกตามความหมายของสถานะ
  const pendingColor = 'rgba(255, 206, 86, 0.7)';  // สีเหลือง (รอดำเนินการ)
  const pendingBorder = 'rgba(255, 206, 86, 1)';
  
  const confirmedColor = 'rgba(75, 192, 192, 0.7)'; // สีเขียว (ยืนยันแล้ว)
  const confirmedBorder = 'rgba(75, 192, 192, 1)';
  
  const cancelledColor = 'rgba(255, 99, 132, 0.7)'; // สีแดง (ยกเลิกแล้ว)
  const cancelledBorder = 'rgba(255, 99, 132, 1)';
  
  // สร้างกราฟ
  this.charts.bookingStatusStackedChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'รอดำเนินการ',
          data: pendingData,
          backgroundColor: pendingColor,
          borderColor: pendingBorder,
          borderWidth: 1
        },
        {
          label: 'ยืนยันแล้ว',
          data: confirmedData,
          backgroundColor: confirmedColor,
          borderColor: confirmedBorder,
          borderWidth: 1
        },
        {
          label: 'ยกเลิกแล้ว',
          data: cancelledData,
          backgroundColor: cancelledColor,
          borderColor: cancelledBorder,
          borderWidth: 1
        }
      ]
    },
    options: {
        legend: {
            position: 'top',
            labels: {
                fontStyle: 'bold',           // ทำให้ตัวอักษรเป็นตัวหนา
                fontColor: '#000',           // กำหนดสีตัวอักษรเป็นสีดำ
                fontSize: 12,                // กำหนดขนาดตัวอักษรเป็น 12px
                fontFamily: 'Prompt, sans-serif'  // กำหนด font family เป็น Prompt
            }
        },
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        xAxes: [{
          stacked: true,
          scaleLabel: {
            display: true,
            labelString: this.dateRange === '3months' || (this.dateRange === 'custom' && this.customDateRangeDuration >= 32) ? 'เดือน' : 'วันที่',
            fontStyle: 'bold',  
            fontColor: '#000' 
          },
            ticks: {
                fontStyle: 'bold',  // เพิ่มบรรทัดนี้เพื่อทำให้ค่าบนแกนเป็นตัวหนา
                fontColor: '#000'   // เพิ่มบรรทัดนี้เพื่อกำหนดสีของค่าบนแกน
            }
        }],
        yAxes: [{
          stacked: true,
          ticks: {
            beginAtZero: true,
            callback: function(value) {
              if (Number.isInteger(value)) {
                return value;
              }
            },
            fontStyle: 'bold', 
            fontColor: '#000'
          },
          scaleLabel: {
            display: true,
            labelString: 'จำนวนการจอง',
            fontStyle: 'bold', 
            fontColor: '#000'
          }
        }]
      },
      tooltips: {
        enabled: true,
        mode: 'index',
        intersect: false,
        callbacks: {
          title: function(tooltipItems, data) {
            if (!tooltipItems || tooltipItems.length === 0) {
              return '';
            }
            
            const dataIndex = tooltipItems[0].index;
            let totalForDay = 0;
            data.datasets.forEach(dataset => {
              totalForDay += parseInt(dataset.data[dataIndex] || 0, 10);
            });
            
            return `${data.labels[tooltipItems[0].index]} (รวม: ${totalForDay} การจอง)`;
          },
          label: function(tooltipItem, data) {
            if (!tooltipItem || !data || !data.datasets || !data.datasets[tooltipItem.datasetIndex]) {
              return '';
            }

            const datasetIndex = tooltipItem.datasetIndex;
            const index = tooltipItem.index;

            if (index === undefined || index < 0 || index >= data.labels.length) {
              return '';
            }

            const datasetLabel = data.datasets[datasetIndex].label || '';
            const value = parseInt(data.datasets[datasetIndex].data[index] || 0, 10);

            let total = 0;
            for (let i = 0; i < data.datasets.length; i++) {
              total += parseInt(data.datasets[i].data[index] || 0, 10);
            }

            let percentage = 0;
            if (total > 0) {
              percentage = (value / total) * 100;
            }

            const percentageFormatted = Math.round(percentage);
            
            return `${datasetLabel}: ${value} (${percentageFormatted}%)`;
          }
        }
      }
    }
  });
},
      
createLaneUsageChart() {
  if (!this.$refs.laneUsageChart) {
    console.warn("ไม่เจอ laneUsageChart canvas!");
    return;
  }
  
  const ctx = this.$refs.laneUsageChart.getContext('2d');
  
  // ตรวจสอบว่ากราฟเดิมมีอยู่หรือไม่ ถ้ามีให้ทำลายก่อน
  if (this.charts.laneUsageChart) {
    this.charts.laneUsageChart.destroy();
  }
  
  // ตรวจสอบว่ามีข้อมูลจริงหรือไม่
  const hasData = this.dashboardData.bookingsByLane && 
                  this.dashboardData.bookingsByLane.length > 0 && 
                  this.dashboardData.bookingsByLane.some(item => item.count > 0);
  
  // กรณีไม่มีข้อมูล ให้แสดงข้อความแทนกราฟว่าง
  if (!hasData) {
    // ล้างพื้นที่ canvas และวาดข้อความ
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.font = '14px Prompt, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#666';
    
    let message = 'ไม่พบข้อมูลการใช้งานช่องยิง';
    if (this.dateRange === 'today') {
      message += 'ในวันนี้';
    } else if (this.dateRange === 'week') {
      message += 'ในสัปดาห์นี้';
    } else if (this.dateRange === 'month') {
      message += 'ในเดือนนี้';
    } else if (this.dateRange === '3months') {
      message += 'ใน 3 เดือนที่ผ่านมา';
    } else if (this.dateRange === 'custom') {
      message += 'ในช่วงเวลาที่เลือก';
    }
    
    ctx.fillText(message, ctx.canvas.width / 2, ctx.canvas.height / 2);
    
    // กำหนดให้ชาร์ตเป็น null เพื่อไม่ให้มีการเรียกใช้การอัพเดตของชาร์ต
    this.charts.laneUsageChart = null;
    
    return;
  }
  
  // เตรียมข้อมูลสำหรับกราฟ (กรณีมีข้อมูล)
  const lanes = this.dashboardData.bookingsByLane.map(item => `ช่องยิง ${item.lane}`);
  const counts = this.dashboardData.bookingsByLane.map(item => item.count);
  
  this.charts.laneUsageChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: lanes,
      datasets: [{
        data: counts,
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 159, 64, 0.7)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      legend: {
        position: 'right',
        labels: {
            fontStyle: 'bold',
            fontColor: '#000'
        }
      },
      tooltips: {
        callbacks: {
          label: function(tooltipItem, data) {
            const dataset = data.datasets[tooltipItem.datasetIndex];
            const value = dataset.data[tooltipItem.index];
            const total = dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${data.labels[tooltipItem.index]}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  });
},
      
createStaffPerformanceChart() {
  if (!this.$refs.staffPerformanceChart) {
    console.warn("ไม่เจอ staffPerformanceChart canvas!");
    return;
  }
  
  const ctx = this.$refs.staffPerformanceChart.getContext('2d');
  
  // ตรวจสอบว่ากราฟเดิมมีอยู่หรือไม่ ถ้ามีให้ทำลายก่อน
  if (this.charts.staffPerformanceChart) {
    this.charts.staffPerformanceChart.destroy();
  }
  
  // ตรวจสอบว่ามีข้อมูลหรือไม่
  const hasData = this.dashboardData.staffPerformance && 
                 this.dashboardData.staffPerformance.length > 0 &&
                 this.dashboardData.staffPerformance.some(item => 
                   item.confirmedBookings > 0 || item.cancelledBookings > 0);
  
  // กรณีไม่มีข้อมูล ให้แสดงข้อความแทนกราฟว่าง
  if (!hasData) {
    // ล้างพื้นที่ canvas และวาดข้อความ
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.font = '10px Prompt, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#666';
    
    let message = 'ไม่พบข้อมูลประสิทธิภาพการมีส่วนร่วมกับระบบของสมาชิกชมรม';
    if (this.dateRange === 'today') {
      message += 'ในวันนี้';
    } else if (this.dateRange === 'week') {
      message += 'ในสัปดาห์นี้';
    } else if (this.dateRange === 'month') {
      message += 'ในเดือนนี้';
    } else if (this.dateRange === '3months') {
      message += 'ใน 3 เดือนที่ผ่านมา';
    } else if (this.dateRange === 'custom') {
      message += 'ในช่วงเวลาที่เลือก';
    }
    
    ctx.fillText(message, ctx.canvas.width / 2, ctx.canvas.height / 2);
    
    // กำหนดให้ชาร์ตเป็น null เพื่อไม่ให้มีการเรียกใช้การอัพเดตของชาร์ต
    this.charts.staffPerformanceChart = null;
    
    return;
  }
  
  // เตรียมข้อมูลสำหรับกราฟ (กรณีมีข้อมูล)
  const staffNames = this.dashboardData.staffPerformance.map(item => item.name);
  const confirmedBookings = this.dashboardData.staffPerformance.map(item => item.confirmedBookings);
  const cancelledBookings = this.dashboardData.staffPerformance.map(item => item.cancelledBookings);
  
  this.charts.staffPerformanceChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: staffNames,
      datasets: [
        {
          label: 'การจองที่ยืนยันแล้ว',
          data: confirmedBookings,
          backgroundColor: 'rgba(75, 192, 192, 0.7)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        },
        {
          label: 'การจองที่ยกเลิกแล้ว',
          data: cancelledBookings,
          backgroundColor: 'rgba(255, 99, 132, 0.7)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }
      ]
    },
    options: {
    legend: {
        labels: {
        fontStyle: 'bold',
        fontColor: '#000',
        fontSize: 12,
        fontFamily: 'Prompt, sans-serif'
        }
    },
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        xAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'สมาชิกชมรม',
            fontStyle: 'bold',
            fontColor: '#000'
          },
          ticks: {
            fontStyle: 'bold',
            fontColor: '#000'
          },
        }],
        yAxes: [{
          ticks: {
            beginAtZero: true,
            fontStyle: 'bold',
            fontColor: '#000',
            callback: function(value) {
              if (value % 1 === 0) {
                return value;
              }
            }
          },
          scaleLabel: {
            display: true,
            labelString: 'จำนวนการจอง',
            fontStyle: 'bold',
            fontColor: '#000'
          }
        }]
      }
    }
  });
},

createShiftBookingsChart() {
  if (!this.$refs.shiftBookingsChart) {
    console.warn("ไม่เจอ shiftBookingsChart canvas!");
    return;
  }
  
  const ctx = this.$refs.shiftBookingsChart.getContext('2d');
  
  if (this.charts.shiftBookingsChart) {
    this.charts.shiftBookingsChart.destroy();
  }
  
  const hasData = this.dashboardData.bookingsByShift && 
                 this.dashboardData.bookingsByShift.length > 0 &&
                 this.dashboardData.bookingsByShift.some(item => item.count > 0);
  
  if (!hasData) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.font = '14px Prompt, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#666';
    ctx.fillText('ไม่พบข้อมูลการจองตาม Shift ในวันนี้', ctx.canvas.width / 2, ctx.canvas.height / 2);
    this.charts.shiftBookingsChart = null;
    return;
  }
  
  const shifts = ['17:00-17:30', '17:30-18:00'];
  const counts = [0, 0];
  
  this.dashboardData.bookingsByShift.forEach(item => {
    if (item.shift === '17:00-17:30') {
      counts[0] = item.count;
    } else if (item.shift === '17:30-18:00') {
      counts[1] = item.count;
    }
  });
  
  this.charts.shiftBookingsChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: shifts,
      datasets: [{
        label: '',
        data: counts,
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    },
    options: {
      legend: { display: false },
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        xAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'ช่วงเวลา',
            fontStyle: 'bold',
            fontColor: '#000',
          },
          ticks: {
            fontStyle: 'bold',
            fontColor: '#000',
          },
        }],
        yAxes: [{
          ticks: {
            beginAtZero: true,
            max: 6, // ✅ เพิ่ม: กำหนด Max = 6 ช่องยิง
            callback: function(value) {
              if (value % 1 === 0) {
                return value;
              }
            },
            fontStyle: 'bold',
            fontColor: '#000',
          },
          scaleLabel: {
            display: true,
            labelString: 'จำนวนช่องยิงที่ถูกจอง',
            fontStyle: 'bold',
            fontColor: '#000',
          }
        }]
      },
      tooltips: {
        callbacks: {
          label: function(tooltipItem, data) {
            const dataset = data.datasets[tooltipItem.datasetIndex];
            const value = dataset.data[tooltipItem.index];
            const total = dataset.data.reduce((acc, val) => acc + val, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `จำนวน: ${value} (${percentage}%)`;
          }
        }
      }
    }
  });
},

// ฟังก์ชันสำหรับจัดกลุ่มคณะ
getFacultyGroup(facultyCode) {
  // กลุ่มวิทยาศาสตร์และเทคโนโลยี
  if (['09', '10', '16'].includes(facultyCode)) {
    return 'วิทยาศาสตร์และเทคโนโลยี';
  }
  // กลุ่มสังคมศาสตร์
  else if (['01', '03', '08', '05', '06', '19'].includes(facultyCode)) {
    return 'สังคมศาสตร์และมนุษยศาสตร์';
  }
  // กลุ่มแพทยศาสตร์และสาธารณสุข
  else if (['11', '12', '13', '14', '17', '18'].includes(facultyCode)) {
    return 'แพทยศาสตร์และสาธารณสุข';
  }
  // กลุ่มศิลปะและการสื่อสาร
  else if (['07', '15'].includes(facultyCode)) {
    return 'ศิลปะและการสื่อสาร';
  }
  // กลุ่มบริหารและเศรษฐศาสตร์
  else if (['02', '04'].includes(facultyCode)) {
    return 'บริหารและเศรษฐศาสตร์';
  }
  // กลุ่มวิทยาลัยและสถาบัน
  else if (['21', '22', '23', '24', '26', '27', '28', '29', '30'].includes(facultyCode)) {
    return 'วิทยาลัยและสถาบัน';
  }
  // กลุ่มที่มีการเรียนข้ามคณะ
  else if (['64', '65', '66'].includes(facultyCode)) {
    return 'โครงการพิเศษ';
  }
  // กลุ่มบุคลากร
  else if (facultyCode === '' || isNaN(facultyCode)) {
    return 'บุคลากร';
  }
  // อื่นๆ
  else {
    return 'อื่นๆ';
  }
},

// ฟังก์ชันสำหรับประมวลผลข้อมูลการจองตามคณะ
// แก้ไขฟังก์ชัน processFacultyData ให้เพิ่มข้อมูล dummy
processFacultyData(bookings) {
  const groupedData = {};
  
  // นับจำนวนการจองตามกลุ่มคณะ
  bookings.forEach(booking => {
    let facultyCode = '';
    
    // ถ้าเป็นนักศึกษา ให้ดึงรหัสคณะจาก username
    if (booking.username && booking.username.length >= 10 && !isNaN(booking.username.substr(0, 2))) {
      facultyCode = booking.username.substr(2, 2);
    }
    
    const group = this.getFacultyGroup(facultyCode);
    
    if (!groupedData[group]) {
      groupedData[group] = 0;
    }
    
    groupedData[group]++;
  });
  
  // แปลงข้อมูลให้อยู่ในรูปแบบที่ใช้กับ Chart.js
  const labels = Object.keys(groupedData);
  const data = Object.values(groupedData);
  
  return { labels, data };
},

createFacultyPieChart() {
  if (!this.$refs.facultyPieChart) {
    console.warn("ไม่เจอ facultyPieChart canvas!");
    return;
  }
  
  const ctx = this.$refs.facultyPieChart.getContext('2d');
  
  // ตรวจสอบว่ากราฟเดิมมีอยู่หรือไม่ ถ้ามีให้ทำลายก่อน
  if (this.charts.facultyPieChart) {
    this.charts.facultyPieChart.destroy();
  }
  
  // ประมวลผลข้อมูลการจองตามคณะ
  const { labels, data } = this.processFacultyData(this.dashboardData.bookingsByFaculty || []);
  
  // ตรวจสอบว่ามีข้อมูลหรือไม่
  const hasData = data && data.length > 0 && data.some(value => value > 0);
  
  // กรณีไม่มีข้อมูล ให้แสดงข้อความแทนกราฟว่าง
  if (!hasData) {
    // ล้างพื้นที่ canvas และวาดข้อความ
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.font = '14px Prompt, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#666';
    
    let message = 'ไม่พบข้อมูลการจองแยกตามคณะและบุคลากร';
    if (this.dateRange === 'today') {
      message += 'ในวันนี้';
    } else if (this.dateRange === 'week') {
      message += 'ในสัปดาห์นี้';
    } else if (this.dateRange === 'month') {
      message += 'ในเดือนนี้';
    } else if (this.dateRange === '3months') {
      message += 'ใน 3 เดือนที่ผ่านมา';
    } else if (this.dateRange === 'custom') {
      message += 'ในช่วงเวลาที่เลือก';
    }
    
    ctx.fillText(message, ctx.canvas.width / 2, ctx.canvas.height / 2);
    
    // กำหนดให้ชาร์ตเป็น null เพื่อไม่ให้มีการเรียกใช้การอัพเดตของชาร์ต
    this.charts.facultyPieChart = null;
    
    return;
  }
  
  // กำหนดสีสำหรับแต่ละกลุ่ม
  const backgroundColors = [
    'rgba(255, 99, 132, 0.7)',  // สีแดง
    'rgba(54, 162, 235, 0.7)',  // สีฟ้า
    'rgba(255, 206, 86, 0.7)',  // สีเหลือง
    'rgba(75, 192, 192, 0.7)',  // สีเขียวอมฟ้า
    'rgba(153, 102, 255, 0.7)', // สีม่วง
    'rgba(255, 159, 64, 0.7)',  // สีส้ม
    'rgba(100, 100, 100, 0.7)'  // สีเทา (สำหรับบุคลากรหรืออื่นๆ)
  ];
  
  this.charts.facultyPieChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: backgroundColors.slice(0, labels.length),
        borderColor: backgroundColors.map(color => color.replace('0.7', '1')).slice(0, labels.length),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      legend: {
        position: 'right',
        labels: {
          boxWidth: 15,
          font: {
            size: 12
          },
          fontStyle: 'bold',
          fontColor: '#000'
        }
      },
      tooltips: {
        callbacks: {
          label: function(tooltipItem, data) {
            const label = data.labels[tooltipItem.index] || '';
            const value = data.datasets[0].data[tooltipItem.index] || 0;
            const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  });
},

createDailyBookingsChart() {
  if (!this.$refs.dailyBookingsChart) {
    console.warn("ไม่เจอ dailyBookingsChart canvas!");
    return;
  }
  
  const ctx = this.$refs.dailyBookingsChart.getContext('2d');
  
  // ตรวจสอบว่ากราฟเดิมมีอยู่หรือไม่ ถ้ามีให้ทำลายก่อน
  if (this.charts.dailyBookingsChart) {
    this.charts.dailyBookingsChart.destroy();
  }
  
  // ตรวจสอบว่ามีข้อมูลหรือไม่
  const hasData = this.dashboardData.bookingsByDate && 
                 this.dashboardData.bookingsByDate.length > 0 &&
                 this.dashboardData.bookingsByDate.some(item => item.count > 0);
  
  // กรณีไม่มีข้อมูล ให้แสดงข้อความแทนกราฟว่าง
  if (!hasData) {
    // ล้างพื้นที่ canvas และวาดข้อความ
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.font = '16px Prompt, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#666';
    
    let message = 'ไม่พบข้อมูลการจองรายวัน';
    if (this.dateRange === 'week') {
      message += ' ในสัปดาห์นี้';
    } else if (this.dateRange === 'month') {
      message += ' ในเดือนนี้';
    } else if (this.dateRange === 'custom') {
      message += ' ในช่วงเวลาที่เลือก';
    }
    
    ctx.fillText(message, ctx.canvas.width / 2, ctx.canvas.height / 2);
    
    // กำหนดให้ชาร์ตเป็น null เพื่อไม่ให้มีการเรียกใช้การอัพเดตของชาร์ต
    this.charts.dailyBookingsChart = null;
    
    return;
  }
  
  // เตรียมข้อมูลสำหรับกราฟ (กรณีมีข้อมูล)
  const dates = this.dashboardData.bookingsByDate.map(item => this.formatDateDisplay(item.date));
  const counts = this.dashboardData.bookingsByDate.map(item => item.count);
  
  this.charts.dailyBookingsChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: dates,
      datasets: [{
        label: '',
        data: counts,
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      legend: { display: false },
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        xAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'วันที่',
            fontStyle: 'bold',
            fontColor: '#000',
          },
          ticks: {
            fontStyle: 'bold',
            fontColor: '#000',
          }
        }],
        yAxes: [{
          ticks: {
            beginAtZero: true,
            fontStyle: 'bold',
            fontColor: '#000',
            callback: function(value) {
              if (value % 1 === 0) {
                return value;
              }
            }
          },
          scaleLabel: {
            display: true,
            labelString: 'จำนวนการจอง',
            fontStyle: 'bold',
            fontColor: '#000',
          }
        }]
      },
      tooltips: {
        callbacks: {
          label: function(tooltipItem, data) {
            const value = tooltipItem.yLabel;
            const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `จำนวน: ${value} (${percentage}%)`;
          }
        }
      }
    }
  });
},

createMonthlyBookingsChart() {
  if (!this.$refs.monthlyBookingsChart) {
    console.warn("ไม่เจอ monthlyBookingsChart canvas!");
    return;
  }
  
  const ctx = this.$refs.monthlyBookingsChart.getContext('2d');
  
  // ตรวจสอบว่ากราฟเดิมมีอยู่หรือไม่ ถ้ามีให้ทำลายก่อน
  if (this.charts.monthlyBookingsChart) {
    this.charts.monthlyBookingsChart.destroy();
  }
  
  // ตรวจสอบว่ามีข้อมูลหรือไม่
  const hasData = this.dashboardData.bookingsByMonth && 
                 this.dashboardData.bookingsByMonth.length > 0 &&
                 this.dashboardData.bookingsByMonth.some(item => item.count > 0);
  
  // กรณีไม่มีข้อมูล ให้แสดงข้อความแทนกราฟว่าง
  if (!hasData) {
    // ล้างพื้นที่ canvas และวาดข้อความ
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.font = '16px Prompt, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#666';
    
    let message = 'ไม่พบข้อมูลการจองรายเดือน';
    if (this.dateRange === '3months') {
      message += ' ใน 3 เดือนที่ผ่านมา';
    } else if (this.dateRange === 'custom') {
      message += ' ในช่วงเวลาที่เลือก';
    }
    
    ctx.fillText(message, ctx.canvas.width / 2, ctx.canvas.height / 2);
    
    // กำหนดให้ชาร์ตเป็น null เพื่อไม่ให้มีการเรียกใช้การอัพเดตของชาร์ต
    this.charts.monthlyBookingsChart = null;
    
    return;
  }
  
  // เตรียมข้อมูลสำหรับกราฟ (กรณีมีข้อมูล)
  const months = this.dashboardData.bookingsByMonth.map(item => item.month);
  const counts = this.dashboardData.bookingsByMonth.map(item => item.count);
  
  this.charts.monthlyBookingsChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: months,
      datasets: [{
        label: '',
        data: counts,
        backgroundColor: 'rgba(153, 102, 255, 0.7)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1
      }]
    },
    options: {
      legend: {
        display: false
      },
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        xAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'เดือน',
            fontStyle: 'bold',
            fontColor: '#000',
          },
          ticks: {
            fontStyle: 'bold',
            fontColor: '#000',
          }
        }],
        yAxes: [{
          ticks: {
            fontStyle: 'bold',
            fontColor: '#000',
            beginAtZero: true,
            callback: function(value) {
              if (value % 1 === 0) {
                return value;
              }
            }
          },
          scaleLabel: {
            display: true,
            labelString: 'จำนวนการจอง',
            fontStyle: 'bold',
            fontColor: '#000',
          }
        }]
      },
      tooltips: {
        callbacks: {
          label: function(tooltipItem, data) {
            const value = tooltipItem.yLabel;
            const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `จำนวน: ${value} (${percentage}%)`;
          }
        }
      }
    }
  });
},

createStaffShiftsChart() {
    console.log('Creating staff shifts chart');
    if (!this.$refs.staffShiftsChart) {
        console.warn("ไม่เจอ staffShiftsChart canvas!");
        return;
    }
    
    const ctx = this.$refs.staffShiftsChart.getContext('2d');
    
    // ตรวจสอบว่ากราฟเดิมมีอยู่หรือไม่ ถ้ามีให้ทำลายก่อน
    if (this.charts.staffShiftsChart) {
        this.charts.staffShiftsChart.destroy();
    }
    
    // ตรวจสอบว่ามีข้อมูลหรือไม่
    const hasData = this.dashboardData.staffShifts && 
                    Array.isArray(this.dashboardData.staffShifts) && 
                    this.dashboardData.staffShifts.length > 0 &&
                    this.dashboardData.staffShifts.some(item => (parseInt(item.totalShifts) || 0) > 0);
    
    console.log('Staff shifts data:', this.dashboardData.staffShifts);
    console.log('Has data:', hasData);
    
    // กรณีไม่มีข้อมูล ให้แสดงข้อความแทนกราฟว่าง
    if (!hasData) {
        // ล้างพื้นที่ canvas และวาดข้อความ
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.font = '10px Prompt, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#666';
        
        let message = 'ไม่พบข้อมูลประสิทธิภาพการเข้าทำงานของสมาชิกชมรม';
        if (this.dateRange === 'today') {
            message += 'ในวันนี้';
        } else if (this.dateRange === 'week') {
            message += 'ในสัปดาห์นี้';
        } else if (this.dateRange === 'month') {
            message += 'ในเดือนนี้';
        } else if (this.dateRange === '3months') {
            message += 'ใน 3 เดือนที่ผ่านมา';
        } else if (this.dateRange === 'custom') {
            message += 'ในช่วงเวลาที่เลือก';
        }
        
        ctx.fillText(message, ctx.canvas.width / 2, ctx.canvas.height / 2);
        
        // กำหนดให้ชาร์ตเป็น null เพื่อไม่ให้มีการเรียกใช้การอัพเดตของชาร์ต
        this.charts.staffShiftsChart = null;
        
        console.log('Displayed no data message instead of empty chart');
        return;
    }
    
    // เตรียมข้อมูลสำหรับกราฟ (กรณีมีข้อมูล)
    let staffNames = this.dashboardData.staffShifts.map(item => item.name || 'ไม่ระบุชื่อ');
    let totalShifts = this.dashboardData.staffShifts.map(item => parseInt(item.totalShifts) || 0);
    
    try {
        // กำหนดค่า options ที่ใช้ในทุกกรณี
        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            legend: { display: false },  // ซ่อน legend
            scales: {
                xAxes: [{
                    ticks: {
                        beginAtZero: true,
                        callback: function(value) {
                            if (value % 1 === 0) {
                                return value;
                            }
                        },
                        fontStyle: 'bold',  
                        fontColor: '#000'
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'จำนวนชิฟท์',
                        fontStyle: 'bold',  
                        fontColor: '#000'
                    }
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'สมาชิกชมรม',
                        fontStyle: 'bold',  
                        fontColor: '#000'
                    },
                    ticks: {
                        fontStyle: 'bold',
                        fontColor: '#000'
                    },
                }]
            }
        };
        
        // สร้างกราฟด้วย horizontalBar เท่านั้น
        this.charts.staffShiftsChart = new Chart(ctx, {
            type: 'horizontalBar',
            data: {
                labels: staffNames,
                datasets: [
                {
                    label: 'จำนวนการลงชิฟท์',
                    data: totalShifts,
                    backgroundColor: 'rgba(75, 75, 220, 0.7)',
                    borderColor: 'rgba(75, 75, 220, 1)',
                    borderWidth: 1
                }
                ]
            },
            options: chartOptions
        });
        
        console.log('Staff shifts chart created successfully');
    } catch (error) {
        // กรณีเกิด error ในการสร้างกราฟ
        console.error('Error creating staff shifts chart:', error);
        
        // ล้างพื้นที่ canvas และแสดงข้อความแจ้ง error
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.font = '16px Prompt, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#cc0000';
        ctx.fillText('เกิดข้อผิดพลาดในการสร้างกราฟ', ctx.canvas.width / 2, ctx.canvas.height / 2 - 15);
        ctx.fillStyle = '#666';
        ctx.font = '14px Prompt, sans-serif';
        ctx.fillText('กรุณารีเฟรชหน้าจอเพื่อลองใหม่', ctx.canvas.width / 2, ctx.canvas.height / 2 + 15);
        
        // กำหนดให้ชาร์ตเป็น null
        this.charts.staffShiftsChart = null;
    }
},

formatCurrentDate() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `${day}/${month}/${year}`;
},

filterByStaff() {
    this.fetchDashboardData();
},

viewBookingDetails(booking) {
    this.selectedBooking = booking;
    this.showBookingModal = true;
},

closeModal() {
    this.showBookingModal = false;
},

formatDateForAPI(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
},

formatDateForInput(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
},

formatDateDisplay(dateString) {
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
},

formatDate(dateString) {
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
},

getStatusClass(status) {
    switch (status) {
        case 'Pending': return 'status-pending';
        case 'Confirm': return 'status-confirmed';
        case 'Cancel': return 'status-cancelled';
        default: return '';
    }
  }
},
    mixins: [NotToken],
};
</script>
  
<style scoped>
.dashboard-container {
padding: 20px;
font-family: 'Prompt', sans-serif;
}

h1 {
color: #000000;
font-size: 200%;
font-weight: bold;
font-family: Verdana;
padding-bottom: 3%;
}

/* ส่วนหัวที่ปรับปรุงใหม่ */
.header-section {
background-color: white;
border-radius: 8px;
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
padding: 15px 20px;
margin-bottom: 30px;
display: flex;
justify-content: space-between;
align-items: center;
flex-wrap: wrap;
}

.current-date {
font-size: 16px;
font-weight: bold;
color: #333;
margin-right: 15px;
}

.date-filter {
display: flex;
align-items: center;
gap: 8px;
flex-wrap: wrap;
}

.date-filter button {
padding: 8px 12px;
background-color: #f0f0f0;
border: 1px solid #ddd;
border-radius: 4px;
cursor: pointer;
transition: all 0.3s;
font-size: 14px;
}

.date-filter button.active {
background-color: #4CAF50;
color: white;
border-color: #4CAF50;
}

/* ส่วนเลือกวันที่แบบกำหนดเอง */
.custom-date-wrapper {
margin-bottom: 20px;
display: flex;
justify-content: flex-end;
}

.custom-date-container {
display: flex;
align-items: center;
gap: 8px;
background-color: #f9f9f9;
padding: 12px 15px;
border-radius: 4px;
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
max-width: 600px;
}

.custom-date-input {
padding: 8px;
border: 1px solid #ddd;
border-radius: 4px;
width: 140px;
}

.submit-btn {
padding: 8px 16px;
background-color: #4CAF50;
color: white;
border: none;
border-radius: 4px;
cursor: pointer;
}

/* Loading overlay */
.loading-overlay {
position: fixed;
top: 0;
left: 0;
width: 100%;
height: 100%;
background-color: rgba(255, 255, 255, 0.8);
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
z-index: 1000;
}

.loading-spinner {
border: 6px solid #f3f3f3;
border-top: 6px solid #4CAF50;
border-radius: 50%;
width: 50px;
height: 50px;
animation: spin 1s linear infinite;
margin-bottom: 15px;
}

@keyframes spin {
0% { transform: rotate(0deg); }
100% { transform: rotate(360deg); }
}

/* Cards */
.summary-cards {
display: grid;
grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
gap: 20px;
margin-bottom: 30px;
}

.card {
background-color: white;
border-radius: 8px;
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
padding: 20px;
text-align: center;
transition: transform 0.3s;
}

.card2 {
background-color: white;
border-radius: 8px;
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
padding: 33px;
text-align: center;
transition: transform 0.3s;
}

.card:hover {
transform: translateY(-5px);
}

.card h3 {
margin: 0 0 10px 0;
font-size: 16px;
color: #555;
}

.card-value {
font-size: 32px;
font-weight: bold;
color: #333;
}

.card.pending {
border-top: 4px solid #FFB74D;
}

.card.confirmed {
border-top: 4px solid #4CAF50;
}

.card.cancelled {
border-top: 4px solid #F44336;
}

/* Charts */
.chart-card {
background-color: white;
border-radius: 8px;
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
padding: 20px;
height: auto !important;
min-height: 300px;
position: relative;
overflow: hidden;
}

.chart-card canvas {
max-width: 100% !important;
max-height: 250px !important;
}

.charts-grid {
display: grid;
grid-template-columns: repeat(2, 1fr);
gap: 20px;
margin-bottom: 30px;
}

/* Staff Performance */
.staff-performance {
background-color: white;
border-radius: 8px;
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
padding: 20px;
margin-bottom: 30px;
height: auto !important;
min-height: 350px;
max-height: 500px;
overflow: hidden;
}

.staff-performance canvas {
max-height: 300px !important;
}

.staff-timesheet {
background-color: white;
border-radius: 8px;
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
padding: 20px;
margin-bottom: 30px;
height: auto !important;
min-height: 350px;
max-height: 500px;
overflow: hidden;
}

.staff-timesheet canvas {
max-height: 300px !important;
max-width: 100% !important;
}

.staff-filter select {
padding: 8px;
border-radius: 4px;
border: 1px solid #ddd;
width: 200px;
}

/* Recent Bookings */
.recent-bookings {
background-color: white;
border-radius: 8px;
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
padding: 20px;
margin-bottom: 30px;
}

.table-container {
overflow-x: auto;
}

/* Status Badge */
.status-badge {
padding: 6px 12px;
border-radius: 20px;
font-size: 12px;
display: inline-block;
text-align: center;
font-weight: bold;
}

.status-pending {
background-color: #FFF3E0;
color: #E65100;
}

.status-confirmed {
background-color: #E8F5E9;
color: #2E7D32;
}

.status-cancelled {
background-color: #FFEBEE;
color: #C62828;
}

/* Action Buttons */
.action-buttons {
display: flex;
gap: 8px;
}

.btn-view {
padding: 6px 12px;
background-color: #2196F3;
color: white;
border: none;
border-radius: 4px;
cursor: pointer;
}

.btn-confirm {
padding: 6px 12px;
background-color: #4CAF50;
color: white;
border: none;
border-radius: 4px;
cursor: pointer;
}

.btn-cancel {
padding: 6px 12px;
background-color: #F44336;
color: white;
border: none;
border-radius: 4px;
cursor: pointer;
}

/* Modal */
.booking-modal {
position: fixed;
top: 0;
left: 0;
width: 100%;
height: 100%;
background-color: rgba(0, 0, 0, 0.5);
display: flex;
align-items: center;
justify-content: center;
z-index: 1000;
}

.modal-content {
background-color: white;
border-radius: 8px;
width: 500px;
max-width: 90%;
padding: 20px;
position: relative;
}

.close {
position: absolute;
top: 10px;
right: 10px;
font-size: 24px;
cursor: pointer;
}

.booking-details {
margin-top: 20px;
}

.detail-row {
display: flex;
margin-bottom: 10px;
border-bottom: 1px solid #eee;
padding-bottom: 10px;
}

.detail-label {
font-weight: bold;
width: 120px;
}

.status-value {
font-weight: bold;
}

.action-buttons-modal {
margin-top: 20px;
display: flex;
justify-content: center;
gap: 10px;
}

.canvas {
width: 100% !important;
height: 300px !important;
}

/* Responsive design */
@media (max-width: 768px) {
.charts-grid {
    grid-template-columns: 1fr;
}

.header-section {
    flex-direction: column;
    align-items: flex-start;
}

.current-date {
    margin-bottom: 10px;
}

.date-filter {
    width: 100%;
    justify-content: space-between;
    margin-top: 5px;
}

.date-filter button {
    padding: 6px 10px;
    font-size: 13px;
}

.custom-date-wrapper {
    width: 100%;
}

.custom-date-container {
    width: 100%;
    flex-wrap: wrap;
}

.custom-date-input {
    width: 100%;
    margin-bottom: 5px;
}
}
</style>