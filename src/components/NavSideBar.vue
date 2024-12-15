<script setup>
import { useAuthStore } from "@/stores/auth";
import "@fortawesome/fontawesome-free/css/all.css";
import "@fortawesome/fontawesome-free/js/all.js";
import { useRouter } from "vue-router";
const router = useRouter();
// Access Pinia store
const authStore = useAuthStore();

const handleLogout = () => {
  authStore.logout();
  router.push("/");
};
</script>

<template>
  <div :class="['sidebar', { visible: visible }]">
    <ul>
      <li>
        <router-link to="/home"> <i class="fas fa-home"></i> Home </router-link>
      </li>
      <li>
        <router-link to="/sales"> <i class="fas fa-chart-line"></i> Sales </router-link>
      </li>
      <li>
        <router-link to="/inventory"> <i class="fas fa-box"></i> Inventory </router-link>
      </li>
      <li>
        <a href="#"> <i class="fas fa-address-book"></i> Contacts </a>
      </li>
      <li>
        <a href="#" @click="handleLogout">
          <i class="fas fa-sign-out-alt"></i> Logout
        </a>
      </li>
    </ul>
  </div>

  <div v-if="visible" class="backdrop" @click="closeSidebar"></div>
</template>

<script>
export default {
  name: "NavSideBar",
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
  },
  methods: {
    closeSidebar() {
      this.$emit("toggle-sidebar");
    },
  },
};
</script>


<style scoped>
.sidebar {
  width: 200px;
  height: calc(100vh - 60px);
  background-color: #040d1d;
  padding: 20px;
  border-top: #797878 solid 1px;
  border-right: #797878 solid 1px;
  position: fixed;
  top: 60px;
  right: 0;
  transform: translateX(220px);
  transition: transform 0.3s ease;
  z-index: 20;
}

.sidebar.visible {
  transform: translateX(0);
}

.sidebar ul {
  list-style-type: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 80vh;
}

.sidebar li {
  margin-bottom: 10px;
}

.sidebar a {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  color: #fff;
  text-decoration: none;
  padding: 8px 12px;
  border-radius: 4px;
}

.sidebar a:hover {
  background-color: #e0e0e06c;
}

.sidebar svg,
.sidebar i {
  font-size: 24px;
  width: 20px;
  height: 20px;
  margin-right: 8px;
}

.backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 10;
  display: block;
}
</style>
