<script setup>
import NavHeader from '../components/NavHeader.vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import db from '../firebase/init';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { ref } from 'vue';

const authStore = useAuthStore();
const router = useRouter();
const isLoading = ref(false); // Loading state

const submitLogin = async () => {
  authStore.clearErrorMessage(); // Clear previous error message
  isLoading.value = true; // Start loading

  if (authStore.username && authStore.password) {
    try {
      const q = query(collection(db, 'adminAccount'), where('username', '==', authStore.username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const admin = querySnapshot.docs[0].data();
        if (admin.password === authStore.password) {
          authStore.isLogin = true;
          router.push('/home');
        } else {
          authStore.setErrorMessage('Invalid password');
        }
      } else {
        authStore.setErrorMessage('Username not found');
      }
    } catch (error) {
      console.error('Error querying Firestore:', error);
      authStore.setErrorMessage('An error occurred. Please try again later.');
    }
  } else {
    authStore.setErrorMessage('Please fill in all fields.');
  }

  isLoading.value = false; // Stop loading
};
</script>

<template>
  <NavHeader />
  <main>
    <section class="content">
      <div class="login-form">
        <h1>Admin Login</h1>
        <form @submit.prevent="submitLogin">
          <div class="form-group">
            <label for="username">Username</label>
            <input
              type="text"
              id="username"
              v-model="authStore.username"
              placeholder="Enter your username"
              required
            />
            <p v-if="authStore.errorMessage" class="error-message">{{ authStore.errorMessage }}</p>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              v-model="authStore.password"
              placeholder="Enter your password"
              required
            />
            <p v-if="authStore.errorMessage" class="error-message">{{ authStore.errorMessage }}</p>
          </div>

          <button type="submit" :disabled="isLoading">
            <span v-if="isLoading" class="spinner"></span>
            <span v-else>Login</span>
          </button>
        </form>
      </div>
    </section>
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
  color: #fff;
}

main {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80vh;
  background-color: var(--background-dark);
}

section.content {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.login-form {
  background-color: #1a2a3c;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  color: #fff;
  margin-bottom: 5px;
}

input {
  width: 100%;
  padding: 10px;
  margin-top: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #2b3a4d;
  color: #fff;
}

input:focus {
  outline-color: #5d9b9b;
}

button {
  width: 100%;
  padding: 12px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
}

button:disabled {
  background-color: #888;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background-color: #45a049;
}

.spinner {
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid #fff;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-message {
  color: red;
  font-size: 14px;
  margin-top: 5px;
}
</style>
