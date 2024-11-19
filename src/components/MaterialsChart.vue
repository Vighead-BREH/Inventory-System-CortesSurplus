<template>
  <div class="chart-container">
    <canvas id="barChart" ref="barChart"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const mockData = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  datasets: [
    {
      label: 'Dataset 1',
      data: [65, 59, 80, 81, 56, 55, 40],
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
    },
    {
      label: 'Dataset 2',
      data: [28, 48, 40, 19, 86, 27, 90],
      backgroundColor: 'rgba(153, 102, 255, 0.2)',
      borderColor: 'rgba(153, 102, 255, 1)',
      borderWidth: 1,
    },
  ],
};

const barChart = ref(null);

const createBarChart = () => {
  if (barChart.value) {
    new Chart(barChart.value, {
      type: 'bar',
      data: mockData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
        plugins: {
          legend: {
            position: 'top',
          },
        },
      },
    });
  }
};

onMounted(() => {
  createBarChart();
});
</script>

<style>
  .chart-container {
    position: relative;
    width: 100%;
    height: 300px;
    max-height: 500px;
  }
  #barChart {
    width: 100%;
    height: auto;
  }
</style>
