<template>
  <div>
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
            <td>{{ formatPrice(order.total) }}</td>
            <td>{{ order.paymentMethod }}</td>
            <td>
              <button @click="viewOrder(order)">View</button>
              <button @click="editOrder(order)">Edit</button>
              <button @click="deleteOrder(order)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="viewModalVisible" class="modal">
      <div class="modal-content">
        <h2>Order Details</h2>
        <p><strong>ID:</strong> {{ selectedOrder.id }}</p>
        <p><strong>Customer:</strong> {{ selectedOrder.customer }}</p>
        <p><strong>Date:</strong> {{ selectedOrder.date }}</p>
        <p><strong>Status:</strong> {{ selectedOrder.status }}</p>
        <p><strong>Total:</strong> {{ formatPrice(selectedOrder.total) }}</p>
        <p><strong>Payment Method:</strong> {{ selectedOrder.paymentMethod }}</p>
        <button @click="closeViewModal">Close</button>
      </div>
    </div>

    <div v-if="editModalVisible" class="modal">
      <div class="modal-content">
        <h2>Edit Order</h2>
        <label for="status">Status</label>
        <select v-model="selectedOrder.status" id="status">
          <option value="Pending">Pending</option>
          <option value="Shipped">Shipped</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Processing">Processing</option>
        </select>
        <button @click="saveChanges">Save</button>
        <button @click="closeEditModal">Cancel</button>
      </div>
    </div>

    <div v-if="deleteModalVisible" class="modal">
      <div class="modal-content">
        <h2>Are you sure you want to delete this order?</h2>
        <button @click="confirmDelete">Yes</button>
        <button @click="closeDeleteModal">No</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";

export default {
  name: "OrderTable",
  setup() {
    const orders = ref([
      { id: 1, customer: "John Doe", date: "2024-11-01", status: "Pending", total: 500, paymentMethod: "Credit Card" },
      { id: 2, customer: "Jane Smith", date: "2024-11-02", status: "Shipped", total: 200, paymentMethod: "PayPal" },
      { id: 3, customer: "Alice Johnson", date: "2024-11-05", status: "Completed", total: 1000, paymentMethod: "Bank Transfer" },
      { id: 4, customer: "Bob Brown", date: "2024-11-06", status: "Cancelled", total: 150, paymentMethod: "Debit Card" },
      { id: 5, customer: "Eve Adams", date: "2024-11-07", status: "Pending", total: 300, paymentMethod: "Cash" },
      { id: 6, customer: "Charlie White", date: "2024-11-08", status: "Shipped", total: 700, paymentMethod: "PayPal" },
      { id: 7, customer: "Grace Green", date: "2024-11-09", status: "Processing", total: 450, paymentMethod: "Credit Card" },
      { id: 8, customer: "Hank Blue", date: "2024-11-10", status: "Completed", total: 600, paymentMethod: "Bank Transfer" },
      { id: 9, customer: "Ivy Red", date: "2024-11-11", status: "Cancelled", total: 120, paymentMethod: "Cash" },
      { id: 10, customer: "Jack Black", date: "2024-11-12", status: "Processing", total: 800, paymentMethod: "Debit Card" },
    ]);

    const searchQuery = ref("");
    const currentPage = ref(1);
    const itemsPerPage = ref(5);
    const viewModalVisible = ref(false);
    const editModalVisible = ref(false);
    const deleteModalVisible = ref(false);
    const selectedOrder = ref(null);

    const totalPages = computed(() => Math.ceil(filteredOrders.value.length / itemsPerPage.value));

    const filteredOrders = computed(() => {
      return orders.value.filter(order => {
        return (
          order.customer.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          order.date.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          order.status.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          order.paymentMethod.toLowerCase().includes(searchQuery.value.toLowerCase())
        );
      });
    });

    const filteredPaginatedOrders = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      return filteredOrders.value.slice(start, end);
    });

    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--;
      }
    };

    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++;
      }
    };

    const formatPrice = (value) => {
      return `₱${value.toLocaleString("en-US")}`;
    };

    const viewOrder = (order) => {
      selectedOrder.value = order;
      viewModalVisible.value = true;
    };

    const closeViewModal = () => {
      viewModalVisible.value = false;
    };

    const editOrder = (order) => {
      selectedOrder.value = { ...order }; // Create a copy to edit
      editModalVisible.value = true;
    };

    const closeEditModal = () => {
      editModalVisible.value = false;
    };

    const saveChanges = () => {
      const index = orders.value.findIndex(order => order.id === selectedOrder.value.id);
      if (index !== -1) {
        orders.value[index] = selectedOrder.value;
      }
      closeEditModal();
    };

    const deleteOrder = (order) => {
      selectedOrder.value = order;
      deleteModalVisible.value = true;
    };

    const closeDeleteModal = () => {
      deleteModalVisible.value = false;
    };

    const confirmDelete = () => {
      orders.value = orders.value.filter(order => order.id !== selectedOrder.value.id);
      closeDeleteModal();
    };

    return {
      orders,
      searchQuery,
      currentPage,
      itemsPerPage,
      totalPages,
      filteredOrders,
      filteredPaginatedOrders,
      prevPage,
      nextPage,
      formatPrice,
      viewOrder,
      closeViewModal,
      editOrder,
      closeEditModal,
      saveChanges,
      deleteOrder,
      closeDeleteModal,
      confirmDelete,
      viewModalVisible,
      editModalVisible,
      deleteModalVisible,
      selectedOrder,
    };
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

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.5);
}

.modal-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 5px;
  width: 300px;
  text-align: center;
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
