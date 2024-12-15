<template>
  <div>
    <div>
      <select @change="changeTimeframe" v-model="selectedTimeframe" id="timeframe-selector">
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
        <option value="yearly">Yearly</option>
      </select>
    </div>
    <div class="chart-container">
      <canvas id="salesChart"></canvas>
    </div>
  </div>
</template>

<script>
import { Chart } from 'chart.js/auto'
import { useCarStore } from '@/stores/carStore'
import { watch } from 'vue'

export default {
  data() {
    return {
      selectedTimeframe: 'monthly',
      salesCount: {
        weekly: [],
        monthly: [],
        yearly: [],
      },
      labels: {
        weekly: ['Week1', 'Week2', 'Week3', 'Week4', 'Week5', 'Week6', 'Week7'],
        monthly: [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ],
        yearly: ['2022', '2023', '2024'],
      },
    }
  },
  mounted() {
    const store = useCarStore();
    this.salesCount.weekly = [store.totalSoldCount, 0, 0, 0, 0, 0, 0];
    this.salesCount.monthly = [store.totalSoldCount, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    this.salesCount.yearly = [store.totalSoldCount, 0, 0];
    this.createChart();

    watch(
      () => store.totalSoldCount,
      (newValue) => {
        this.updateChartWithNewValue(newValue)
      },

    )
  },
  watch: {
    selectedTimeframe: 'createChart',
  },
  methods: {

    createChart() {
      const ctx = document.getElementById('salesChart').getContext('2d')

      if (this.chartInstance) {
        this.chartInstance.destroy()
      }

      let data
      if (this.selectedTimeframe === 'weekly') {
        data = this.salesCount.weekly
      } else if (this.selectedTimeframe === 'monthly') {
        data = this.salesCount.monthly
      } else if (this.selectedTimeframe === 'yearly') {
        data = this.salesCount.yearly
      }

      this.chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.labels[this.selectedTimeframe],
          datasets: [
            {
              label: 'Sales',
              data: data,
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 3,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: '#333',
              },
            },
            x: {
              beginAtZero: true,
              grid: {
                color: '#333',
              },
            },
          },
        },
      })
    },
    changeTimeframe(event) {
      this.selectedTimeframe = event.target.value
      this.createChart()
    },
    updateChartWithNewValue(newValue) {
      this.salesCount.weekly[0] = newValue
      this.salesCount.monthly[0] = newValue
      this.salesCount.yearly[0] = newValue

      if (this.chartInstance) {
        this.chartInstance.data.datasets[0].data = this.salesCount[this.selectedTimeframe]
        this.chartInstance.update()
      }
    },
  },
  beforeMount() {
    if (this.chartInstance) {
      this.chartInstance.destroy()
    }
  },
}
</script>

<style>
.chart-container {
  position: relative;
  width: 100%;
  height: 300px;
  max-height: 500px;
}
#salesChart {
  width: 100%;
  height: auto;
}
</style>
