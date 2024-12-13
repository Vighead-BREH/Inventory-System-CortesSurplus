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
              <span class="nowrap">Deposit</span>
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

  <!-- Order Details -->
  <div v-if="viewModalVisible" class="modal-backdrop" @click="closeViewModal">
    <div class="modal" @click.stop>
      <div class="modal-content">
        <h2>Order Details</h2>
        <p><strong>Customer:</strong> {{ selectedOrder.customer }} </p>
        <p><strong>Unit Name:</strong> {{ selectedOrder.unitName }} </p>
        <p><strong>Quantity:</strong> {{ selectedOrder.quantity }} </p>
        <p><strong>Accessories: </strong>{{ accessoriesNone }} </p>
        <ul>
          <li v-for="(accessory, index) in selectedOrder.selectedAccessories" :key="index">
            {{ accessory }}
          </li>
        </ul>
        <p><strong>Deposit Amount:</strong> {{ formatPrice(selectedOrder.total) }} </p>
        <p><strong>Unit Price:</strong> {{ formatPrice(selectedOrder.unitPrice) }} </p>
        <p><strong>Total Add Ons:</strong> {{ formatPrice(selectedOrder.unitPriceAddOns) }} </p>
        <p><strong>Total Price:</strong> {{ formatPrice(selectedOrder.totalPrice) }} </p>
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

        <label for="unitName">Unit Name:</label>
        <input
          v-model="modalOrder.unitName"
          id="unitName"
          type="text"
          placeholder="Enter unit name"
          maxlength="20"
          @input="validateField('unitName')"
          @blur="validateField('unitName')"
          required
        />
        <p v-if="unitNameError" class="error">{{ unitNameError }}</p>

        <label for="unitPrice">Unit Price:</label>
        <input
          v-model="modalOrder.unitPrice"
          id="unitPrice"
          type="number"
          placeholder="Enter unit price"
          @input="validateField('unitPrice')"
          @blur="validateField('unitPrice')"
          required
        />
        <p v-if="unitPriceError" class="error">{{ unitPriceError }}</p>

        <label for="quantity">Quantity:</label>
        <input
          v-model="modalOrder.quantity"
          id="quantity"
          type="number"
          placeholder="Enter quantity"
          @input="validateField('quantity')"
          @blur="validateField('quantity')"
          required
        />
        <p v-if="quantityError" class="error">{{ quantityError }}</p>

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
        <select v-model="modalOrder.status" id="status" @change="validateField('status')" @blur="validateField('status')">
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
        <select v-model="modalOrder.paymentMethod" id="paymentMethod" @change="validateField('paymentMethod')" @blur="validateField('paymentMethod')">
          <option value="">Select Payment Method</option>
          <option value="Down Payment">Down Payment</option>
          <option value="Credit Card">Credit Card</option>
          <option value="PayPal">PayPal</option>
          <option value="Bank Transfer">Bank Transfer</option>
          <option value="Debit Card">Debit Card</option>
          <option value="Cash">Cash</option>
        </select>
        <p v-if="paymentError" class="error">{{ paymentError }}</p>

        <div class="accessory-btn">
          <button @click="openAdditionalAccessoriesModal">Add Accessories</button>
        </div>

        <div class="modal-buttons btn-gap">
          <button @click="saveOrder" :disabled="hasValidationErrors">Save</button>
          <button @click="closeModal">Cancel</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Additional Accessories Modal -->
  <div v-if="additionalAccessoriesModalVisible" class="modal-backdrop" @click="closeAdditionalAccessoriesModal">
    <div class="modal" @click.stop>
      <div class="accessories-modal-content">
        <h2>Additional Accessories</h2>
        <p>Please select the accessories you would like to add to your order.</p>

        <div class="accessories-list">
          <div v-for="(accessory, index) in accessories" :key="index" class="accessory-item">
            <input
              type="checkbox"
              :id="'accessory-' + index"
              :value="accessory.value"
              v-model="selectedAccessories"
            />
            <label :for="'accessory-' + index">{{ accessory.text }}</label>
          </div>
        </div>
        <p><strong>Total Add Ons:</strong> {{ totalAddOns.toLocaleString() }} </p>
        <div class="modal-buttons btn-gap">
          <button @click="confirmAdditionalAccessories">Confirm Selection</button>
          <button @click="closeAdditionalAccessoriesModal">Cancel</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Delete Modal -->
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

  <!-- Check Modal -->
  <div v-if="checkModalVisible" class="modal-backdrop" @click="closeCheckModal">
  <div class="modal" @click.stop>
    <div class="modal-content">
      <h2>Order Checked</h2>
      <p><strong>ID:</strong> {{ checkedOrder.id }}</p>
      <p><strong>Customer:</strong> {{ checkedOrder.customer }}</p>
      <p><strong>Date:</strong> {{ checkedOrder.date }}</p>
      <p><strong>Total:</strong> {{ formatPrice(checkedOrder.total) }}</p>
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
  emits: ['orderChecked', 'orderQuantity', 'orderCount'],
  data() {
    return {
      orders: [
        {
          id: 1,
          customer: "John Doe",
          date: "2024-11-01",
          status: "Pending",
          total: 150000,
          paymentMethod: "Down Payment",
          unitName: "Toyota Camry",
          quantity: 1,
          selectedAccessories: [],
          unitPrice: 150000,
          unitPriceAddOns: 0,
          totalPrice: 150000
        },
      ],
      accessories: [
        { value: 'sporty-bumper', text: 'Sporty bumper (P7,000)' },
        { value: 'hood-chrome', text: 'Hood with chrome (P1,500)' },
        { value: 'door-trim-pillar', text: 'Door trim and pillar (P3,000)' },
        { value: 'chrome-side-mirror', text: 'Chrome side mirror with light (P1,400)' },
        { value: 'fender-flare', text: 'Fender flare (P4,500)' },
        { value: 'upgrade-15-inch-mags', text: 'Upgrade to 15 inches mags (P8,000)' },
        { value: 'steel-bumper', text: 'Steel bumper (P4,000)' },
        { value: 'back-step-board', text: 'Back step board (P3,500)' },
        { value: 'headlight-garnish', text: 'Headlight garnish (P1,400)' },
        { value: 'tail-light-garnish', text: 'Tail light garnish (P1,300)' },
        { value: 'wiper-stainless', text: 'Wiper stainless (P600)' },
        { value: 'gastank', text: 'Gastank (P450)' },
        { value: 'back-wiper-cover', text: 'Back wiper cover (P750)' },
        { value: 'side-body-trim', text: 'Side body trim (P1,300)' },
        { value: 'third-brake-light', text: 'Third brake light (P650)' },
        { value: 'ceiling', text: 'Ceiling (P1,500)' },
        { value: 'checkered-stepboard', text: 'Checkered stepboard (P1,600)' },
        { value: 'door-handle', text: 'Door handle (P1,300)' },
        { value: 'led-headlight', text: 'LED headlight (P1,300)' }
      ],
      selectedAccessories: [],
      searchQuery: "",
      currentPage: 1,
      itemsPerPage: 5,
      sortBy: "",
      sortOrder: "asc",
      viewModalVisible: false,
      additionalAccessoriesModalVisible: false,
      isModalVisible: false,
      deleteModalVisible: false,
      checkModalVisible: false,
      checkedOrder: null,
      selectedOrder: null,
      modalTitle: "",
      accessoriesNone: "",
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
      showUnitNameError: false,
      showUnitPriceError: false,
      showQuantityError: false,
      unitNameError: '',
      customerError: '',
      unitPriceError: '',
      quantityError: '',
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
        !this.modalOrder.unitName ||
        this.modalOrder.unitPrice <= 0 ||
        this.modalOrder.quantity <= 0 ||
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
    this.$emit("orderCount", this.orders.length);
    const updatedOrders = this.orders.map(order => {
      order.totalPrice = (order.unitPrice * order.quantity) + order.unitPriceAddOns;

      if (order.total === order.totalPrice) {
        order.status = "Completed";
      }
      return order;
    });

    let filtered = updatedOrders.filter(order => {
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
  totalAddOns() {
    return this.selectedAccessories.reduce((sum, accessoryValue) => {
      return sum + this.getAccessoryPrice(accessoryValue);
    }, 0);
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
    viewOrder(order) {
      this.selectedOrder = order;
      this.viewModalVisible = true;
      this.accessoriesNone = this.selectedOrder.selectedAccessories.length === 0 ? 'None' : '';
    },
    closeViewModal() {
      this.viewModalVisible = false;
    },
    closeDeleteModal() {
      this.deleteModalVisible = false;
    },
    deleteOrder(order) {
      this.selectedOrder = order;
      this.deleteModalVisible = true;
    },
    confirmDelete() {
      this.orders = this.orders.filter((order) => order.id !== this.selectedOrder.id);
      this.closeDeleteModal();
    },
    openAddOrderModal() {
      const validationRules = {
        unitNameError: '',
        showUnitNameError: false,
        unitPriceError: '',
        showUnitPriceError: false,
        quantityError: '',
        showQuantityError: false,
        customerError: '',
        showCustomerError: false,
        dateError: '',
        showDateError: false,
        statusError: '',
        showStatusError: false,
        totalError: '',
        showTotalError: false,
        paymentError: '',
        showPaymentError: false
      };

      Object.entries(validationRules).forEach(([key, value]) => {
        this[key] = value;
      });
      this.modalTitle = "Add New Order";
      this.modalOrder = {
        id: null,
        customer: "",
        unitName: "",
        unitPrice: 0,
        quantity: 0,
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
      this.validateField('unitName');
      this.validateField('unitPrice');
      this.validateField('quantity');
      this.validateField('date');
      this.validateField('status');
      this.validateField('total');
      this.validateField('paymentMethod');

      if (this.showCustomerError || this.showUnitNameError || this.showUnitPriceError || this.showQuantityError || this.showDateError || this.showStatusError || this.showTotalError || this.showPaymentError) {
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

      this.closeModal();
    },
    resetErrorFlags() {
      this.showCustomerError = false;
      this.showUnitNameError = false;
      this.showUnitPriceError = false;
      this.showQuantityError = false;
      this.showDateError = false;
      this.showStatusError = false;
      this.showTotalError = false;
      this.showPaymentError = false;
    },
    validateField(field) {
      const validationRules = {
        customer: {
          validate: () => (!this.modalOrder.customer ? 'Customer name is required.' : ''),
          errorKey: 'customerError',
          showErrorKey: 'showCustomerError',
        },
        unitName: {
          validate: () => (!this.modalOrder.unitName ? 'Unit Name is required.' : ''),
          errorKey: 'unitNameError',
          showErrorKey: 'showUnitNameError',
        },
        unitPrice: {
          validate: () => !this.modalOrder.unitPrice || this.modalOrder.unitPrice <= 0 ? 'Please enter a valid unit price.' : '',
          errorKey: 'unitPriceError',
          showErrorKey: 'showUnitPriceError',
        },
        quantity: {
          validate: () => !this.modalOrder.quantity || this.modalOrder.quantity <= 0 ? 'Please enter a valid quantity.' : '',
          errorKey: 'quantityError',
          showErrorKey: 'showQuantityError',
        },
        date: {
          validate: () => (!this.modalOrder.date ? 'Date is required.' : ''),
          errorKey: 'dateError',
          showErrorKey: 'showDateError',
        },
        status: {
          validate: () => (!this.modalOrder.status ? 'Status is required.' : ''),
          errorKey: 'statusError',
          showErrorKey: 'showStatusError',
        },
        total: {
        validate: () => !this.modalOrder.total || this.modalOrder.total <= 0 ? 'Please enter a valid total.' : '',
          errorKey: 'totalError',
          showErrorKey: 'showTotalError',
        },
        paymentMethod: {
          validate: () => (!this.modalOrder.paymentMethod ? 'Payment Method is required.' : ''),
          errorKey: 'paymentError',
          showErrorKey: 'showPaymentError',
        },
      };

      const rule = validationRules[field];
      if (rule) {
        const errorMessage = rule.validate();
        this[rule.errorKey] = errorMessage;
        this[rule.showErrorKey] = !!errorMessage;
      }
    },

    markAsChecked(order) {
      this.checkedOrder = order;
      this.checkModalVisible = true;
      this.orders = this.orders.filter((o) => o.id !== order.id);
      this.$emit("orderChecked", order.totalPrice);
      this.$emit("orderQuantity", order.quantity);
    },
    closeCheckModal() {
      this.checkModalVisible = false;
    },
    openAdditionalAccessoriesModal() {
      this.selectedAccessories = [...(this.modalOrder.selectedAccessories || [])];
      this.additionalAccessoriesModalVisible = true;
    },
    closeAdditionalAccessoriesModal() {
      this.selectedAccessories = [];
      this.additionalAccessoriesModalVisible = false;
    },
    confirmAdditionalAccessories() {

      const totalAddOns = this.selectedAccessories.reduce((sum, accessoryValue) => {
        return sum + this.getAccessoryPrice(accessoryValue);
      }, 0);

      this.modalOrder.unitPriceAddOns = totalAddOns;
      this.modalOrder.totalPrice = (this.modalOrder.total + totalAddOns) * this.modalOrder.quantity;
      this.modalOrder.selectedAccessories = [...this.selectedAccessories];
      alert(`${this.modalOrder.selectedAccessories.length} accessories have been added to your order for ${this.modalOrder.customer}.`);

      this.closeAdditionalAccessoriesModal();
    },
    getAccessoryPrice(accessoryValue) {
      const accessory = this.accessories.find(acc => acc.value === accessoryValue);
      if (accessory) {
        const priceMatch = accessory.text.match(/\(P(\d+(?:,\d{3})*)\)/);
        if (priceMatch) {
          return parseFloat(priceMatch[1].replace(',', ''));
        }
      }
      return 0;
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

.accessory-item {
  margin-bottom: 2px;
  text-align: left;
  display: flex;
  gap: 10px;
}

.accessory-btn {
  margin-bottom: 10px ;
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

.modal-content p,
ul {
  margin-bottom: 10px;
  text-align: left;
}

.modal-content ul {
  padding-left: 20px;
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
    min-width: 490px;
    width: 100%;
  }

  table {
    min-width: 490px;
    width: 100%;
    font-size: 12px;
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
