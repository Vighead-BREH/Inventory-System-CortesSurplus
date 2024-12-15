<script setup>
import { ref } from "vue";
import NavHeader from "../components/NavHeader.vue";
import NavSideBar from "../components/NavSideBar.vue";
import SalesChart from "@/components/SalesChart.vue";
import SalesReports from "@/components/SalesReport.vue";
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
const router = useRouter();

const authStore = useAuthStore();
if (authStore.isLogin) {
  console.log('Logged in');
} else {
  console.log('Not logged in');
  router.push('/');
}

const isSidebarVisible = ref(false);

function toggleSidebar() {
  isSidebarVisible.value = !isSidebarVisible.value;
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
          <div class="sales-content">
            <h1>Sales Chart</h1>
            <div class="salesChart">
              <SalesChart />
            </div>
          </div>
        </div>

        <div class="row-container">
          <div class="table-content-container">
            <h1>Sales Reports</h1>
            <div class="table-content">
              <SalesReports  />
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
  background-color: var(--background-dark);
}

aside {
  flex-shrink: 0;
}

.main-content {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 20px;
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
</style>
