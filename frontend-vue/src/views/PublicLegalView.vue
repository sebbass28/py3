<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const title = computed(() => route.meta.pageTitle || 'Información');
</script>

<template>
  <section class="public-legal-wrap">
    <h1>{{ title }}</h1>
    <p>Contenido legal en revisión para el TFG. Si necesitas el borrador actual, usa el mismo documento corporativo provisional.</p>
    <RouterLink to="/">Volver al inicio</RouterLink>
  </section>
</template>

<style scoped>
.public-legal-wrap {
  max-width: 42rem;
  margin: 0 auto;
  padding: 4rem 1.5rem 5rem;
  color: #0f172a;
}

.public-legal-wrap h1 {
  margin-top: 0;
  letter-spacing: -0.03em;
}

.public-legal-wrap p {
  color: #64748b;
  line-height: 1.6;
}

.public-legal-wrap a {
  display: inline-block;
  margin-top: 1.5rem;
  font-weight: 700;
  color: #0284c7;
  text-decoration: none;
}

.public-legal-wrap a:hover {
  text-decoration: underline;
}
</style>
