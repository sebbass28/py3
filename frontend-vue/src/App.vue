<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import PublicNavbar from './components/PublicNavbar.vue';
import { useAuth } from './stores/auth';

const auth = useAuth();
const route = useRoute();
const appShellPath = computed(() => route.path.startsWith('/app'));
const showNavbar = computed(() => !auth.user && !appShellPath.value);
const showGlobalFooterBar = computed(() => !appShellPath.value);
</script>

<template>
  <div class="app-root-layout">
    <PublicNavbar v-if="showNavbar" />
    <div class="app-main">
      <router-view />
    </div>
    <footer v-if="showGlobalFooterBar" class="dlg-global-ft">© 2026 DentalLink. Conectando sonrisas.</footer>
  </div>
</template>

<style>
.app-root-layout {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
}

.app-main {
  flex: 1 0 auto;
}
</style>
