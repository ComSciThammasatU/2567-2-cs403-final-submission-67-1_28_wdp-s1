<!-- OperationDayList.vue -->
<template>
    <div class="operation-day-container">
      <div class="header">
        <h1>รายการเปิดสนาม</h1>
      </div>
  
      <div v-if="loading" class="loading-overlay">
        <div class="loading-spinner"></div>
        <p>กำลังโหลดข้อมูล...</p>
      </div>
  
      <div v-else class="operation-day-content">
        <div class="filter-section">
          <div class="search-box">
            <input 
              type="text" 
              v-model="searchTerm" 
              placeholder="ค้นหาจากหมายเหตุ..." 
            />
          </div>
          <div class="date-filter">
            <div class="date-range">
              <span>ตั้งแต่วันที่:</span>
              <input type="date" v-model="startDateFilter" />
            </div>
            <div class="date-range">
              <span>ถึงวันที่:</span>
              <input type="date" v-model="endDateFilter" />
            </div>
            <button class="btn-filter" @click="applyFilters">
              <i class="fas fa-search"></i> ค้นหา
            </button>
            <button class="btn-clear-filter" @click="clearFilters">
              <i class="fas fa-times"></i> ล้างตัวกรอง
            </button>
          </div>
        </div>
  
        <div class="operation-day-list">
          <div v-if="filteredOperationDays.length === 0" class="empty-state">
            <p>ไม่พบข้อมูลการเปิดสนาม</p>
          </div>
          <div v-else class="operation-cards">
            <div 
              v-for="operation in filteredOperationDays" 
              :key="operation.operationID" 
              class="operation-card"
              :class="{ 'active-operation': isActiveOperation(operation) }"
            >
              <div class="card-header">
                <h3>การเปิดสนาม #{{ operation.operationID }}</h3>
                <div class="status-badge" :class="getStatusClass(operation)">
                  {{ getStatusText(operation) }}
                </div>
              </div>
              <div class="card-body">
                <div class="date-range-display">
                  <i class="fas fa-calendar-alt"></i>
                  <span>{{ formatDate(operation.startDate) }} - {{ formatDate(operation.endDate) }}</span>
                </div>
                <div class="description-display" v-if="operation.description">
                  <i class="fas fa-sticky-note"></i>
                  <span>หมายเหตุ: {{ operation.description }}</span>
                </div>
                <div class="description-display" v-else>
                  <i class="fas fa-sticky-note"></i>
                  <span class="no-description">ไม่มีหมายเหตุ</span>
                </div>
                <div class="duration-display">
                  <i class="fas fa-clock"></i>
                  <span>ระยะเวลา: {{ calculateDuration(operation.startDate, operation.endDate) }} วัน</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Pagination Controls -->
          <div class="pagination-container">
            <div class="pagination-info">
              แสดง {{ (currentPage - 1) * pageSize + 1 }}-{{ Math.min(currentPage * pageSize, totalItems) }} จาก {{ totalItems }} รายการ
            </div>
            <div class="pagination-controls">
              <button 
                class="btn-page-nav" 
                :disabled="currentPage === 1" 
                @click="changePage(currentPage - 1)"
              >
                <i class="fas fa-chevron-left"></i> ก่อนหน้า
              </button>
              
              <span class="current-page">หน้า {{ currentPage }} จาก {{ totalPages }}</span>
              
              <button 
                class="btn-page-nav" 
                :disabled="currentPage === totalPages" 
                @click="changePage(currentPage + 1)"
              >
                ถัดไป <i class="fas fa-chevron-right"></i>
              </button>
            </div>
            <div class="page-size-control">
              <span>แสดง:</span>
              <select v-model="pageSize" @change="changePageSize">
                <option :value="5">5</option>
                <option :value="10">10</option>
                <option :value="20">20</option>
                <option :value="50">50</option>
              </select>
              <span>รายการต่อหน้า</span>
            </div>
          </div>
        </div>
      </div>
  
      <!-- โมดัลเพิ่ม/แก้ไขการเปิดสนาม -->
      <div v-if="showAddModal || showEditModal" class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h2>{{ showEditModal ? 'แก้ไขการเปิดสนาม' : 'เพิ่มการเปิดสนาม' }}</h2>
            <button class="btn-close" @click="closeModal">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>วันที่เริ่มต้น:</label>
              <input type="date" v-model="formData.startDate" required />
            </div>
            <div class="form-group">
              <label>วันที่สิ้นสุด:</label>
              <input type="date" v-model="formData.endDate" required />
            </div>
            <div class="form-group">
              <label>หมายเหตุ/โอกาสในการเปิด:</label>
              <textarea v-model="formData.description" placeholder="เช่น เทอม 2/68, วันสงกรานต์, etc."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="closeModal">ยกเลิก</button>
            <button class="btn-save" @click="saveOperation">บันทึก</button>
          </div>
        </div>
      </div>
  
      <!-- โมดัลยืนยันการลบ -->
      <div v-if="showDeleteModal" class="modal-overlay">
        <div class="modal-content delete-modal">
          <div class="modal-header">
            <h2>ยืนยันการลบ</h2>
            <button class="btn-close" @click="showDeleteModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <p>คุณต้องการลบการเปิดสนาม #{{ selectedOperation.operationID }} ใช่หรือไม่?</p>
            <p v-if="selectedOperation.description">
              <strong>หมายเหตุ:</strong> {{ selectedOperation.description }}
            </p>
            <p>
              <strong>ช่วงเวลา:</strong> {{ formatDate(selectedOperation.startDate) }} - {{ formatDate(selectedOperation.endDate) }}
            </p>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="showDeleteModal = false">ยกเลิก</button>
            <button class="btn-confirm-delete" @click="deleteOperation">ยืนยันการลบ</button>
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
        loading: true,
        operationDays: [],
        filteredOperationDays: [],
        showAddModal: false,
        showEditModal: false,
        showDeleteModal: false,
        searchTerm: '',
        startDateFilter: '',
        endDateFilter: '',
        formData: {
          startDate: '',
          endDate: '',
          description: ''
        },
        selectedOperation: {},
        // ข้อมูลสำหรับการแบ่งหน้า
        currentPage: 1,
        pageSize: 5,
        totalItems: 0,
        totalPages: 1
      };
    },
  
    computed: {
      // เอาฟังก์ชัน displayedPageNumbers ออกเพราะไม่ใช้แล้ว
    },
  
    async mounted() {
      try {
        await this.fetchOperationDays();
      } catch (error) {
        console.error("Error loading operation days:", error);
      }
    },
  
    methods: {
        async fetchOperationDays() {
            this.loading = true;
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/operation`, {
                params: {
                    page: this.currentPage,
                    limit: this.pageSize,
                    search: this.searchTerm || null,
                    startDate: this.startDateFilter || null,
                    endDate: this.endDateFilter || null,
                    sortBy: 'operationID' // เพิ่มพารามิเตอร์สำหรับเรียงลำดับตาม ID
                }
                });
                
                if (response.data.status === 'ok') {
                this.operationDays = response.data.data;
                this.filteredOperationDays = response.data.data;
                this.totalItems = response.data.pagination.totalCount;
                this.totalPages = response.data.pagination.totalPages;
                
                // เรียงลำดับข้อมูลตาม ID (ถ้า backend ไม่ได้เรียงมาให้)
                this.sortOperationDays();
                } else {
                console.error("Error in API response:", response.data);
                alert("เกิดข้อผิดพลาดในการดึงข้อมูล");
                }
            } catch (error) {
                console.error("Error fetching operation days:", error);
                alert("เกิดข้อผิดพลาดในการดึงข้อมูล กรุณาลองใหม่อีกครั้ง");
            } finally {
                this.loading = false;
            }
        },
  
      changePage(page) {
        if (page !== this.currentPage && page >= 1 && page <= this.totalPages) {
          this.currentPage = page;
          this.fetchOperationDays();
        }
      },
      
      changePageSize(event) {
        this.pageSize = parseInt(event.target.value);
        this.currentPage = 1; // กลับไปหน้าแรกเมื่อเปลี่ยนจำนวนรายการต่อหน้า
        this.fetchOperationDays();
      },
  
      applyFilters() {
        this.currentPage = 1; // กลับไปหน้าแรกเมื่อใช้ตัวกรอง
        this.fetchOperationDays();
      },
  
      clearFilters() {
        this.searchTerm = '';
        this.startDateFilter = '';
        this.endDateFilter = '';
        this.currentPage = 1;
        this.fetchOperationDays();
      },

      sortOperationDays() {
        // เรียงตาม operationID จากมากไปน้อย (ID ล่าสุดก่อน)
        this.operationDays.sort((a, b) => b.operationID - a.operationID);
        this.filteredOperationDays.sort((a, b) => b.operationID - a.operationID);
      },
  
      formatDate(dateString) {
        // ใช้วิธีแยกส่วนของวันที่โดยตรงจาก string แทนการใช้ Date object
        if (!dateString) return '';
        
        const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));
        return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
        },
        
        calculateDuration(startDate, endDate) {
        // คำนวณจำนวนวันโดยตรงจาก string โดยไม่ต้องใช้ Date object
        if (!startDate || !endDate) return 0;
        
        const [startYear, startMonth, startDay] = startDate.split('-').map(num => parseInt(num, 10));
        const [endYear, endMonth, endDay] = endDate.split('-').map(num => parseInt(num, 10));
        
        // สร้าง Date โดยระบุเวลาเที่ยงวันเพื่อหลีกเลี่ยงปัญหา timezone
        const start = new Date(startYear, startMonth - 1, startDay, 12, 0, 0);
        const end = new Date(endYear, endMonth - 1, endDay, 12, 0, 0);
        
        // คำนวณความแตกต่าง
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 เพื่อรวมวันสุดท้ายด้วย
        
        return diffDays;
        },
  
      isActiveOperation(operation) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // หาช่วงเปิดสนามล่าสุด (ID สูงสุด) ที่กำลังใช้งานอยู่
        const activeOperations = this.operationDays.filter(op => {
            const opStartDate = new Date(op.startDate);
            opStartDate.setHours(0, 0, 0, 0);
            
            const opEndDate = new Date(op.endDate);
            opEndDate.setHours(23, 59, 59, 999);
            
            return today >= opStartDate && today <= opEndDate;
        });
        
        // เรียงลำดับช่วงเปิดสนามที่ active ตาม ID จากมากไปน้อย
        activeOperations.sort((a, b) => b.operationID - a.operationID);
        
        // ถ้ามีช่วงเปิดสนามที่กำลังใช้งานอยู่
        if (activeOperations.length > 0) {
            // แสดงสถานะ "กำลังใช้งาน" เฉพาะช่วงเปิดสนามที่มี ID สูงสุด
            return operation.operationID === activeOperations[0].operationID;
        }
        
        return false;
      },
  
      getStatusClass(operation) {
        // ถ้าเป็นช่วงเปิดสนามล่าสุดที่กำลังใช้งาน
        if (this.isActiveOperation(operation)) {
            return 'status-active';
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const startDate = new Date(operation.startDate);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(operation.endDate);
        endDate.setHours(23, 59, 59, 999);
        
        // ถ้าวันนี้อยู่ในช่วงเวลา แต่ไม่ใช่ช่วงล่าสุด ให้แสดงเป็น "หมดเวลาแล้ว"
        if (today >= startDate && today <= endDate) {
            return 'status-expired';
        } else if (today < startDate) {
            return 'status-upcoming';
        } else {
            return 'status-expired';
        }
      },
  
      getStatusText(operation) {
        const statusClass = this.getStatusClass(operation);
        
        switch (statusClass) {
            case 'status-active':
            return 'กำลังใช้งาน';
            case 'status-upcoming':
            return 'จะเปิดเร็วๆ นี้';
            case 'status-expired':
            return 'หมดเวลาแล้ว';
            default:
            return '';
        }
      },
  
      editOperation(operation) {
        this.selectedOperation = { ...operation };
        this.formData = {
          startDate: operation.startDate,
          endDate: operation.endDate,
          description: operation.description || ''
        };
        this.showEditModal = true;
      },
  
      confirmDelete(operation) {
        this.selectedOperation = { ...operation };
        this.showDeleteModal = true;
      },
  
      closeModal() {
        this.showAddModal = false;
        this.showEditModal = false;
        this.formData = {
          startDate: '',
          endDate: '',
          description: ''
        };
        this.selectedOperation = {};
      },
  
      async saveOperation() {
        // ตรวจสอบความถูกต้องของข้อมูล
        if (!this.formData.startDate || !this.formData.endDate) {
          alert('กรุณาระบุวันที่เริ่มต้นและวันที่สิ้นสุด');
          return;
        }
  
        const startDate = new Date(this.formData.startDate);
        const endDate = new Date(this.formData.endDate);
  
        if (startDate > endDate) {
          alert('วันที่เริ่มต้นต้องมาก่อนวันที่สิ้นสุด');
          return;
        }
  
        try {
          if (this.showEditModal) {
            // แก้ไขข้อมูล
            await axios.put(`${import.meta.env.VITE_API_BASE_URL}/operation/${this.selectedOperation.operationID}`, {
              startDate: this.formData.startDate,
              endDate: this.formData.endDate,
              description: this.formData.description
            });
            alert('แก้ไขข้อมูลเรียบร้อยแล้ว');
          } else {
            // เพิ่มข้อมูลใหม่
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/operation`, {
              startDate: this.formData.startDate,
              endDate: this.formData.endDate,
              description: this.formData.description
            });
            alert('เพิ่มข้อมูลเรียบร้อยแล้ว');
          }
          
          // รีเฟรชข้อมูล
          await this.fetchOperationDays();
          this.closeModal();
        } catch (error) {
          console.error("Error saving operation day:", error);
          alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง');
        }
      },
  
      async deleteOperation() {
        try {
          await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/operation/${this.selectedOperation.operationID}`);
          alert('ลบข้อมูลเรียบร้อยแล้ว');
          
          // รีเฟรชข้อมูล
          await this.fetchOperationDays();
          this.showDeleteModal = false;
        } catch (error) {
          console.error("Error deleting operation day:", error);
          alert('เกิดข้อผิดพลาดในการลบข้อมูล กรุณาลองใหม่อีกครั้ง');
        }
      },
      
      exportOperationDays() { 
        this.loading = true;
        
        // ดึงข้อมูลทั้งหมดที่ตรงกับเงื่อนไขการกรอง (ไม่มีการแบ่งหน้า)
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/operation`, {
          params: {
            limit: 1000, // จำนวนมากพอที่จะได้ข้อมูลทั้งหมด
            page: 1,
            search: this.searchTerm || null,
            startDate: this.startDateFilter || null,
            endDate: this.endDateFilter || null
          }
        })
        .then(response => {
          if (response.data.status === 'ok') {
            const exportData = response.data.data.map(operation => {
              return {
                'รหัสการเปิดสนาม': operation.operationID,
                'วันที่เริ่มต้น': this.formatDate(operation.startDate),
                'วันที่สิ้นสุด': this.formatDate(operation.endDate),
                'ระยะเวลา (วัน)': this.calculateDuration(operation.startDate, operation.endDate),
                'สถานะ': this.getStatusText(operation),
                'หมายเหตุ': operation.description || '-'
              };
            });
            
            // แปลงข้อมูลเป็น CSV
            let csvContent = '';
            
            // สร้างส่วนหัว
            const headers = Object.keys(exportData[0]);
            csvContent += headers.join(',') + '\n';
            
            // สร้างข้อมูลแต่ละแถว
            exportData.forEach(item => {
              const row = headers.map(header => {
                // ตรวจสอบว่ามีเครื่องหมาย , หรือไม่ ถ้ามีให้ครอบด้วย "
                const cell = String(item[header]);
                return cell.includes(',') ? `"${cell}"` : cell;
              });
              csvContent += row.join(',') + '\n';
            });
            
            // สร้างไฟล์และดาวน์โหลด
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            
            link.setAttribute('href', url);
            link.setAttribute('download', `operation_days_export_${new Date().toISOString().slice(0, 10)}.csv`);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } else {
            alert('เกิดข้อผิดพลาดในการส่งออกข้อมูล');
          }
        })
        .catch(error => {
          console.error("Error exporting operation days:", error);
          alert('เกิดข้อผิดพลาดในการส่งออกข้อมูล');
        })
        .finally(() => {
          this.loading = false;
        });
      }
    },
    mixins: [NotToken],
  };
  </script>
  
  <style scoped>
  .operation-day-container {
    padding: 20px;
    font-family: 'Prompt', sans-serif;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .action-buttons {
    display: flex;
    gap: 10px;
  }
  
  .btn-add, .btn-export {
    padding: 10px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .btn-add {
    background-color: #4CAF50;
    color: white;
  }
  
  .btn-export {
    background-color: #2196F3;
    color: white;
  }
  
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
    border: 5px solid #f3f3f3;
    border-top: 5px solid #3498db;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  /* Filter Section */
  .filter-section {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 15px;
    margin-bottom: 20px;
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    align-items: center;
  }
  
  .search-box {
    flex: 1;
  }
  
  .search-box input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-family: 'Prompt', sans-serif;
  }
  
  .date-filter {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
  }
  
  .date-range {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .date-range input {
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-family: 'Prompt', sans-serif;
  }
  
  .btn-filter {
    padding: 8px 12px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
  }
  
  .btn-clear-filter {
    padding: 8px 12px;
    background-color: #f0f0f0;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
  }
  
  /* Operation Cards */
  .operation-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    margin-bottom: 20px;
  }
  
  .operation-card {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    transition: transform 0.3s, box-shadow 0.3s;
  }
  
  .operation-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  .active-operation {
    border-left: 4px solid #4CAF50;
  }
  
  .card-header {
    padding: 15px;
    background-color: #f8f9fa;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .card-header h3 {
    margin: 0;
    font-size: 16px;
  }
  
  .status-badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: bold;
  }
  
  .status-active {
    background-color: #e8f5e9;
    color: #2e7d32;
  }
  
  .status-upcoming {
    background-color: #e3f2fd;
    color: #1565c0;
  }
  
  .status-expired {
    background-color: #f5f5f5;
    color: #757575;
  }
  
  .card-body {
    padding: 15px;
  }
  
  .date-range-display,
  .description-display,
  .duration-display {
    display: flex;
    align-items: flex-start;
    margin-bottom: 10px;
    gap: 10px;
  }
  
  .date-range-display i,
  .description-display i,
  .duration-display i {
    color: #666;
    min-width: 16px;
    margin-top: 2px;
  }
  
  .no-description {
    color: #999;
    font-style: italic;
  }
  
  .card-actions {
    display: flex;
    border-top: 1px solid #eee;
  }
  
  .card-actions button {
    flex: 1;
    padding: 10px 0;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
  }
  
  .btn-edit {
    background-color: #f8f9fa;
    color: #0d6efd;
  }
  
  .btn-edit:hover {
    background-color: #e9ecef;
  }
  
  .btn-delete {
    background-color: #f8f9fa;
    color: #dc3545;
  }
  
  .btn-delete:hover {
    background-color: #e9ecef;
  }
  
  /* Pagination */
  .pagination-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 15px;
    margin-top: 20px;
    flex-wrap: wrap;
    gap: 15px;
  }
  
  .pagination-info {
    color: #666;
    font-size: 14px;
  }
  
  .pagination-controls {
    display: flex;
    align-items: center;
    gap: 15px;
  }
  
  .btn-page-nav {
    padding: 8px 16px;
    border: 1px solid #ddd;
    background-color: white;
    border-radius: 4px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 5px;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .btn-page-nav:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .btn-page-nav:not(:disabled):hover {
    background-color: #f0f0f0;
  }
  
  .current-page {
    color: #555;
    font-weight: bold;
  }
  
  .page-size-control {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #666;
    font-size: 14px;
  }
  
  .page-size-control select {
    padding: 5px 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: white;
  }
  
  /* Empty State */
  .empty-state {
    text-align: center;
    padding: 40px 0;
    color: #666;
  }
  
  /* Modal */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .modal-content {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    width: 500px;
    max-width: 90%;
    overflow: hidden;
  }
  
  .delete-modal {
    width: 400px;
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    border-bottom: 1px solid #eee;
  }
  
  .modal-header h2 {
    margin: 0;
    font-size: 18px;
  }
  
  .btn-close {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
  }
  
  .modal-body {
    padding: 20px;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
  }
  
  .form-group input,
  .form-group textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-family: 'Prompt', sans-serif;
  }
  
  .form-group textarea {
    min-height: 100px;
    resize: vertical;
  }
  
  .modal-footer {
    padding: 15px 20px;
    border-top: 1px solid #eee;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
  
  .btn-cancel {
    padding: 8px 16px;
    background-color: #f0f0f0;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .btn-save {
    padding: 8px 16px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .btn-confirm-delete {
    padding: 8px 16px;
    background-color: #dc3545;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  @media (max-width: 768px) {
    .operation-cards {
      grid-template-columns: 1fr;
    }
    
    .filter-section {
      flex-direction: column;
      align-items: stretch;
    }
    
    .date-filter {
      flex-direction: column;
      align-items: stretch;
    }
    
    .pagination-container {
      flex-direction: column;
      align-items: center;
    }
  }
  </style>