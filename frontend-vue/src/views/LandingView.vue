<script setup>
import { RouterLink } from 'vue-router';
</script>

<template>
  <div class="landing">
    <header class="landing-nav">
      <h1>DentaLinkLab</h1>
      <nav>
        <RouterLink to="/login">Login</RouterLink>
        <RouterLink to="/signup">Registro</RouterLink>
        <RouterLink to="/forgot-password">Recuperar</RouterLink>
      </nav>
    </header>

    <section class="landing-hero">
      <p class="eyebrow">Plataforma B2B dental</p>
      <h2>Gestion clinica-laboratorio con trazabilidad completa y transferencia QR de pacientes.</h2>
      <p>
        DentaLinkLab integra pedidos, mensajes por caso, marketplace protésico, buscador de clinicas con mapa y
        modulo de integraciones externas. Todo en una interfaz pensada para produccion y defensa del TFG.
      </p>
      <div class="landing-actions">
        <RouterLink class="cta" to="/signup">Crear cuenta</RouterLink>
        <RouterLink class="cta secondary" to="/login">Acceder al panel</RouterLink>
      </div>
    </section>
  </div>
</template>
