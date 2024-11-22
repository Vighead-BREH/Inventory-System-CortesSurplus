<template>
  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th>Product</th>
          <th>Stock</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in inventory" :key="item.id">
          <td>{{ item.name }}</td>
          <td>{{ item.stock }}</td>
          <td>
            <span
              :class="{
                'low-stock': item.stock < 5,
                'in-stock': item.stock >= 5,
              }"
            >
              {{ item.stock < 5 ? "Low Stock" : "In Stock" }}
            </span>
          </td>
          <td>
            <button @click="editMaterial(item)">Edit</button>
            <button @click="openDeleteCarModal()">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <button @click="openAddMaterialModal">Add Material</button>
  <div v-if="isModalVisible" class="modal-backdrop" @click="closeModal">
    <div class="modal" @click.stop="">
      <div class="modal-content">
        <h2>Add New Material</h2>
        <label for="name">Name:</label>
        <input v-model="modalMaterial.name" id="name" type="text" placeholder="Enter name" />
        <label for="stock">Stock:</label>
        <input v-model="modalMaterial.stock" id="stock" type="number" placeholder="Enter stock" />
        <div>
          <button @click="saveMaterial">Save</button>
          <button @click="closeModal">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "InventoryTracking",
    data() {
      return {
        inventory: [
          { id: 1, name: "Laptop", stock: 10 },
          { id: 2, name: "Mouse", stock: 2 },
          { id: 3, name: "Keyboard", stock: 0 },
        ],
      };
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

th, td {
  border: 1px solid #000000;
  padding: 8px 12px;
  text-align: left;
}

th {
  background-color: #040d1d;
  color: #fff;
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
.low-stock {
  color: red;
}

.in-stock {
  color: green;
}
</style>
