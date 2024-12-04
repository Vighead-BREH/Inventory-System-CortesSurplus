<template>
  <div class="table-container">
    <div class="pagination-controls">
      <button :disabled="currentPage <= 1" @click="prevPage">Prev</button>
      <span>Page {{ currentPage }} / {{ totalPages }}</span>
      <button :disabled="currentPage >= totalPages" @click="nextPage">Next</button>
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
              {{ car.quantity }}
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
    <button @click="openAddCarModal" style="margin: 5px 0 0 0; color: #007bff;"><i class="fa-solid fa-plus"></i></button>
  </div>

  <!-- Add Car Modal -->
  <div v-if="isModalVisible" class="modal-backdrop" @click="closeModal">
    <div class="modal" @click.stop>
      <div class="modal-content">
        <h2>{{ modalTitle }}</h2>
        <label for="unitName">Unit Name:</label>
        <input
          v-model="modalCar.unitName"
          id="unitName"
          type="text"
          placeholder="Enter unit name"
          maxlength="20"
        />
        <p v-if="this.unitNameError = this.modalCar.unitName.trim() === ''" class="error">Unit Name is required.</p>
        <p v-if="this.modalCar.unitName.length > 20" class="error">Unit Name is exceeding the limit.</p>
        <label for="quantity">Quantity:</label>
        <input
          v-model="modalCar.quantity"
          id="quantity"
          type="number"
          placeholder="Enter quantity"
        />
        <p v-if="this.quantityError = this.modalCar.quantity <= 0 || isNaN(this.modalCar.quantity)" class="error">Please enter a valid quantity</p>

        <label for="price">Price:</label>
        <input
          v-model="modalCar.price"
          id="price"
          type="number"
          placeholder="Enter price"
        />
        <p v-if="this.priceError = this.modalCar.price <= 0 || isNaN(this.modalCar.price)" class="error">Please enter a valid price</p>

        <div class="modal-buttons btn-gap">
          <button @click="saveCar" :disabled="hasValidationErrors">Save</button>
          <button @click="closeModal">Cancel</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Sold Car Modal -->
  <div v-if="isSoldModalVisible" class="modal-backdrop" @click="closeSoldModal">
    <div class="modal" @click.stop>
      <div class="modal-content">
        <h2>Mark Car as Sold</h2>
        <p>Are you sure you want to mark this car as sold?</p>
        <p>
          <strong>{{ soldCar.unitName }}</strong>
        </p>
        <label for="soldQuantity">Quantity Sold:</label>
        <input
          v-model="soldCar.soldQuantity"
          id="soldQuantity"
          type="number"
          placeholder="Enter quantity sold"
        />
        <p v-if="soldCar.soldQuantity > soldCar.quantity" class="error">Not enough stock.</p>
        <p v-if="soldCar.soldQuantity < 0" class="error">Please input a valid number.</p>
        <p>Price per unit: {{ formatPrice(soldCar.price) }}</p>
        <p v-if="soldCar.soldQuantity > 0">
          Total Price: {{ formatPrice(soldCar.soldQuantity * soldCar.price) }}
        </p>
        <p v-else>Total Price: {{ formatPrice(0) }}</p>
        <div>
          <div class="modal-buttons btn-gap">
            <button @click="markAsSold" :disabled="!isSoldCarValid">Yes</button>
            <button @click="closeSoldModal">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-if="isDeleteModalVisible" class="modal-backdrop" @click="closeDeleteModal">
    <div class="modal" @click.stop>
      <div class="modal-content">
        <h2>Are you sure you want to delete this car?</h2>
        <div class="modal-buttons btn-gap">
          <button @click="deleteCar(carToDelete.id)">Yes</button>
          <button @click="closeDeleteModal">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CarTable',
  emits: ['car-sold'],
  data() {
    return {
      cars: [
        { id: 1, unitName: 'Toyota Corolla', quantity: 5, price: 1500000 },
        { id: 2, unitName: 'Honda Accord', quantity: 3, price: 1800000 },
        { id: 3, unitName: 'Ford Ranger', quantity: 7, price: 2500000 },
        { id: 4, unitName: 'Chevrolet Spark', quantity: 2, price: 900000 },
        { id: 5, unitName: 'Tesla Model S', quantity: 1, price: 7500000 },
        { id: 6, unitName: 'Nissan Altima', quantity: 4, price: 2000000 },
        { id: 7, unitName: 'BMW 3 Series', quantity: 6, price: 3200000 },
        { id: 8, unitName: 'Audi Q5', quantity: 8, price: 4000000 },
        { id: 9, unitName: 'Mercedes-Benz C-Class', quantity: 3, price: 3800000 },
        { id: 10, unitName: 'Kia Sportage', quantity: 5, price: 1800000 },
      ],
      currentPage: 1,
      itemsPerPage: 5,
      sortBy: '',
      sortOrder: 'asc',
      isModalVisible: false,
      isSoldModalVisible: false,
      isDeleteModalVisible: false,
      carToDelete: null,
      modalTitle: '',
      modalCar: {
        id: null,
        unitName: '',
        quantity: 0,
        price: 0,
      },
      soldCar: {
        id: null,
        unitName: '',
        quantity: 0,
        soldQuantity: 0,
        price: 0,
      },
      unitNameError: '',
      quantityError: '',
      priceError: '',
    }
  },
  computed: {
    hasValidationErrors() {
      return !this.modalCar.unitName ||
      this.modalCar.unitName.length === 0 ||
      this.modalCar.quantity <= 0 ||
      isNaN(this.modalCar.quantity) ||
      this.modalCar.price <= 0 ||
      isNaN(this.modalCar.price) ||
      this.modalCar.unitName.length > 20;
    },
    isSoldCarValid() {
      return this.soldCar.soldQuantity > 0 && this.soldCar.soldQuantity <= this.soldCar.quantity;
    },
    totalPages() {
      return Math.ceil(this.cars.length / this.itemsPerPage)
    },
    sortedCars() {
      return [...this.cars].sort((a, b) => {
        const factor = this.sortOrder === 'asc' ? 1 : -1
        if (typeof a[this.sortBy] === 'string') {
          return factor * a[this.sortBy].localeCompare(b[this.sortBy])
        } else {
          return factor * (a[this.sortBy] - b[this.sortBy])
        }
      })
    },
    paginatedSortedCars() {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage
      return this.sortedCars.slice(startIndex, startIndex + this.itemsPerPage)
    },
  },
  methods: {
    changeSort(column) {
      if (this.sortBy === column) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
      } else {
        this.sortBy = column
        this.sortOrder = 'asc'
      }
    },
    getSortIcon(column) {
      if (this.sortBy === column) {
        return this.sortOrder === 'asc' ? '⬆' : '⬇'
      }
      return '⬍'
    },
    formatPrice(value) {
      if (typeof value !== 'number') return '₱0'
      return `₱${value.toLocaleString('en-US')}`
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--
      }
    },
    openAddCarModal() {
      this.modalTitle = 'Add New Car'
      this.modalCar = { id: null, unitName: '', quantity: 0, price: 0 }
      this.isModalVisible = true
    },
    editCar(car) {
      this.modalTitle = 'Edit Car'
      this.modalCar = { ...car }
      this.isModalVisible = true
    },
    closeModal() {
      this.isModalVisible = false
      this.modalCar = { id: null, unitName: '', quantity: 0, price: 0 }
    },
    deleteCar(id) {
      this.cars = this.cars.filter((car) => car.id !== id)
      this.closeDeleteModal()
    },
    openDeleteCarModal(car) {
      this.carToDelete = { ...car }
      this.isDeleteModalVisible = true
    },
    closeDeleteModal() {
      this.isDeleteModalVisible = false
    },
    openSoldCarModal(car) {
      this.soldCar = { ...car, soldQuantity: 0 }
      this.isSoldModalVisible = true
    },
    closeSoldModal() {
      this.isSoldModalVisible = false
    },
    markAsSold() {
      if (this.soldCar.soldQuantity > 0) {
        const car = this.cars.find((c) => c.id === this.soldCar.id);
        if (car) {
          const totalPrice = this.soldCar.soldQuantity * car.price;
          if (car.quantity >= this.soldCar.soldQuantity) {
            car.quantity -= this.soldCar.soldQuantity;
            this.$emit("car-sold", totalPrice);
            this.closeSoldModal();
          }
        }
      }
    },
    saveCar() {
      if (!this.hasValidationErrors || this.unitNameError) {
        const index = this.cars.findIndex((car) => car.id === this.modalCar.id);
        if (index !== -1) {
          this.cars.splice(index, 1, { ...this.modalCar });
        } else {
          const newId = Math.max(...this.cars.map((car) => car.id)) + 1;
          this.cars.push({ ...this.modalCar, id: newId });
        }
        this.closeModal();
      }
    },
  },
}
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

.btn-gap button:disabled {
  cursor: not-allowed;
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
  justify-content: space-around;
  gap: 5px;
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
  table {
    width: 100%;
    font-size: 12px;
    height: 250px;
  }

  th,
  td {
    padding: 5px;
  }

  button {
    font-size: 12px;
    padding: 4px 8px;
  }

  .pagination-controls{
    min-width: 361px;
  }

  .pagination-controls button {
    font-size: 10px;
    padding: 5px;
  }
}
</style>
