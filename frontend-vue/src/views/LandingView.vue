<script setup>
import { RouterLink } from 'vue-router';
import StlViewer from '../components/StlViewer.vue';
import { 
  Box, 
  FileCheck, 
  QrCode, 
  ArrowRight, 
  CheckCircle2, 
  Globe, 
  ShieldCheck, 
  MousePointer2 
} from 'lucide-vue-next';

const stlSrc = '/static/models/Crown.stl';

const steps = [
  {
    step: '01',
    title: 'La clínica crea el caso',
    text: 'Selecciona producto, paciente y sube STL con indicaciones clínicas.',
  },
  {
    step: '02',
    title: 'El laboratorio diseña',
    text: 'Sube propuesta digital, conversa por chat y actualiza estados de fabricación.',
  },
  {
    step: '03',
    title: 'Validación y entrega',
    text: 'La clínica aprueba, se emite factura y todo queda trazado en timeline.',
  },
];

const stats = [
  { label: 'Clínicas', val: '500+' },
  { label: 'Laboratorios', val: '120+' },
  { label: 'Casos 3D', val: '15k+' },
  { label: 'Ahorro Tiempo', val: '40%' },
];

const features = [
  {
    title: 'Visor 3D Universal',
    desc: 'Visualización de archivos STL nativa en el navegador. Sin software externo.',
    icon: Box,
    tone: 'medical',
  },
  {
    title: 'Facturación Inmutable',
    desc: 'Snapshot legal automático con cada pedido. Documentos PDF listos para Hacienda.',
    icon: ShieldCheck,
    tone: 'cyan',
  },
  {
    title: 'Trazabilidad Física',
    desc: 'Etiquetas QR automáticas para el seguimiento físico de la caja en el transporte.',
    icon: QrCode,
    tone: 'purple',
  },
];
</script>

<template>
  <div class="lp-page font-sans">
    <section class="lp-hero">
      <div class="bg-blob blob-r" aria-hidden="true"></div>
      <div class="bg-blob blob-bl" aria-hidden="true"></div>

      <div class="lp-hero-inner">
        <div class="lp-copy">
          <div class="lp-pill">
            <span class="lp-dot" aria-hidden="true"></span>
            Digitalizando la Odontología 4.0
          </div>
          <h1 class="lp-title">
            El nexo de <br />
            <span class="lp-title-gradient">Alta Precisión</span>
          </h1>
          <p class="lp-lede">
            Simplifica la colaboración B2B entre Clínicas Dentales y Laboratorios de Prótesis con tecnología de visor
            3D en tiempo real.
          </p>
          <div class="lp-actions">
            <RouterLink class="btn btn-primary lp-btn-wide" to="/signup">
              Iniciar Proyecto Gratis
              <ArrowRight :size="16" class="ml-2" />
            </RouterLink>
            <RouterLink class="btn btn-outline muted-border" to="/marketplace"> Explorar Marketplace </RouterLink>
            <RouterLink class="btn btn-outline muted-border" to="/find-clinics"> Buscar Clínica </RouterLink>
          </div>
        </div>

        <div class="lp-viewer-shell">
          <div class="lp-viewer-ring" aria-hidden="true"></div>
          <div class="lp-viewer-frame">
            <StlViewer :src="stlSrc" />
            <div class="lp-viewer-hud pointer-events-none">
              <span class="lp-hud-left">
                <span class="lp-hud-pulse"></span>
                <MousePointer2 :size="12" class="mr-1" />
                Visor STL Activo
              </span>
              <span class="lp-hud-right">12k Polígonos</span>
            </div>
            <span class="lp-beta-badge pointer-events-none">Prototipo beta</span>
          </div>
        </div>
      </div>
    </section>

    <section id="how-it-works" class="lp-section lp-muted">
      <div class="lp-wrap lp-center-stack">
        <p class="lp-kicker muted">Cómo funciona</p>
        <h2 class="lp-h-section">Flujo simple en 3 pasos</h2>
      </div>
      <div class="lp-grid-3 lp-wrap lp-gap">
        <article v-for="item in steps" :key="item.step" class="lp-card-flat">
          <p class="lp-step">{{ item.step }}</p>
          <h4 class="lp-card-title">{{ item.title }}</h4>
          <p class="lp-card-text">{{ item.text }}</p>
        </article>
      </div>
    </section>

    <section class="lp-muted lp-bordered">
      <div class="lp-stats lp-wrap">
        <div v-for="(s, i) in stats" :key="i" class="lp-stat-cell">
          <div class="lp-stat-num">{{ s.val }}</div>
          <div class="lp-stat-label">{{ s.label }}</div>
        </div>
      </div>
    </section>

    <section id="features" class="lp-section">
      <div class="lp-wrap lp-center-stack">
        <p class="lp-kicker muted">Valor Añadido</p>
        <h2 class="lp-h-feature">Eficiencia en cada pieza dental</h2>
      </div>
      <div class="lp-grid-3 lp-wrap lp-gap">
        <article v-for="f in features" :key="f.title" class="lp-fcard lp-card-hover">
          <div class="lp-ficon" :data-tone="f.tone" aria-hidden="true">
            <component :is="f.icon" :size="24" />
          </div>
          <h4 class="lp-upper-title">{{ f.title }}</h4>
          <p class="lp-fdesc">{{ f.desc }}</p>
        </article>
      </div>
    </section>

    <section class="lp-section lp-cta-outer">
      <div class="lp-cta">
        <div class="lp-cta-glow"></div>
        <div class="lp-cta-inner">
          <h2 class="lp-cta-title">
            ¿Listo para conectar <br />
            tu flujo de trabajo?
          </h2>
          <p class="lp-cta-text">
            Únete a la plataforma que está redefiniendo la prótesis dental digital en España.
          </p>
          <div class="lp-cta-buttons">
            <RouterLink class="btn btn-inverse" to="/signup">Crear Cuenta Gratis</RouterLink>
            <RouterLink class="btn btn-dark" to="/login">Iniciar Sesión</RouterLink>
          </div>
        </div>
      </div>
    </section>

    <footer class="lp-footer">
      <div class="lp-footer-inner">
        <div class="lp-foot-brand">
          <Globe :size="20" class="mr-2" />
          <span class="lp-foot-name">DentalLink</span>
        </div>
        <div class="lp-foot-links">
          <RouterLink to="/privacy">Privacidad</RouterLink>
          <RouterLink to="/terms">Términos</RouterLink>
          <RouterLink to="/contact">Contacto</RouterLink>
        </div>
        <div class="lp-foot-cr">© 2026 DentalLink</div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.pointer-events-none { pointer-events: none; }
.font-sans { font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif; }
.ml-2 { margin-left: 0.5rem; }
.mr-1 { margin-right: 0.25rem; }
.mr-2 { margin-right: 0.5rem; }
</style>
