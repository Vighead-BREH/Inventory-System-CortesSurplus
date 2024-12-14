<script setup>
import { ref, computed, onMounted } from 'vue'
import NavHeader from '../components/NavHeader.vue'
import NavSideBar from '../components/NavSideBar.vue'
import SalesChart from '@/components/SalesChart.vue'
import CarTable from '@/components/CarTable.vue'
import InventoryTracking from '@/components/InventoryTracking.vue'
import MaterialCharts from '@/components/MaterialsChart.vue'
import { useMaterialsStore } from '@/stores/materialsStore'
import { useCarStore } from '@/stores/carStore'

const isSidebarVisible = ref(false)
const carStore = useCarStore()
const materialsStore = useMaterialsStore()

const totalSales = ref(0)
const totalStock = computed(() => materialsStore.totalStock)

onMounted(async () => {
  await carStore.getCars()
  await materialsStore.getMaterials()

  totalSales.value = await carStore.calculateTotalSales()
})

function toggleSidebar() {
  isSidebarVisible.value = !isSidebarVisible.value
}

function formatPrice(amount) {
  return `₱${amount.toLocaleString('en-US')}`
}

function formatMaterials(amount) {
  return `${amount.toLocaleString('en-US')}`
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
              <SalesChart />
            </div>
          </div>
          <!-- Car Table -->
          <div class="table-content-container">
            <h1>Market-Ready Vehicles</h1>
            <div class="table-content">
              <CarTable />
            </div>
            <!-- Total Sales and Feedback Cards -->
            <div class="total-sales-container">
              <div class="total-sales-card">
                <h2><i class="fas fa-peso-sign"></i> Monthly Performance</h2>
                <p>
                  Total Sales: <span class="highlight">{{ formatPrice(totalSales) }}</span>
                </p>
              </div>
              <div class="total-order-card">
                <h2><i class="fas fa-box"></i> Materials Stock</h2>
                <p>
                  Total Materials: <span class="highlight">{{ formatMaterials(totalStock) }}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
        <div class="row-container order-table">
          <!-- Orders Table -->
          <div class="table-content-container">
            <h1>Materials Table</h1>
            <div class="table-content">
              <InventoryTracking />
            </div>
          </div>
          <div class="material-content">
            <!-- Material Charts -->
            <h1>Materials Chart</h1>
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
.total-order-card {
  flex: 1 1 45%;
  background-color: #333;
  border-radius: 12px;
  padding: 10px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  color: #fff;
}

.total-sales-card h2,
.total-order-card h2 {
  font-size: 1.25rem;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.total-sales-card p,
.total-order-card p {
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

  .total-sales-card,
  .total-order-card {
    width: 100%;
  }
}
</style>
