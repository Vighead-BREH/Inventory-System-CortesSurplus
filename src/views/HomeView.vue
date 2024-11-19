<script setup>
import { ref, computed } from 'vue';
import NavHeader from "../components/NavHeader.vue";
import NavSideBar from "../components/NavSideBar.vue";
import SalesChart from "@/components/SalesChart.vue";
import CarTable from "@/components/CarTable.vue";
import OrderTable from "@/components/OrderTable.vue";
import MaterialCharts from "@/components/MaterialsChart.vue";

  const isSidebarVisible = ref(false);

  const cars = ref([
    { id: 1, unitName: "Toyota Corolla", quantity: 5, price: 1500000 },
    { id: 2, unitName: "Honda Accord", quantity: 3, price: 1800000 },
    { id: 3, unitName: "Ford Ranger", quantity: 7, price: 2500000 },
    { id: 4, unitName: "Chevrolet Spark", quantity: 2, price: 900000 },
    { id: 5, unitName: "Tesla Model S", quantity: 1, price: 7500000 },
    { id: 6, unitName: "Nissan Altima", quantity: 4, price: 2000000 },
    { id: 7, unitName: "BMW 3 Series", quantity: 6, price: 3200000 },
    { id: 8, unitName: "Audi Q5", quantity: 8, price: 4000000 },
    { id: 9, unitName: "Mercedes-Benz C-Class", quantity: 3, price: 3800000 },
    { id: 10, unitName: "Kia Sportage", quantity: 5, price: 1800000 }
  ]);

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

  const currentPage = ref(1);
  const itemsPerPage = ref(5);

  function toggleSidebar() {
    isSidebarVisible.value = !isSidebarVisible.value;
  }

  const totalPages = computed(() => Math.ceil(cars.value.length / itemsPerPage.value));

  const paginatedCars = computed(() => {
    const startIndex = (currentPage.value - 1) * itemsPerPage.value;
    return cars.value.slice(startIndex, startIndex + itemsPerPage.value);
  });

  function nextPage() {
    if (currentPage.value < totalPages.value) {
      currentPage.value++;
    }
  }

  function prevPage() {
    if (currentPage.value > 1) {
      currentPage.value--;
    }
  }

  function addCar(newCar) {
    const newId = Math.max(...cars.value.map(car => car.id)) + 1;
    cars.value.push({ ...newCar, id: newId });
  }

  function updateCar(updatedCar) {
    const index = cars.value.findIndex(car => car.id === updatedCar.id);
    if (index !== -1) {
      cars.value.splice(index, 1, { ...updatedCar });
    }
  }

  function deleteCar(id) {
    cars.value = cars.value.filter(car => car.id !== id);
  }

  function handleSoldCar(id) {
    const index = cars.value.findIndex(car => car.id === id);
    if (index !== -1) {
      cars.value[index].quantity -= 1;
    }
  }

  const paginatedOrders = computed(() => {
    const startIndex = (currentPage.value - 1) * itemsPerPage.value;
    return orders.value.slice(startIndex, startIndex + itemsPerPage.value);
  });
</script>

<template>
  <NavHeader @toggle-sidebar="toggleSidebar" />
  <main>
    <aside>
      <NavSideBar :visible="isSidebarVisible" />
    </aside>
    <section class="content">
      <div class="main-content">
        <div class="row-container">
          <!-- Sales Chart -->
          <div class="sales-content">
            <h1>Sales Chart</h1>
            <div class="salesChart">
              <SalesChart />
            </div>
          </div>
          <!-- Car Table -->
          <div class="table-content-container">
            <h1>Ready to Sell Cars</h1>
            <div class="table-content">
              <CarTable
                :cars="paginatedCars"
                :currentPage="currentPage"
                :totalPages="totalPages"
                @add-car="addCar"
                @update-car="updateCar"
                @delete-car="deleteCar"
                @sold-car="handleSoldCar"
                @next-page="nextPage"
                @prev-page="prevPage"
              />
            </div>
            <!-- Total Sales and Feedback Cards -->
            <div class="total-sales-container">
              <div class="total-sales-card">
                <h2><i class="fas fa-dollar-sign"></i> Monthly Performance</h2>
                <p>Total Sales: <span class="highlight">$320,000</span></p>
              </div>
              <div class="total-feedback-card">
                <h2><i class="fas fa-comments"></i> Feedback</h2>
                <p>Customer Feedbacks: <span class="highlight">92 Positive</span></p>
              </div>
            </div>
          </div>
        </div>
        <div class="row-container">
          <!-- Orders Table -->
          <div class="order-content-container">
            <h1>Orders</h1>
            <div class="order-content">
                <OrderTable :orders="paginatedOrders" />
            </div>
          </div>
          <div class="material-content">
            <!-- Material Charts -->
            <h1>Materials</h1>
            <div class="materialsChart">
              <MaterialCharts />
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
h1 {
  color: #fff;
}

.main {
  display: flex;
  height: auto;
  background-color: #1a2a3c;
}

.main-content {
  display: flex;
  flex-direction: column;
  width: 100%;
}

aside {
  flex-shrink: 0;
}

section.content {
  flex-grow: 1;
  padding: 20px;
  background-color: #1a2a3c;
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.row-container {
  display: flex;
  gap: 20px;
  width: 100%;
  flex-wrap: wrap;
  justify-content: center;
}

.sales-content {
  flex: 1 1 45%;
  min-width: 300px;
}

.salesChart {
  width: 100%;
  height: auto;
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
}

.table-content-container {
  flex: 1 1 45%;
  min-width: 300px;
  border-radius: 8px;
  color: #333;
  display: flex;
  flex-direction: column;
  overflow: auto;
}

.table-content {
  overflow-x: auto;
  border-radius: 8px;
  padding: 11px 20px 11px 20px;
  width: 100%;
  height: 100%;
  min-height: 339px;
  background-color: #fff;
}

.total-sales-container {
  display: flex;
  gap: 20px;
  justify-content: center;
  align-items: flex-start;
  flex-wrap: wrap;
  margin-top: 20px;
}

.total-sales-card,
.total-feedback-card {
  flex: 1 1 45%;
  background-color: #333;
  border-radius: 12px;
  padding: 10px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  color: #fff;
}

.total-sales-card h2,
.total-feedback-card h2 {
  font-size: 1.25rem;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.total-sales-card p,
.total-feedback-card p {
  font-size: 1rem;
  margin: 5px 0;
}

.highlight {
  font-weight: bold;
  font-size: 1.25rem;
  color: #007bff;
}

.order-content-container {
  flex: 1 1 45%;
  min-width: 300px;
  border-radius: 8px;
  color: #333;
  display: flex;
  flex-direction: column;
  overflow: auto;
  margin-top: 20px;
}

.order-content {
  overflow-x: auto;
  border-radius: 8px;
  padding: 11px 20px;
  width: 100%;
  background-color: #fff;
  display: block;
}

.material-content {
  flex: 1 1 45%;
  min-width: 300px;
  margin-top: 20px;
}

.materialsChart {
  width: 100%;
  height: auto;
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
}
</style>
