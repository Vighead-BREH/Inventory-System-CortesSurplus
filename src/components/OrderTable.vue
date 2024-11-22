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
            <th>ID</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Status</th>
            <th>Total</th>
            <th>Payment Method</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in filteredPaginatedOrders" :key="order.id">
            <td>{{ order.id }}</td>
            <td>{{ order.customer }}</td>
            <td>{{ order.date }}</td>
            <td>{{ order.status }}</td>
            <td>{{ formatPrice(order.total).replace("₱", "") }}</td>
            <td>{{ order.paymentMethod }}</td>
            <td>
              <button @click="viewOrder(order)">View</button>
              <button @click="editOrder(order)">Edit</button>
              <button @click="deleteOrder(order)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
      <button @click="openAddOrderModal">Add Order</button>
    </div>

    <div v-if="viewModalVisible" class="modal-backdrop" @click="closeViewModal">
      <div class="modal" @click.stop>
        <div class="modal-content">
          <h2>Order Details</h2>
          <p><strong>ID:</strong> {{ selectedOrder.id }}</p>
          <p><strong>Customer:</strong> {{ selectedOrder.customer }}</p>
          <p><strong>Date:</strong> {{ selectedOrder.date }}</p>
          <p><strong>Status:</strong> {{ selectedOrder.status }}</p>
          <p><strong>Total:</strong> {{ formatPrice(selectedOrder.total).replace("₱", "") }}</p>
          <p><strong>Payment Method:</strong> {{ selectedOrder.paymentMethod }}</p>
          <div class="modal-buttons">
            <button @click="closeViewModal">Close</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isModalVisible" class="modal-backdrop" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-content">
          <h2>{{ modalTitle }}</h2>
          <label for="customer">Customer:</label>
          <input v-model="modalOrder.customer" id="customer" type="text" placeholder="Enter customer name" />
          <label for="date">Date:</label>
          <input v-model="modalOrder.date" id="date" type="date" placeholder="Enter date" />
          <label for="status">Status:</label>
          <select v-model="modalOrder.status" id="status">
            <option value="Pending">Pending</option>
            <option value="Shipped">Shipped</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Processing">Processing</option>
          </select>
          <label for="total">Total:</label>
          <input v-model="modalOrder.total" id="total" type="number" placeholder="Enter total" />
          <label for="paymentMethod">Payment Method:</label>
          <select v-model="modalOrder.paymentMethod" id="paymentMethod">
            <option value="Down Payment">Down Payment</option>
            <option value="Credit Card">Credit Card</option>
            <option value="PayPal">PayPal</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Debit Card">Debit Card</option>
            <option value="Cash">Cash</option>
          </select>
          <div class="modal-buttons">
            <button @click="saveOrder">Save</button>
            <button @click="closeModal">Cancel</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="deleteModalVisible" class="modal-backdrop" @click="closeDeleteModal">
      <div class="modal" @click.stop>
        <div class="modal-content">
          <h2>Are you sure you want to delete this order?</h2>
          <div class="modal-buttons">
            <button @click="confirmDelete">Yes</button>
            <button @click="closeDeleteModal">No</button>
          </div>
        </div>
      </div>
    </div>

</template>

<script>
export default {
  name: "OrderTable",
  data() {
    return {
      orders: [
        { id: 1, customer: "John Doe", date: "2024-11-01", status: "Pending", total: 500, paymentMethod: "Down Payment" },
        { id: 2, customer: "Jane Smith", date: "2024-11-02", status: "Shipped", total: 200, paymentMethod: "PayPal" },
        { id: 3, customer: "Alice Johnson", date: "2024-11-05", status: "Completed", total: 1000, paymentMethod: "Bank Transfer" },
        { id: 4, customer: "Bob Brown", date: "2024-11-06", status: "Cancelled", total: 150, paymentMethod: "Debit Card" },
        { id: 5, customer: "Eve Adams", date: "2024-11-07", status: "Pending", total: 300, paymentMethod: "Cash" },
        { id: 6, customer: "Charlie White", date: "2024-11-08", status: "Shipped", total: 700, paymentMethod: "PayPal" },
        { id: 7, customer: "Grace Green", date: "2024-11-09", status: "Processing", total: 450, paymentMethod: "Credit Card" },
        { id: 8, customer: "Hank Blue", date: "2024-11-10", status: "Completed", total: 600, paymentMethod: "Bank Transfer" },
        { id: 9, customer: "Ivy Red", date: "2024-11-11", status: "Cancelled", total: 120, paymentMethod: "Cash" },
        { id: 10, customer: "Jack Black", date: "2024-11-12", status: "Processing", total: 800, paymentMethod: "Debit Card" },
      ],
      searchQuery: "",
      currentPage: 1,
      itemsPerPage: 5,
      viewModalVisible: false,
      isModalVisible: false,
      deleteModalVisible: false,
      selectedOrder: null,
      modalTitle: "",
      modalOrder: {
         id: null,
          customer: "",
          date: "",
          status: "",
          total: 0,
          paymentMethod: ""
        },
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.filteredOrders.length / this.itemsPerPage);
    },
    filteredOrders() {
      return this.orders.filter(order => {
        return (
          order.customer.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          order.date.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          order.status.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          order.paymentMethod.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      });
    },
    filteredPaginatedOrders() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredOrders.slice(start, end);
    },
  },
  methods: {
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
      return `₱${value.toLocaleString("en-US")}`;
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
      this.orders = this.orders.filter(order => order.id !== this.selectedOrder.id);
      this.closeDeleteModal();
    },
    openAddOrderModal() {
      this.modalTitle = "Add New Order";
      this.modalOrder = { id: null, customer: "", date: "", status: "", total: 0, paymentMethod: "" };
      this.isModalVisible = true;
    },
    editOrder(order) {
      this.modalTitle = "Edit Order";
      this.modalOrder = { ...order };
      this.isModalVisible = true;
    },
    saveOrder() {
      if (this.modalOrder.id) {
        // Edit existing order
        const index = this.orders.findIndex(order => order.id === this.modalOrder.id);
        if (index !== -1) {
          this.orders.splice(index, 1, { ...this.modalOrder });
        }
      } else {
        // Add a new order
        const newId = this.orders.length ? Math.max(...this.orders.map(order => order.id)) + 1 : 1;
        this.orders.push({ ...this.modalOrder, id: newId });
      }
      this.closeModal();
    },
    closeModal() {
      this.isModalVisible = false;
      this.modalOrder = { id: null, customer: "", date: "", status: "", total: 0, paymentMethod: "" };
    },
  },
};
</script>

<style scoped>
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
}

.table-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

button {
  margin-left: 5px;
  padding: 5px 10px;
  cursor: pointer;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 3px;
}

button:hover {
  background-color: #ddd;
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

.modal-content p, h2 {
  margin-bottom: 10px;
  text-align: center
}

.modal-buttons {
  display: flex;
  justify-content: center
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

button {
  margin-top: 10px;
}

.table-top-container {
  display: flex;
  justify-content: space-between;
}



@media (max-width: 1500px) {
  .table-top-container {
    min-width: 389px;
    width: 100%;
  }

  table {
    font-size: 12px;
  }

  th,
  td {
    padding: 5px;
  }

  button {
    font-size: 12px;
    padding: 4px 8px;
    margin: 0;
  }

  .pagination-controls span {
    font-size: 12px;
  }

  .pagination-controls button {
    font-size: 12px;
    padding: 3px 8px;
  }
}
</style>
