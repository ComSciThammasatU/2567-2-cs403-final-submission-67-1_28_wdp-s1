<template>
  <div class="staff-timesheet-container">
    <div class="menubar">
      <div class="namebar" :style="namebarStyle">
        <h4>{{ roleName }}: {{ name }}
          <img v-if="roleName === 'Super Staff'" src="/crown.png" width="20x" height="20px">
          <img v-if="roleName === 'Super Staff'" src="/crown.png" width="20x" height="20px">
          <img v-else-if="roleName === 'Staff'" src="/crown.png" width="20x" height="20px">
        </h4>
      </div>
      <br><br>
      <p align="center">
        <button class="backbtn" @click="backhome"><span> BACK </span></button>
      </p>
      <br>
    </div>
    
    <div class="content">
      <div class="header">
        <h1>Staff Timesheet</h1>
      </div>

      <div v-if="loading" class="loading-overlay">
        <div class="loading-spinner"></div>
        <p>Loading...</p>
      </div>

      <div v-else class="timesheet-content">
        <div class="filter-section">
          <div class="staff-filter">
            <span>Staff:</span>
            <select v-model="selectedStaff" @change="fetchWorkSchedule">
              <option value="">Select my timesheet</option>
              <option v-for="staff in allStaff" :key="staff.username" :value="staff.username">
                {{ staff.name }} ({{ staff.username }})
              </option>
            </select>

            <div class="quick-filter">
              <div class="filter-pills">
                <button class="filter-pill" :class="{ active: activeFilter === 'today' }" @click="applyQuickFilter('today')">Today</button>
                <button class="filter-pill" :class="{ active: activeFilter === 'thisWeek' }" @click="applyQuickFilter('thisWeek')">Week</button>
                <button class="filter-pill" :class="{ active: activeFilter === 'thisMonth' }" @click="applyQuickFilter('thisMonth')">Month</button>
                <button class="filter-pill" :class="{ active: activeFilter === 'custom' }" @click="activeFilter = 'custom'">Custom</button>
              </div>
            </div>
          </div>
          
          <div class="search-box">    
            <div class="search-input-container">
              <input 
                type="text" 
                v-model="searchTerm" 
                placeholder="Search..." 
                class="search-input"
              />
              <button class="btn-search" @click="applyFilters">
                <i class="fas fa-search"></i>
              </button>
              <button class="btn-clear" @click="clearSearchTerm" v-if="searchTerm">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
          
          <div class="date-filter" v-show="activeFilter === 'custom'">
            <div class="date-range">
              <span>From:</span>
              <input type="date" v-model="startDateFilter" />
            </div>
            <div class="date-range">
              <span>To:</span>
              <input type="date" v-model="endDateFilter" />
            </div>
            <button class="btn-filter" @click="applyFilters">
              <i class="fas fa-search"></i> Search
            </button>
            <button class="btn-clear-filter" @click="clearFilters">
              <i class="fas fa-times"></i> Clear
            </button>
          </div>
        </div>

        <div class="operation-period-display" v-if="currentOperationPeriod">
          <span>Operation Period: {{ formatDate(currentOperationPeriod.startDate) }} - {{ formatDate(currentOperationPeriod.endDate) }}</span>
          <p v-if="currentOperationPeriod.description">{{ currentOperationPeriod.description }}</p>
        </div>

        <div class="timesheet-list">
          <div v-if="workSchedules.length === 0" class="empty-state">
            <p>Not found work schedule</p>
          </div>
          
          <!-- ส่วนของตาราง Vue Good Table -->
          <div v-else class="vue-good-table-container">
            <vue-good-table
              :columns="columns"
              :rows="workSchedules"
              :search-options="{
                enabled: false
              }"
              :pagination-options="{
                enabled: true,
                perPage: pageSize,
                position: 'bottom',
                perPageDropdown: [3, 6, 9, 18],
                dropdownAllowAll: false,
                setCurrentPage: currentPage,
                nextLabel: 'Next',
                prevLabel: 'Back',
                rowsPerPageLabel: 'Most',
                ofLabel: 'from',
                pageLabel: 'pages', // for 'pages' mode
                allLabel: 'All',
              }"
              styleClass="vgt-table striped"
              @on-page-change="onPageChange"
              @on-per-page-change="onPerPageChange"
              :rtl="false"
              theme="default"
            >
            <template slot="table-row" slot-scope="props">
                <span v-if="props.column.field == 'workingDate'">
                  {{ formatDate(props.row.workingDate) }}
                </span>
                <span v-else-if="props.column.field == 'dayName'">
                  {{ getDayName(props.row.workingDate) }}
                </span>
                <span v-else-if="props.column.field == 'workingShift'">
                  {{ getShiftInfo(props.row.workingShift) }}
                </span>
                <span v-else-if="props.column.field == 'status'">
                  <span class="status-badge" :class="getStatusClass(props.row.workingDate)">
                    {{ getStatusText(props.row.workingDate) }}
                  </span>
                </span>
                <span v-else-if="props.column.field == 'staffName'">
                  <!-- ใช้ staffName จาก props.row โดยตรง โดยไม่ต้องเรียกฟังก์ชันอีก -->
                  {{ props.row.staffName || props.row.username }}
                </span>
                <span v-else>
                  {{ props.formattedRow[props.column.field] }}
                </span>
              </template>
              
              <div slot="emptystate">
                Not found work schedule
              </div>
            </vue-good-table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import NotToken from '../components/NotToken.vue';

export default {
  data() {
    return {
      roleName: '',
      name: '',
      roles: '',
      currentUsername: '',
      loading: true,
      workSchedules: [],
      allStaff: [],
      selectedStaff: '',
      searchTerm: '',
      startDateFilter: '',
      endDateFilter: '',
      activeFilter: 'thisMonth',
      currentPage: 1,
      pageSize: 3,
      totalRows: 0,
      currentOperationPeriod: null,
      columns: [
        {
          label: 'Date',
          field: 'workingDate',
          tdClass: 'text-center',
          thClass: 'text-center',
          sortable: true,
        },
        {
          label: 'Day',
          field: 'dayName',
          tdClass: 'text-center',
          thClass: 'text-center',
          sortable: false,
        },
        {
          label: 'Shift',
          field: 'workingShift',
          tdClass: 'text-center',
          thClass: 'text-center',
          sortable: true,
        },
        {
          label: 'Status',
          field: 'status',
          tdClass: 'text-center',
          thClass: 'text-center',
          sortable: false,
        },
        {
          label: 'Staff',
          field: 'staffName',
          tdClass: 'text-left',
          thClass: 'text-left',
          sortable: true,
          hidden: false, // จะแสดงหรือซ่อนคอลัมน์นี้ตามเงื่อนไข
        }
      ],
      shifts: {
        '1': '17:00-17:30',
        '2': '17:30-18:00',
        '3': '17:00-18:00'
      },
      dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    };
  },

  computed: {
    namebarStyle() {
      if (this.roleName === "Super Staff" || this.roleName === "Staff") {
        return { backgroundColor: '#90f2e3' };
      } else {
        return { backgroundColor: '#F9D871' };
      }
    }
  },

  watch: {
    // ซ่อนคอลัมน์เจ้าหน้าที่ตามเงื่อนไข
    selectedStaff(val) {
      const staffColumn = this.columns.find(col => col.field === 'staffName');
      if (staffColumn) {
        staffColumn.hidden = false; // ให้แสดงเสมอ
      }
    },
    roleName(val) {
      const staffColumn = this.columns.find(col => col.field === 'staffName');
      if (staffColumn) {
        staffColumn.hidden = false; // ให้แสดงเสมอ
      }
    }
  },

  async mounted() {
    try {
      // รับข้อมูลผู้ใช้จาก localStorage
      const userInfo = JSON.parse(localStorage.getItem('user'));
      if (userInfo) {
        this.roles = userInfo.roleID;
        this.name = userInfo.name;
        this.currentUsername = userInfo.username;
        
        // ตั้งค่า roleName ตาม roleID
        if (this.roles === '2') {
          this.roleName = 'Super Staff';
        } else if (this.roles === '3') {
          this.roleName = 'Staff';
        } else {
          this.roleName = 'User';
        }
      }
      
      // ซ่อนคอลัมน์เจ้าหน้าที่ถ้าไม่ใช่ Super Staff และไม่ได้เลือกแสดงของคนอื่น
      const staffColumn = this.columns.find(col => col.field === 'staffName');
      if (staffColumn) {
        staffColumn.hidden = false; // ให้แสดงเสมอ
      }
      
      // ตั้งค่าค่าเริ่มต้นเป็น "วันนี้" แทนเดือนนี้
      this.applyQuickFilter('today');
      
      // ดึงข้อมูลช่วงเปิดสนามปัจจุบัน
      await this.fetchCurrentOperationPeriod();
      
      // ดึงรายชื่อสต๊าฟทั้งหมด
      await this.fetchAllStaff();
      
      // ดึงข้อมูลตารางการทำงาน (จะถูกเรียกจาก applyQuickFilter แล้ว)
    } catch (error) {
      console.error("Error initializing timesheet page:", error);
    }
  },

  methods: {
    backhome() {
      if (this.roles == '2') {
        this.$router.push('/superStaff-home');
      } else if (this.roles == '3') {
        this.$router.push('/staff-home');
      }
    },
    
    onPageChange(params) {
      this.currentPage = params.currentPage;
    },
    
    onPerPageChange(params) {
      this.currentPage = 1;
      this.pageSize = params.currentPerPage;
    },
    
    async fetchCurrentOperationPeriod() {
      try {
        // ใช้ API จาก checkoperation.js
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/checkoperation`);
        
        if (response.data && response.data.length > 0) {
          // กรองเอาเฉพาะช่วงการเปิดสนามที่ครอบคลุมวันปัจจุบัน
          const currentDate = new Date();
          const activeOperations = response.data.filter(op => {
            const startDate = new Date(op.startDate);
            const endDate = new Date(op.endDate);
            return currentDate >= startDate && currentDate <= endDate;
          });
          
          // เรียงลำดับตาม ID จากมากไปน้อย เพื่อให้ได้ช่วงเวลาล่าสุด
          activeOperations.sort((a, b) => b.operationID - a.operationID);
          
          if (activeOperations.length > 0) {
            // มีช่วงที่ active อยู่ ใช้ช่วงที่มี ID สูงสุด
            this.currentOperationPeriod = activeOperations[0];
          } else {
            // ถ้าไม่มีช่วงที่active ให้แสดงช่วงเปิดสนามล่าสุดที่มี ID สูงสุด
            this.currentOperationPeriod = response.data[0]; // เพราะ API ส่งข้อมูลมาเรียงตาม ID DESC อยู่แล้ว
          }
        }
      } catch (error) {
        console.error("Error fetching current operation period:", error);
      }
    },
    
    // แก้ไขฟังก์ชัน fetchWorkSchedule ในส่วนการเพิ่มชื่อสต๊าฟ
async fetchWorkSchedule() {
  this.loading = true;
  
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/staffTimesheet`, {
      params: {
        startDate: this.startDateFilter,
        endDate: this.endDateFilter,
        username: this.selectedStaff
      }
    });
    
    if (response.data && response.data.success && response.data.staff) {
      let allSchedules = response.data.staff;
      
      // ถ้าไม่ได้เลือก username และมี currentUsername ให้กรองเฉพาะข้อมูลของตัวเอง
      if (!this.selectedStaff && this.currentUsername) {
        allSchedules = allSchedules.filter(staff => staff.username === this.currentUsername);
      }
      
      // ดึงข้อมูลสต๊าฟทั้งหมดก่อนเพื่อแน่ใจว่ามีข้อมูลครบ
      await this.fetchAllStaff();
      
      // เพิ่มชื่อสต๊าฟ - แก้ไขตรงนี้
      allSchedules = allSchedules.map(staff => {
        const staffName = this.getStaffName(staff.username);
        return {
          ...staff,
          staffName: staffName || staff.username // ใช้ username ถ้าไม่พบชื่อ
        };
      });
      
      // กรองตามวันที่
      if (this.startDateFilter && this.endDateFilter) {
        const startDate = new Date(this.startDateFilter);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(this.endDateFilter);
        endDate.setHours(23, 59, 59, 999);
        
        allSchedules = allSchedules.filter(schedule => {
          const scheduleDate = new Date(schedule.workingDate);
          scheduleDate.setHours(0, 0, 0, 0);
          return scheduleDate >= startDate && scheduleDate <= endDate;
        });
      }
      
      // กรองตามคำค้นหา
      if (this.searchTerm) {
        const searchLower = this.searchTerm.toLowerCase();
        allSchedules = allSchedules.filter(schedule => 
          (schedule.username && schedule.username.toLowerCase().includes(searchLower)) ||
          (schedule.staffName && schedule.staffName.toLowerCase().includes(searchLower))
        );
      }
      
      // เรียกใช้การเรียงลำดับใหม่
      this.sortWorkSchedules(allSchedules);
      
      // เก็บข้อมูล
      this.workSchedules = allSchedules;
      this.totalRows = allSchedules.length;
      
    } else {
      // ถ้าไม่มีข้อมูล
      this.workSchedules = [];
      this.totalRows = 0;
    }
  } catch (error) {
    console.error("Error fetching work schedules:", error);
    this.workSchedules = [];
    this.totalRows = 0;
  } finally {
    this.loading = false;
  }
},

// แก้ไขฟังก์ชัน getStaffName ให้ค้นหาชื่อสต๊าฟอย่างถูกต้อง
getStaffName(username) {
  // กรณีเป็นชื่อของตัวเองให้ใช้ชื่อที่เก็บไว้
  if (username === this.currentUsername) {
    return this.name;
  }
  
  // ค้นหาชื่อจากรายชื่อสต๊าฟทั้งหมด
  const staff = this.allStaff.find(s => s.username === username);
  
  // ถ้าพบรายชื่อสต๊าฟให้คืนค่าชื่อ หากไม่พบให้คืนค่าเป็น null
  return staff ? staff.name : null;
  console.log("รายชื่อสต๊าฟทั้งหมด:", this.allStaff);
},

    isUpcoming(dateString) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const checkDate = new Date(dateString);
      checkDate.setHours(0, 0, 0, 0);
      
      return checkDate > today;
    },

    clearSearchTerm() {
      this.searchTerm = '';
      this.applyFilters();
    },
    
    sortWorkSchedules(schedules) {
      // สร้างวันที่ปัจจุบัน
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // สร้างฟังก์ชันช่วยสำหรับคำนวณความสำคัญในการเรียงลำดับ
      const getPriority = (dateStr) => {
        const checkDate = new Date(dateStr);
        checkDate.setHours(0, 0, 0, 0);
        
        // วันนี้มีความสำคัญสูงสุด (0)
        if (checkDate.getTime() === today.getTime()) {
          return 0;
        }
        // วันในอนาคตมีความสำคัญรองลงมา (1)
        else if (checkDate > today) {
          return 1;
        }
        // วันในอดีตมีความสำคัญน้อยสุด (2)
        else {
          return 2;
        }
      };
      
      // เรียงลำดับตามลำดับความสำคัญ
      schedules.sort((a, b) => {
        // เปรียบเทียบความสำคัญก่อน (ปัจจุบัน > อนาคต > อดีต)
        const priorityA = getPriority(a.workingDate);
        const priorityB = getPriority(b.workingDate);
        
        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }
        
        // ถ้าอยู่ในกลุ่มเดียวกัน ให้เรียงตามวันที่
        const dateA = new Date(a.workingDate);
        const dateB = new Date(b.workingDate);
        
        // สำหรับวันในอนาคต เรียงจากวันที่ใกล้ที่สุดไปไกลที่สุด
        if (priorityA === 1) {
          return dateA - dateB;
        }
        // สำหรับวันในอดีต เรียงจากวันที่ใหม่ที่สุดไปเก่าที่สุด
        else if (priorityA === 2) {
          return dateB - dateA;
        }
        
        return 0; // กรณีเป็นวันเดียวกัน (ปัจจุบัน)
      });
      
      return schedules;
    },
    
    formatDate(dateString) {
      const date = new Date(dateString);
      return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    },
    
    getDayName(dateString) {
      const date = new Date(dateString);
      return this.dayNames[date.getDay()];
    },
    
    getShiftInfo(shiftID) {
      return this.shifts[shiftID] || 'ไม่ระบุ';
    },
    
    isToday(dateString) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const checkDate = new Date(dateString);
  checkDate.setHours(0, 0, 0, 0);
  
  return today.getTime() === checkDate.getTime();
},

getStatusClass(dateString) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const checkDate = new Date(dateString);
  checkDate.setHours(0, 0, 0, 0);
  
  if (checkDate.getTime() === today.getTime()) {
    return 'status-today';
  } else if (checkDate < today) {
    return 'status-past';
  } else {
    return 'status-upcoming';
  }
},
    
    getStatusText(dateString) {
      const statusClass = this.getStatusClass(dateString);
      
      switch (statusClass) {
        case 'status-today':
          return 'Today';
        case 'status-past':
          return 'Passed';
        case 'status-upcoming':
          return 'Coming';
        default:
          return '';
      }
    },
    
    applyFilters() {
      this.currentPage = 1;
      this.fetchWorkSchedule();
    },

    async fetchAllStaff() {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/allstaff`);
    
    if (response.data && response.data.success && response.data.staff) {
      // เก็บข้อมูลสต๊าฟทั้งหมดรวมถึงตัวเอง (ไม่ต้องกรองตัวเองออก)
      this.allStaff = response.data.staff;
      console.log("รายชื่อสต๊าฟทั้งหมด:", this.allStaff);
    } else {
      console.error("Invalid response format from API");
      this.allStaff = [];
    }
  } catch (error) {
    console.error("Error fetching staff list:", error);
    this.allStaff = [];
  }
},
    
    clearFilters() {
      this.searchTerm = '';
      
      // ตั้งค่าวันเริ่มต้นและสิ้นสุดเป็นค่าเริ่มต้น
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      this.startDateFilter = firstDayOfMonth.toISOString().split('T')[0];
      
      const lastDayOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0);
      this.endDateFilter = lastDayOfNextMonth.toISOString().split('T')[0];
      
      this.selectedStaff = '';
      this.currentPage = 1;
      this.activeFilter = 'thisMonth';
      this.fetchWorkSchedule();
    },
    
    applyQuickFilter(filterType) {
  // สร้างวันที่ปัจจุบัน
  const today = new Date();
  
  console.log("วันที่ปัจจุบัน:", today.toLocaleDateString());
  
  this.activeFilter = filterType;
  
  switch (filterType) {
    case 'today':
      // ใช้วันที่ปัจจุบันโดยตรง ไม่ต้องปรับ
      const todayStr = today.toISOString().split('T')[0];
      console.log("ตั้งค่าตัวกรองวันนี้เป็น:", todayStr);
      this.startDateFilter = todayStr;
      this.endDateFilter = todayStr;
      break;
      
    case 'thisWeek':
      // ปรับวันแรกของสัปดาห์
      const firstDayOfWeek = new Date(today);
      const day = today.getDay();
      firstDayOfWeek.setDate(today.getDate() - day);
      
      // ปรับวันสุดท้ายของสัปดาห์
      const lastDayOfWeek = new Date(firstDayOfWeek);
      lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
      
      this.startDateFilter = firstDayOfWeek.toISOString().split('T')[0];
      this.endDateFilter = lastDayOfWeek.toISOString().split('T')[0];
      break;
      
    case 'thisMonth':
      // ปรับวันแรกของเดือน
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      
      // ปรับวันสุดท้ายของเดือน
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      this.startDateFilter = firstDayOfMonth.toISOString().split('T')[0];
      this.endDateFilter = lastDayOfMonth.toISOString().split('T')[0];
      break;
  }
  
  console.log(`ใช้ตัวกรอง ${filterType}: ${this.startDateFilter} ถึง ${this.endDateFilter}`);
  
  this.currentPage = 1;
  this.fetchWorkSchedule();
}
  },
  mixins: [NotToken],
};
</script>

<style scoped>
@import '@/assets/css/StaffTimeSheet.css';
@import '@/assets/css/Operation.css';

/* เพิ่ม CSS สำหรับ Vue Good Table */
.vue-good-table-container {
  width: 100%;
  margin-top: 20px;
}

.vgt-table {
  width: 100%;
  font-size: 14px;
}

.vgt-table th {
  background-color: #f5f5f5 !important;
  color: #333 !important;
  font-weight: 600 !important;
}

.vgt-table td, .vgt-table th {
  padding: 10px !important;
  vertical-align: middle !important;
}

.vgt-table .row-today {
  background-color: rgba(144, 242, 227, 0.2) !important;
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  color: white;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.status-today {
  background-color: #0088ff;
}

.status-badge.status-past {
  background-color: #aaaaaa;
}

.status-badge.status-upcoming {
  background-color: #29cc97;
}

/* ตัวกรอง */
.filter-section {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.filter-pills {
  display: flex;
  gap: 10px;
  margin: 10px 0;
}

.filter-pill {
  background: #eee;
  border: none;
  border-radius: 20px;
  padding: 5px 15px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s;
}

.filter-pill.active {
  background: #0088ff;
  color: white;
}

.search-input-container {
  position: relative;
  margin: 10px 0;
}

.search-input {
  width: 100%;
  padding: 8px 15px;
  padding-right: 70px;
  border-radius: 4px;
  border: 1px solid #ddd;
  font-size: 14px;
}

.btn-search, .btn-clear {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: none;
  cursor: pointer;
  color: #666;
}

.btn-search {
  right: 40px;
}

.btn-clear {
  right: 10px;
}

.date-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-top: 10px;
  padding: 10px;
  background: #f0f0f0;
  border-radius: 5px;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 5px;
}

.date-range input {
  padding: 5px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.btn-filter, .btn-clear-filter {
  padding: 5px 10px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 13px;
}

.btn-filter {
  background: #0088ff;
  color: white;
}

.btn-clear-filter {
  background: #f44336;
  color: white;
}

/* ปรับแต่งการแบ่งหน้า */
.vgt-wrap__footer {
  background-color: transparent !important;
  border-top: 1px solid #ddd !important;
  padding: 10px 0 !important;
}

.vgt-wrap__footer .footer__navigation {
  display: flex;
  justify-content: center;
  align-items: center;
}

.vgt-wrap__footer .footer__navigation__page-btn,
.vgt-wrap__footer .footer__navigation__info,
.vgt-wrap__footer .footer__row-count__label,
.vgt-wrap__footer .footer__row-count__select {
  font-size: 14px !important;
}

.vgt-wrap__footer .footer__navigation__page-btn {
  font-weight: normal !important;
  padding: 6px 12px !important;
  margin: 0 5px !important;
}

.vgt-wrap__footer .footer__navigation__page-btn--disabled {
  opacity: 0.5 !important;
  cursor: not-allowed !important;
}

.vgt-wrap__footer .footer__row-count__select {
  padding: 4px 8px !important;
  border-radius: 4px !important;
  border: 1px solid #ddd !important;
}

/* ปรับแต่งโมบาย */
@media (max-width: 768px) {
  .filter-section {
    flex-direction: column;
  }
  
  .date-filter {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .date-range {
    width: 100%;
  }
  
  .date-range input {
    width: 100%;
  }
  
  .filter-pills {
    flex-wrap: wrap;
  }
  
  .vgt-wrap__footer .footer__navigation {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .vgt-wrap__footer .footer__navigation__info {
    text-align: center;
    width: 100%;
    margin: 5px 0;
  }
}

/* แถบไฮไลท์สำหรับแถวที่เป็นวันปัจจุบัน */
.vgt-table tr.today-row {
  background-color: rgba(144, 242, 227, 0.2) !important;
}

/* ปรับแต่งเมื่อไม่มีข้อมูล */
.vgt-table .vgt-center-align {
  justify-content: center;
  text-align: center;
}

.vgt-table .vgt-left-align {
  justify-content: flex-start;
  text-align: left;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 50px 0;
  font-size: 16px;
  color: #666;
  background-color: #f9f9f9;
  border-radius: 8px;
  border: 1px dashed #ddd;
}
</style>