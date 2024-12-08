<script setup>
import { ref } from "vue";
import NavHeader from "../components/NavHeader.vue";
import NavSideBar from "../components/NavSideBar.vue";
import SalesChart from "@/components/SalesChart.vue";
import CarTable from "@/components/CarTable.vue";
import OrderTable from "@/components/OrderTable.vue";
import MaterialCharts from "@/components/MaterialsChart.vue";

const isSidebarVisible = ref(false);
const totalSales = ref(0);
const totalSoldCount = ref(0);

function toggleSidebar() {
  isSidebarVisible.value = !isSidebarVisible.value;
}

function updateTotalSales(amount) {
  totalSales.value += amount;
}

function updateTotalSoldCount(count) {
  totalSoldCount.value += count;
}

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
              <SalesChart  :total-sold-count="totalSoldCount" />
            </div>
          </div>
          <!-- Car Table -->
          <div class="table-content-container">
            <h1>Market-Ready Vehicles</h1>
            <div class="table-content">
              <CarTable @car-sold="updateTotalSales" @car-sold-count="updateTotalSoldCount" />
            </div>
            <!-- Total Sales and Feedback Cards -->
            <div class="total-sales-container">
              <div class="total-sales-card">
                <h2><i class="fas fa-peso-sign"></i> Monthly Performance</h2>
                <p>Total Sales: <span class="highlight">₱{{ totalSales.toLocaleString('en-US') }}</span></p>
              </div>
              <div class="total-feedback-card">
                <h2><i class="fas fa-comments"></i> Feedback</h2>
                <p>Customer Feedbacks: <span class="highlight">92 Positive</span></p>
              </div>
            </div>
          </div>
        </div>
        <div class="row-container order-table">
          <!-- Orders Table -->
          <div class="table-content-container">
            <h1>Orders</h1>
            <div class="table-content">
              <OrderTable @orderChecked="updateTotalSales" />
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
}

aside {
  flex-shrink: 0;
}

.main-content {
  display: flex;
  flex-direction: column;
  width: 100%;
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

.material-content {
  flex: 1 1 45%;
  min-width: 300px;
}

.materialsChart {
  width: 100%;
  height: auto;
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
}

.order-table {
  margin-top: 20px;
}

@media (max-width: 1326px) {
  .total-sales-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .total-sales-card, .total-feedback-card {
    width: 100%;
  }
}
</style>
