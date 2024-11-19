<template>
  <header class="app-header">
    <div class="container">
      <h1 class="logo">Cortes Surplus</h1>
      <button
        @click="toggleSidebar"
        class="sidebar-toggle-btn"
        :class="{ 'active': isButtonActive }">
        ☰
      </button>
    </div>
  </header>
</template>

<script>
export default {
  name: "NavHeader",
  data() {
    return {
      isButtonActive: false
    };
  },
  methods: {
    toggleSidebar() {
      this.isButtonActive = !this.isButtonActive;
      this.$emit('toggle-sidebar');
    }
  }
};
</script>

<style scoped>
.app-header {
  background-color: #040d1d;
  color: #fff;
  padding: 1rem 2rem;
  border-bottom: #797878 solid 1px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
}

.sidebar-toggle-btn {
  font-size: 1.5rem;
  background: none;
  color: #fff;
  cursor: pointer;
  padding: 0.5rem;
  border: none;
  width: 50px;
}

.sidebar-toggle-btn.active {
  background-color: #1a2530;
  border-radius: 100%;
  width: 50px;
  transition: background-color 0.3s, transform 0.3s ease;
}

.sidebar-toggle-btn:hover {
  color: #797878;
}

@media (max-width: 768px) {
  .app-header {
    padding: 0.75rem 1rem;
  }

  .logo {
    font-size: 1.25rem;
  }
}
</style>
