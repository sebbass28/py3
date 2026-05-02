import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './style.css';
import { initializeAuth } from './stores/auth';

initializeAuth().finally(() => {
  createApp(App).use(router).mount('#app');
});
