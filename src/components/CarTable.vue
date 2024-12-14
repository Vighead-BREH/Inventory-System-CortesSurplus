<template>
  <div class="table-container">
    <div class="table-top-container">
      <div class="search-container">
        <input
          v-model="carStore.searchQuery"
          type="text"
          placeholder="Search cars..."
          class="search-input"
        />
      </div>
      <div class="pagination-controls">
        <button :disabled="carStore.currentPage <= 1" @click="prevPage">Prev</button>
        <span>Page {{ carStore.currentPage }} / {{ totalPages }}</span>
        <button :disabled="carStore.currentPage >= totalPages" @click="nextPage">Next</button>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th @click="changeSort('id')">
            <div class="th-gap">
              <span class="nowrap">ID</span>
              <span class="sort-icon">{{ getSortIcon('id') }}</span>
            </div>
          </th>
          <th @click="changeSort('unitName')">
            <div class="th-gap">
              <span class="nowrap">Unit Name</span>
              <span class="sort-icon">{{ getSortIcon('unitName') }}</span>
            </div>
          </th>
          <th @click="changeSort('quantity')">
            <div class="th-gap">
              <span class="nowrap">Quantity</span>
              <span class="sort-icon">{{ getSortIcon('quantity') }}</span>
            </div>
          </th>
          <th @click="changeSort('price')">
            <div class="th-gap">
              <span class="nowrap">Price</span>
              <span class="sort-icon">{{ getSortIcon('price') }}</span>
            </div>
          </th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="car in paginatedSortedCars" :key="car.id">
          <td>{{ car.id }}</td>
          <td>{{ car.unitName }}</td>
          <td>
            <div class="quantity-indicator">
              {{ formatQuantity(car.quantity) }}
              <span
                class="led"
                :class="{ green: car.quantity > 0, red: car.quantity === 0 }"
              ></span>
            </div>
          </td>
          <td>{{ formatPrice(car.price) }}</td>
          <td>
            <div class="btn-gap">
              <button @click="editCar(car)"><i class="fas fa-edit" style="color: #007bff;"></i></button>
              <button @click="openDeleteCarModal(car)"><i class="fas fa-trash" style="color: red;"></i></button>
              <button @click="openSoldCarModal(car)"><i class="fa-solid fa-check" style="color: green;"></i></button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <button @click="openAddCarModal" style="margin: 5px 0 0 0; color: #007bff;">
      <i class="fa-solid fa-plus"></i>
    </button>
  </div>

  <!-- Add or Edit Car Modal -->
  <div v-if="carStore.isModalVisible" class="modal-backdrop" @click="closeModal">
    <div class="modal" @click.stop>
      <div class="modal-content">
        <h2>{{ carStore.modalTitle }}</h2>

        <!-- Unit Name -->
        <label for="unitName">Unit Name:</label>
        <input
          v-model="carStore.modalCar.unitName"
          id="unitName"
          type="text"
          placeholder="Enter unit name"
          maxlength="20"
          @input="validateField('unitName')"
          @blur="validateField('unitName')"
        />
        <p v-if="carStore.showUnitNameError" class="error">{{ carStore.validationErrors.unitName }}</p>

        <!-- Quantity -->
        <label for="quantity">Quantity:</label>
        <input
          v-model="carStore.modalCar.quantity"
          id="quantity"
          type="number"
          placeholder="Enter quantity"
          @input="validateField('quantity')"
          @blur="validateField('quantity')"
        />
        <p v-if="carStore.showQuantityError" class="error">{{ carStore.validationErrors.quantity }}</p>

        <!-- Price -->
        <label for="price">Price:</label>
        <input
          v-model="carStore.modalCar.price"
          id="price"
          type="number"
          placeholder="Enter price"
          @input="validateField('price')"
          @blur="validateField('price')"
        />
        <p v-if="carStore.showPriceError" class="error">{{ carStore.validationErrors.price }}</p>

        <div class="modal-buttons btn-gap">
          <button @click="saveCar" :disabled="hasValidationErrors">Save</button>
          <button @click="closeModal">Cancel</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Sold Car Modal -->
  <div v-if="carStore.isSoldModalVisible" class="modal-backdrop" @click="closeSoldModal">
    <div class="modal" @click.stop>
      <div class="modal-content">
        <h2>Mark Car as Sold</h2>
        <p>Are you sure you want to mark this car as sold?</p>
        <p><strong>{{ carStore.soldCar.unitName }}</strong></p>

        <label for="soldQuantity">Quantity Sold:</label>
        <input
          v-model="carStore.soldCar.soldQuantity"
          id="soldQuantity"
          type="number"
          placeholder="Enter quantity sold"
          @input="validateField('soldQuantity')"
          @blur="validateField('soldQuantity')"
        />
        <p v-if="carStore.soldCar.soldQuantity > carStore.soldCar.quantity" class="error">Not enough stock.</p>
        <p v-if="carStore.soldCar.soldQuantity < 0" class="error">Please input a valid number.</p>

        <label for="customer">Customer:</label>
        <input
          v-model="carStore.soldCar.customer"
          id="customer"
          type="text"
          placeholder="Enter customer name"
          maxlength="20"
          required
          @input="validateField('customer')"
          @blur="validateField('customer')"
        />
        <p v-if="carStore.showCustomerError" class="error">{{ carStore.validationErrors.customer }}</p>

        <p>Price per unit: {{ formatPrice(carStore.soldCar.price) }}</p>
        <p v-if="carStore.soldCar.soldQuantity > 0">
          Total Price: {{ formatPrice(carStore.soldCar.soldQuantity * carStore.soldCar.price) }}
        </p>
        <p v-else>Total Price: {{ formatPrice(0) }}</p>

        <div class="modal-buttons btn-gap">
          <button @click="markAsSold" :disabled="hasValidationErrors">Yes</button>
          <button @click="closeSoldModal">Cancel</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Delete Car Modal -->
  <div v-if="carStore.isDeleteModalVisible" class="modal-backdrop" @click="closeDeleteModal">
    <div class="modal" @click.stop>
      <div class="modal-content">
        <h2>Are you sure you want to delete this car?</h2>
        <div class="modal-buttons btn-gap">
          <button @click="deleteCar(carStore.carToDelete.id)">Yes</button>
          <button @click="closeDeleteModal">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useCarStore } from '@/stores/carStore';

export default {
  name: 'CarTable',
  setup() {
    const carStore = useCarStore();

    return {
      carStore,
    };
  },
  computed: {
    filteredCars() {
      return this.carStore.filteredCars;
    },
    totalPages() {
      return this.carStore.totalPages;
    },
    paginatedSortedCars() {
      return this.carStore.paginatedSortedCars;
    },
    hasValidationErrors() {
      return Object.values(this.carStore.validationErrors).some((error) => error !== '');
    },
    isSoldCarValid() {
      return this.carStore.soldCar.soldQuantity > 0 && this.carStore.soldCar.soldQuantity <= this.carStore.soldCar.quantity;
    },
    isSoldCarCustomerValid() {
      return this.carStore.soldCar.customer.length > 0;
    },
  },
  methods: {
    changeSort(column) {
      this.carStore.changeSort(column);
    },
    getSortIcon(column) {
      if (this.carStore.sortBy === column) {
        return this.carStore.sortOrder === 'asc' ? '⬆' : '⬇';
      }
      return '⬍';
    },
    formatPrice(value) {
      return this.carStore.formatPrice(value);
    },
    nextPage() {
      this.carStore.nextPage();
    },
    prevPage() {
      this.carStore.prevPage();
    },
    openAddCarModal() {
      this.carStore.openAddCarModal();
    },
    editCar(car) {
      this.carStore.editCar(car);
    },
    closeModal() {
      this.carStore.closeModal();
    },
    deleteCar(id) {
      this.carStore.deleteCar(id);
    },
    openDeleteCarModal(car) {
      this.carStore.openDeleteCarModal(car);
    },
    closeDeleteModal() {
      this.carStore.closeDeleteModal();
    },
    openSoldCarModal(car) {
      this.carStore.openSoldCarModal(car);
    },
    closeSoldModal() {
      this.carStore.closeSoldModal();
    },
    markAsSold() {
      this.carStore.markAsSold();
    },
    saveCar() {
      this.carStore.saveCar();
    },
    validateField(field) {
      this.carStore.validateField(field);
    },
     formatQuantity(amount) {
      return `${amount.toLocaleString('en-US')}`
    }
  },
};
</script>

<style scoped>
.error {
  color: red;
  font-size: 0.9rem;
  margin-bottom: 10px;
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

th.nowrap {
  white-space: nowrap;
}

.th-gap {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

th {
  background-color: #040d1d;
  color: #fff;
  cursor: pointer;
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

.btn-gap {
  display: flex;
  gap: 5px;
}

.btn-gap button:disabled {
  cursor: not-allowed;
}

h2 {
  margin-bottom: 20px;
}

.table-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
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

.quantity-indicator {
  display: flex;
  justify-content: space-between;
}

.led {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 8px;
  background-color: gray;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
  transition: background-color 0.3s ease;
}

.led.red {
  background-color: red;
}

.led.green {
  background-color: green;
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

.sort-icon {
  font-size: 12px;
  color: #007bff;
}
.sort-icon:hover {
  color: #fff;
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
    /* min-height: 274px;
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
