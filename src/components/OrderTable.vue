<template>
  <div class="table-container">
    <div class="table-top-container">
      <div class="search-container">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search orders..."
          class="search-input"
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
          <th @click="changeSort('id')">
            <div class="th-gap">
              <span class="nowrap">ID</span>
              <span class="sort-icon">{{ getSortIcon('id') }}</span>
            </div>
          </th>
          <th @click="changeSort('customer')">
            <div class="th-gap">
              <span class="nowrap">Customer</span>
              <span class="sort-icon">{{ getSortIcon('customer') }}</span>
            </div>
          </th>
          <th @click="changeSort('date')">
            <div class="th-gap">
              <span class="nowrap">Date</span>
              <span class="sort-icon">{{ getSortIcon('date') }}</span>
            </div>
          </th>
          <th @click="changeSort('status')">
            <div class="th-gap">
              <span class="nowrap">Status</span>
              <span class="sort-icon">{{ getSortIcon('status') }}</span>
            </div>
          </th>
          <th @click="changeSort('total')">
            <div class="th-gap">
              <span class="nowrap">Total</span>
              <span class="sort-icon">{{ getSortIcon('total') }}</span>
            </div>
          </th>
          <th @click="changeSort('paymentMethod')">
            <div class="th-gap">
              <span class="nowrap">Payment Method</span>
              <span class="sort-icon">{{ getSortIcon('paymentMethod') }}</span>
            </div>
          </th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="order in filteredPaginatedOrders" :key="order.id">
          <td>{{ order.id }}</td>
          <td>{{ order.customer }}</td>
          <td>{{ order.date }}</td>
          <td>{{ order.status }}</td>
          <td>{{ formatPrice(order.total) }}</td>
          <td>{{ order.paymentMethod }}</td>
          <td>
            <div class="btn-gap">
              <button @click="viewOrder(order)"><i class="fas fa-eye"></i></button>
              <button @click="editOrder(order)"><i class="fas fa-edit" style="color: #007bff;"></i></button>
              <button
                v-if="order.status !== 'Completed'"
                @click="deleteOrder(order)">
                <i class="fas fa-trash" style="color: red;"></i>
              </button>

              <button
                v-if="order.status === 'Completed'"
                @click="markAsChecked(order)">
                <i class="fas fa-check" style="color: green;"></i>
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <button @click="openAddOrderModal" style="margin: 5px 0 0 0; color: #007bff;"><i class="fa-solid fa-plus"></i></button>
  </div>

  <div v-if="viewModalVisible" class="modal-backdrop" @click="closeViewModal">
    <div class="modal" @click.stop>
      <div class="modal-content">
        <h2>Order Details</h2>
        <p><strong>ID:</strong> {{ selectedOrder.id }}</p>
        <p><strong>Customer:</strong> {{ selectedOrder.customer }}</p>
        <p><strong>Date:</strong> {{ selectedOrder.date }}</p>
        <p><strong>Status:</strong> {{ selectedOrder.status }}</p>
        <p><strong>Total:</strong> {{ formatPrice(selectedOrder.total).replace('₱', '') }}</p>
        <p><strong>Payment Method:</strong> {{ selectedOrder.paymentMethod }}</p>
        <div class="modal-buttons">
          <button @click="closeViewModal">Close</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Add or Edit Order Modal -->
  <div v-if="isModalVisible" class="modal-backdrop" @click="closeModal">
    <div class="modal" @click.stop>
      <div class="modal-content">
        <h2>{{ modalTitle }}</h2>

        <label for="customer">Customer:</label>
        <input
          v-model="modalOrder.customer"
          id="customer"
          type="text"
          placeholder="Enter customer name"
          maxlength="20"
          @input="validateField('customer')"
          @blur="validateField('customer')"
        />
        <p v-if="customerError" class="error">{{ customerError }}</p>

        <label for="date">Date:</label>
        <input
          v-model="modalOrder.date"
          id="date"
          type="date"
          placeholder="Enter date"
          @input="validateField('date')"
          @blur="validateField('date')"
        />
        <p v-if="dateError" class="error">{{ dateError }}</p>

        <label for="status">Status:</label>
        <select v-model="modalOrder.status" id="status" @input="validateField('status')" @blur="validateField('status')">
          <option value="">Select Status</option>
          <option value="Pending">Pending</option>
          <option value="Shipped">Shipped</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Processing">Processing</option>
        </select>
        <p v-if="statusError" class="error">{{ statusError }}</p>

        <label for="total">Total:</label>
        <input
          v-model="modalOrder.total"
          id="total"
          type="number"
          placeholder="Enter total"
          @input="validateField('total')"
          @blur="validateField('total')"
        />
        <p v-if="totalError" class="error">{{ totalError }}</p>

        <label for="paymentMethod">Payment Method:</label>
        <select v-model="modalOrder.paymentMethod" id="paymentMethod" @input="validateField('paymentMethod')" @blur="validateField('paymentMethod')">
          <option value="">Select Payment Method</option>
          <option value="Down Payment">Down Payment</option>
          <option value="Credit Card">Credit Card</option>
          <option value="PayPal">PayPal</option>
          <option value="Bank Transfer">Bank Transfer</option>
          <option value="Debit Card">Debit Card</option>
          <option value="Cash">Cash</option>
        </select>
        <p v-if="paymentError" class="error">{{ paymentError }}</p>

        <div class="modal-buttons btn-gap">
          <button @click="saveOrder" :disabled="hasValidationErrors">Save</button>
          <button @click="closeModal">Cancel</button>
        </div>
      </div>
    </div>
  </div>

  <div v-if="deleteModalVisible" class="modal-backdrop" @click="closeDeleteModal">
    <div class="modal" @click.stop>
      <div class="modal-content">
        <h2>Are you sure you want to delete this order?</h2>
        <div class="modal-buttons btn-gap">
          <button @click="confirmDelete">Yes</button>
          <button @click="closeDeleteModal">No</button>
        </div>
      </div>
    </div>
  </div>

  <div v-if="checkModalVisible" class="modal-backdrop" @click="closeCheckModal">
  <div class="modal" @click.stop>
    <div class="modal-content">
      <h2>Order Checked</h2>
      <p><strong>ID:</strong> {{ checkedOrder.id }}</p>
      <p><strong>Customer:</strong> {{ checkedOrder.customer }}</p>
      <p><strong>Date:</strong> {{ checkedOrder.date }}</p>
      <p><strong>Total:</strong> {{ formatPrice(checkedOrder.total).replace('₱', '') }}</p>
      <p>This order is now marked as checked.</p>
      <div class="modal-buttons btn-gap">
        <button @click="closeCheckModal">Close</button>
      </div>
    </div>
  </div>
</div>
</template>

<script>
export default {
  name: "OrderTable",
  emits: ['orderChecked'],
  data() {
    return {
      orders: [
        {
          id: 1,
          customer: "John Doe",
          date: "2024-11-01",
          status: "Pending",
          total: 500,
          paymentMethod: "Down Payment",
        },
        {
          id: 2,
          customer: "Jane Smith",
          date: "2024-11-02",
          status: "Shipped",
          total: 200,
          paymentMethod: "PayPal",
        },
        {
          id: 3,
          customer: "Alice Johnson",
          date: "2024-11-05",
          status: "Completed",
          total: 1000,
          paymentMethod: "Bank Transfer",
        },
        {
          id: 4,
          customer: "Bob Brown",
          date: "2024-11-06",
          status: "Cancelled",
          total: 150,
          paymentMethod: "Debit Card",
        },
        {
          id: 5,
          customer: "Eve Adams",
          date: "2024-11-07",
          status: "Pending",
          total: 300,
          paymentMethod: "Cash",
        },
        {
          id: 6,
          customer: "Charlie White",
          date: "2024-11-08",
          status: "Shipped",
          total: 700,
          paymentMethod: "PayPal",
        },
        {
          id: 7,
          customer: "Grace Green",
          date: "2024-11-09",
          status: "Processing",
          total: 450,
          paymentMethod: "Credit Card",
        },
        {
          id: 8,
          customer: "Hank Blue",
          date: "2024-11-10",
          status: "Completed",
          total: 600,
          paymentMethod: "Bank Transfer",
        },
        {
          id: 9,
          customer: "Ivy Red",
          date: "2024-11-11",
          status: "Cancelled",
          total: 120,
          paymentMethod: "Cash",
        },
        {
          id: 10,
          customer: "Jack Black",
          date: "2024-11-12",
          status: "Processing",
          total: 800,
          paymentMethod: "Debit Card",
        },
      ],
      searchQuery: "",
      currentPage: 1,
      itemsPerPage: 5,
      sortBy: "",
      sortOrder: "asc",
      viewModalVisible: false,
      isModalVisible: false,
      deleteModalVisible: false,
      checkModalVisible: false,
      checkedOrder: null,
      selectedOrder: null,
      modalTitle: "",
      modalOrder: {
        id: null,
        customer: "",
        date: "",
        status: "",
        total: 0,
        paymentMethod: "",
      },
      showCustomerError: false,
      showDateError: false,
      showStatusError: false,
      showTotalError: false,
      showPaymentError: false,
      customerError: '',
      dateError: '',
      statusError: '',
      totalError: '',
      paymentError: '',
    };
  },
  computed: {
    hasValidationErrors() {
      return (
        !this.modalOrder.customer ||
        this.modalOrder.customer.length === 0 ||
        this.modalOrder.date.length === 0 ||
        this.modalOrder.status.length === 0 ||
        this.modalOrder.total <= 0 ||
        isNaN(this.modalOrder.total) ||
        this.modalOrder.paymentMethod.length === 0
      );
    },
    totalPages() {
    return Math.ceil(this.filteredOrders.length / this.itemsPerPage);
  },
  filteredOrders() {
    let filtered = this.orders.filter((order) => {
      return (
        order.customer.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        order.date.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        order.status.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        order.paymentMethod.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    });

    if (this.sortBy) {
      filtered.sort((a, b) => {
        const factor = this.sortOrder === "asc" ? 1 : -1;
        if (typeof a[this.sortBy] === "string") {
          return factor * a[this.sortBy].localeCompare(b[this.sortBy]);
        } else {
          return factor * (a[this.sortBy] - b[this.sortBy]);
        }
      });
    }

    return filtered;
  },
  filteredPaginatedOrders() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredOrders.slice(start, end);
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
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    formatPrice(value) {
      if (typeof value !== 'number') return '₱0';
      return `₱${value.toLocaleString('en-US')}`;
    },
    viewOrder(order) {
      this.selectedOrder = order;
      this.viewModalVisible = true;
    },
    closeViewModal() {
      this.viewModalVisible = false;
    },
    deleteOrder(order) {
      this.selectedOrder = order;
      this.deleteModalVisible = true;
    },
    closeDeleteModal() {
      this.deleteModalVisible = false;
    },
    confirmDelete() {
      this.orders = this.orders.filter((order) => order.id !== this.selectedOrder.id);
      this.closeDeleteModal();
    },
    openAddOrderModal() {
      this.modalTitle = "Add New Order";
      this.modalOrder = {
        id: null,
        customer: "",
        date: "",
        status: "",
        total: 0,
        paymentMethod: "",
      };
      this.isModalVisible = true;
    },
    editOrder(order) {
      this.modalTitle = "Edit Order";
      this.modalOrder = { ...order };
      this.isModalVisible = true;
      this.resetErrorFlags();
    },
    saveOrder() {
      this.validateField('customer');
      this.validateField('date');
      this.validateField('status');
      this.validateField('total');
      this.validateField('paymentMethod');

      if (this.showCustomerError || this.showDateError || this.showStatusError || this.showTotalError || this.showPaymentError) {
        return;
      }

      const index = this.orders.findIndex((order) => order.id === this.modalOrder.id);
      if (index !== -1) {
        this.orders.splice(index, 1, { ...this.modalOrder });
      } else {
        const newId = this.orders.length
          ? Math.max(...this.orders.map((order) => order.id)) + 1
          : 1;
        this.orders.push({ ...this.modalOrder, id: newId });
      }
      this.closeModal()
    },
    resetErrorFlags() {
      this.showCustomerError = false;
      this.showDateError = false;
      this.showStatusError = false;
      this.showTotalError = false;
      this.showPaymentError = false;
    },
    validateField(field) {
      if (field === 'customer') {
        if (!this.modalOrder.customer) {
          this.showCustomerError = true;
          this.customerError = 'Customer name is required.';
        } else if (this.modalOrder.customer.length > 20) {
          this.showCustomerError = true;
          this.customerError = 'Customer name exceeds the maximum limit (20 characters).';
        } else {
          this.showCustomerError = false;
          this.customerError = '';
        }
      } else if (field === 'date') {
        if (!this.modalOrder.date) {
          this.showDateError = true;
          this.dateError = 'Date is required.';
        } else {
          this.showDateError = false;
          this.dateError = '';
        }
      } else if (field === 'status') {
        if (!this.modalOrder.status) {
          this.showStatusError = true;
          this.statusError = 'Status is required.';
        } else {
          this.showStatusError = false;
          this.statusError = '';
        }
      } else if (field === 'total') {
        if (!this.modalOrder.total || this.modalOrder.total <= 0) {
          this.showTotalError = true;
          this.totalError = 'Please enter a valid total.';
        } else {
          this.showTotalError = false;
          this.totalError = '';
        }
      } else if (field === 'paymentMethod') {
        if (!this.modalOrder.paymentMethod) {
          this.showPaymentError = true;
          this.paymentError = 'Payment Method is required.';
        } else {
          this.showPaymentError = false;
          this.paymentError = '';
        }
      }
    },
    closeModal() {
      this.isModalVisible = false;
      this.modalOrder = {
        id: null,
        customer: "",
        date: "",
        status: "",
        total: 0,
        paymentMethod: "",
      };
      this.resetErrorFlags();
    },
    markAsChecked(order) {
      this.checkedOrder = order;
      this.checkModalVisible = true;
      this.orders = this.orders.filter((o) => o.id !== order.id);
      this.$emit("orderChecked", order.total);
    },
    closeCheckModal() {
      this.checkModalVisible = false;
    },

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


.table-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
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

.pagination-controls {
  display: flex;
  justify-content: flex-end;
  margin: 0 0 10px 0;
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
  font-size: 14px;
  display: flex;
  align-items: center;
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

.modal-content p,
h2 {
  margin-bottom: 10px;
  text-align: center;
}

.modal-buttons {
  display: flex;
  justify-content: center;
}

.modal-content label {
  display: block;
  margin-bottom: 8px;
}

.modal-content input, select {
  width: 100%;
  margin-bottom: 15px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.table-top-container {
  display: flex;
  justify-content: space-between;
}

.sort-icon {
  font-size: 12px;
  color: #007bff;
}
.sort-icon:hover {
  color: #fff;
}

.btn-gap {
  display: flex;
  gap: 5px;
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
    min-width: 474px;
    width: 100%;
  }

  table {
    width: 100%;
    font-size: 12px;
    height: 300px;
  }

  th,
  td {
    padding: 5px;
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
