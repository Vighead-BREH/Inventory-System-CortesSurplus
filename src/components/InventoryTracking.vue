<template>
  <div class="table-container">
    <div class="table-top-container">
      <div class="search-container">
        <input
          v-model="searchQuery"
          type="text"
          id="search-inp"
          placeholder="Search materials..."
          class="search-input"
          @input="filterMaterials"
        />
      </div>
      <div class="pagination-controls">
        <button :disabled="currentPage <= 1" @click="prevPage">Prev</button>
        <span>Page {{ currentPage }} / {{ totalPages }}</span>
        <button :disabled="currentPage >= totalPages" @click="nextPage">Next</button>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th @click="changeSort('name')">
            <div class="th-gap">
              <span class="nowrap">Material</span>
              <span class="sort-icon">{{ getSortIcon('name') }}</span>
            </div>
          </th>
          <th @click="changeSort('stock')">
            <div class="th-gap">
              <span class="nowrap">Stock</span>
              <span class="sort-icon">{{ getSortIcon('stock') }}</span>
            </div>
          </th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in materialsStore.sortedMaterials" :key="item.id">
          <td>{{ item.name }}</td>
          <td>{{ formatQuantity(item.stock) }}</td>
          <td>
            <span
              :class="{
                'low-stock': item.stock < 5,
                'in-stock': item.stock >= 5,
              }"
            >
              {{ formatQuantity(item.stock) < 5 ? 'Low Stock' : 'In Stock' }}
            </span>
          </td>
          <td>
            <div class="btn-gap">
              <button @click="editMaterial(item)">
                <i class="fas fa-edit" style="color: #007bff"></i>
              </button>
              <button @click="openDeleteMaterialModal(item)">
                <i class="fas fa-trash" style="color: red"></i>
              </button>
              <button @click="openUsedMaterialModal(item)">
                <i class="fas fa-check" style="color: green"></i>
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <button @click="openAddMaterialModal" style="margin: 5px 0px 0px; color: rgb(0, 123, 255)">
      <i class="fa-solid fa-plus"></i>
    </button>
  </div>

  <!-- Add or Edit Material Modal -->
  <div v-if="isModalVisible" class="modal-backdrop" @click="closeModal">
    <div class="modal" @click.stop="">
      <div class="modal-content">
        <h2>{{ modalAction }} Material</h2>
        <label for="name">Name:</label>
        <input
          v-model="modalMaterial.name"
          id="name"
          type="text"
          placeholder="Enter material name"
          @input="validateField('name')"
          @blur="validateField('name')"
        />
        <p v-if="materialsStore.showUnitNameError" class="error">{{ materialsStore.validationErrors.name }}</p>
        <label for="stock">Stock:</label>
        <input
          v-model="modalMaterial.stock"
          id="stock"
          type="number"
          @input="validateField('stock')"
          @blur="validateField('stock')"
        />
        <p v-if="materialsStore.showStockError" class="error">{{ materialsStore.validationErrors.stock }}</p>
        <div>
          <div class="modal-buttons btn-gap">
            <button @click="saveMaterial" :disabled="hasValidationErrors">Save</button>
            <button @click="closeModal">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Delete Modal -->
  <div v-if="deleteModalVisible" class="modal-backdrop" @click="closeDeleteModal">
    <div class="modal" @click.stop>
      <div class="modal-content">
        <h2>Are you sure you want to delete this material?</h2>
        <div class="modal-buttons btn-gap">
          <button @click="confirmDeleteMaterial">Yes</button>
          <button @click="closeDeleteModal">No</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Used Materials Modal -->
  <div v-if="isUsedModalVisible" class="modal-backdrop" @click="closeUsedModal">
    <div class="modal" @click.stop>
      <div class="modal-content">
        <h2>Material Used</h2>
        <label for="stock">Quantity Used:</label>
        <input
          v-model="modalMaterial.stock"
          id="stock"
          type="number"
          @input="validateField('stock')"
          @blur="validateField('stock')"
        />
        <div class="modal-buttons btn-gap">
          <button @click="usedMaterial" :disabled="hasValidationErrors">Use</button>
          <button @click="closeUsedModal">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useMaterialsStore } from '@/stores/materialsStore'

export default {
  name: 'MaterialsInventory',
  data() {
    return {
      searchQuery: '',
      currentPage: 1,
      itemsPerPage: 5,
      isModalVisible: false,
      deleteModalVisible: false,
      isUsedModalVisible: false,
      modalMaterial: { id: null, name: '', stock: 0 },
      modalAction: 'Add',
      sortBy: '',
      sortOrder: 'asc',
      viewModalVisible: false,
    }
  },
  computed: {
    materialsStore() {
      return useMaterialsStore()
    },
    filteredMaterials() {
      return this.materialsStore.filteredMaterials(this.searchQuery)
    },
    totalPages() {
      return Math.ceil(this.filteredMaterials.length / this.itemsPerPage)
    },
    paginatedMaterials() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = this.currentPage * this.itemsPerPage
      return this.filteredMaterials.slice(start, end)
    },
  },
  methods: {
    changeSort(column) {
      this.materialsStore.changeSort(column);
    },
    getSortIcon(column) {
      if (this.materialsStore.sortBy === column) {
        return this.materialsStore.sortOrder === 'asc' ? '⬆' : '⬇';
      }
      return '⬍';
    },
    filterMaterials() {
      this.currentPage = 1
    },
    prevPage() {
      if (this.currentPage > 1) this.currentPage--
    },
    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++
    },
    openAddMaterialModal() {
      this.modalAction = 'Add'
      this.modalMaterial = { id: null, name: '', stock: 0 }
      this.isModalVisible = true
    },
    editMaterial(item) {
      this.modalAction = 'Edit'
      this.modalMaterial = { ...item }
      this.isModalVisible = true
    },
    saveMaterial() {
      if (this.modalAction === 'Edit') {
        this.materialsStore.editMaterial(this.modalMaterial)
      } else {
        this.materialsStore.addMaterial(this.modalMaterial)
      }
      this.closeModal()
    },
    openDeleteMaterialModal(item) {
      this.modalMaterial = { ...item }
      this.deleteModalVisible = true
    },
    confirmDeleteMaterial() {
      this.materialsStore.deleteMaterial(this.modalMaterial.id)
      this.closeDeleteModal()
    },

    openUsedMaterialModal(item) {
      this.modalMaterial = { ...item, stock: 0 }
      this.isUsedModalVisible = true
    },
    usedMaterial() {
      this.materialsStore.useMaterial(this.modalMaterial.id, this.modalMaterial.stock)
      this.closeUsedModal()
    },
    closeDeleteModal() {
      this.deleteModalVisible = false
    },
    closeModal() {
      this.isModalVisible = false
      this.resetValidationErrors();
    },
    closeUsedModal() {
      this.isUsedModalVisible = false
    },
    formatQuantity(amount) {
      return `${amount.toLocaleString('en-US')}`
    }
  },
  mounted() {
    this.materialsStore.calculateTotalStock()
  },
}
</script>

<style scoped>
.table-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  border: 1px solid #000000;
  padding: 8px 12px;
  text-align: left;
}

th {
  background-color: #040d1d;
  color: #fff;
  cursor: pointer;
}

.sort-icon {
  font-size: 15px;
  color: #007bff;
}
.sort-icon:hover {
  color: #fff;
}

th.nowrap {
  white-space: nowrap;
}

.th-gap {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

button {
  padding: 5px 10px;
  cursor: pointer;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 3px;
}

button:hover {
  background-color: #ddd;
}
.low-stock {
  color: red;
}

.in-stock {
  color: green;
}

.modal-backdrop {
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

.modal {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 10px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
  animation: fadeIn 0.3s ease-out;
  z-index: 1001;
}

.modal-content h2 {
  margin-bottom: 10px;
  text-align: center;
}

.modal-buttons {
  display: flex;
  justify-content: center;
  gap: 5px;
}

.modal-content label {
  display: block;
  margin-bottom: 8px;
}

.modal-content input {
  width: 100%;
  margin-bottom: 15px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.modal-buttons {
  display: flex;
  justify-content: center;
  gap: 5px;
}

.btn-gap {
  display: flex;
  gap: 5px;
}

.btn-gap button:disabled {
  cursor: not-allowed;
}

.pagination-controls {
  display: flex;
  justify-content: end;
  margin: 0 0 5px 0;
}

.pagination-controls button {
  padding: 4px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 3px;
  margin: 0 5px;
}

.pagination-controls button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.pagination-controls span {
  font-size: 13px;
  display: flex;
  align-items: center;
}

.table-top-container {
  display: flex;
  justify-content: space-between;
}

.search-container {
  margin-bottom: 10px;
  text-align: right;
}

.search-input {
  padding: 2px 10px;
  width: 200px;
  border: 1px solid #ccc;
  border-radius: 3px;
  font-size: 14px;
  box-sizing: border-box;
}

.error {
  color: red;
  font-size: 0.9rem;
  margin-bottom: 10px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@media (max-width: 1700px) {
  .table-top-container {
    min-width: 490px;
    width: 100%;
  }

  table {
    min-width: 490px;
    width: 100%;
    font-size: 14px;
    /* min-height: 308px;
    height: 100%; */
  }

  th,
  td {
    padding: 9px;
  }

  button {
    font-size: 12px;
    padding: 4px 8px;
  }

  .pagination-controls span {
    font-size: 12px;
  }

  .pagination-controls button {
    font-size: 10px;
    padding: 5px;
  }

  .search-input {
    padding: 0 10px;
  }
}
</style>
