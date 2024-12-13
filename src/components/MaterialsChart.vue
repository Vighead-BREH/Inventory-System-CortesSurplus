<template>
  <div class="materials-chart-container">
    <canvas id="barChart" ref="barChart"></canvas>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js'

export default {
  data() {
    return {
      mockData: {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        datasets: [
          {
            label: 'Stock',
            data: [65, 59, 80, 81, 56, 55, 40],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2,
          },
          {
            label: 'Used',
            data: [28, 48, 40, 19, 86, 27, 90],
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 2,
          },
        ],
      },
    }
  },
  mounted() {
    Chart.register(...registerables)
    this.createBarChart()
  },
  methods: {
    createBarChart() {
      const barChart = this.$refs.barChart
      if (barChart) {
        new Chart(barChart, {
          type: 'bar',
          data: this.mockData,
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
        })
      }
    },
  },
}
</script>

<style>
.materials-chart-container {
  position: relative;
  width: 100%;
  height: 355px;
  max-height: 500px;
}
#barChart {
  width: 100%;
  height: auto;
}
</style>
