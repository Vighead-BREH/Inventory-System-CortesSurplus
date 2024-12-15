<template>
  <div>
    <button @click="generateReport">Generate Report</button>
    <table v-if="report.length > 0">
      <thead>
        <tr>
          <th>Date</th>
          <th>Total Sales</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="entry in report" :key="entry.date">
          <td>{{ entry.date }}</td>
          <td>{{ entry.totalSales }}</td>
        </tr>
      </tbody>
    </table>
    <p v-else>No report available</p>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useCarStore } from '@/stores/carStore';

const report = ref([]);
const carStore = useCarStore();

function generateReport() {
  const totalSoldCount = carStore.totalSoldCount;

  report.value = [
    { date: "2024-11-01", totalSales: totalSoldCount },
  ];
}
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 10px;
  border: 1px solid #ddd;
}

button {
  padding: 10px 15px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #218838;
}
</style>
