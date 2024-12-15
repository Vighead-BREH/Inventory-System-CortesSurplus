import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const username = ref('');
  const password = ref('');
  const errorMessage = ref('');
  const isLogin = ref(false);

  const clearErrorMessage = () => {
    errorMessage.value = '';
  };

  const setErrorMessage = (message) => {
    errorMessage.value = message;
  };

  const login = () => {
    if (username.value === 'admin' && password.value === 'adminPassword') {
      isLogin.value = true;
      console.log('Login successful');
    } else {
      setErrorMessage('Invalid credentials');
    }
  };

  const logout = () => {
    username.value = '';
    password.value = '';
    isLogin.value = false;
  };

  return {
    username,
    password,
    errorMessage,
    isLogin,
    clearErrorMessage,
    setErrorMessage,
    login,
    logout,
  };
});
