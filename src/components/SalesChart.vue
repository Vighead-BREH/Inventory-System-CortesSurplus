<template>
  <div class="chart-container">
    <canvas id="salesChart"></canvas>
  </div>
</template>

<script>
  import { Chart } from "chart.js/auto";

  export default {
    mounted() {
      const ctx = document.getElementById("salesChart").getContext("2d");
      new Chart(ctx, {
        type: "line",
        data: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
          datasets: [
            {
              label: "Sales",
              data: [12, 19, 3, 5, 2, 3, 21, 15, 9, 17, 4, 6],
              backgroundColor: "rgba(54, 162, 235, 0.2)",
              borderColor: "rgba(54, 162, 235, 1)",
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
                color: "black",
              },
            },
            x: {
              beginAtZero: true,
              grid: {
                color: "black",
              },
            },
          },
        },
      });
    },
  };
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
