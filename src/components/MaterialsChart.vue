<template>
  <div class="materials-chart-container">
    <canvas id="barChart" ref="barChart"></canvas>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js'
import { useMaterialsStore } from '@/stores/materialsStore';
import { watch } from 'vue';

export default {
  data() {
    return {
      mockData: {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        datasets: [
          {
            label: 'Stock',
            data: [],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2,
          },
          {
            label: 'Used',
            data: [],
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 2,
          },
        ],
      },
    }
  },
  mounted() {
    const store = useMaterialsStore()
    this.mockData.datasets[0].data = [store.totalStock, 0, 0, 0, 0, 0, 0]
    this.mockData.datasets[1].data = [store.totalStockUsed, 0, 0, 0, 0, 0, 0]

    Chart.register(...registerables)
    this.createBarChart()

    watch(
      () => store.totalStock,
      (newValue) => {
        this.updateChartData(newValue, 'stock')
      }
    )

    watch(
      () => store.totalStockUsed,
      (newValue) => {
        this.updateChartData(newValue, 'used')
      }
    )
  },
  methods: {
    createBarChart() {
      const barChart = this.$refs.barChart
      if (barChart) {
        this.chartInstance = new Chart(barChart, {
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
    updateChartData(newValue, type) {
      if (type === 'stock') {
        this.mockData.datasets[0].data[0] = newValue
      } else if (type === 'used') {
        this.mockData.datasets[1].data[0] = newValue
      }
      this.chartInstance.update()
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
