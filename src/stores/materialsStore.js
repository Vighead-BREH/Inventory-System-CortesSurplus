import { defineStore } from 'pinia'

export const useMaterialsStore = defineStore('materials', {
  state: () => ({
    totalStock: 0,
    stockUsed: 0,
  }),
  actions: {
    setTotalStock(stock) {
      this.totalStock = stock
    },
    setStockUsed(used) {
      this.stockUsed = used
    },
  },
  getters: {
    getTotalStock: (state) => state.totalStock,
    getStockUsed: (state) => state.stockUsed,
  },
})
