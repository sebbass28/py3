<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const props = defineProps({
  src: {
    type: String,
    default: '/static/models/Crown.stl',
  },
});

const root = ref(null);

let teardown = () => {};

function disposeObject3D(rootObj) {
  rootObj.traverse((obj) => {
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
      else obj.material.dispose();
    }
  });
}

function createViewer(container, stlUrl) {
  let rafId = 0;
  let disposed = false;

  const width = Math.max(container.clientWidth, 320);
  const height = Math.max(container.clientHeight, 400);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf8fafc);

  const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
  camera.position.set(0, 1.5, 4);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  const ctrls = new OrbitControls(camera, renderer.domElement);
  ctrls.enablePan = false;
  ctrls.autoRotate = true;
  ctrls.autoRotateSpeed = 1.0;
  ctrls.minDistance = 2.3;
  ctrls.maxDistance = 7;

  // Lighting setup for a "premium" medical look
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
  hemiLight.position.set(0, 20, 0);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight.position.set(5, 10, 7);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
  scene.add(dirLight);

  // Rim light for better shape definition
  const pointLight = new THREE.PointLight(0x0ea5e9, 0.5);
  pointLight.position.set(-5, 2, -5);
  scene.add(pointLight);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    new THREE.MeshStandardMaterial({ 
      color: 0xf8fafc, 
      roughness: 0.8,
      transparent: true, 
      opacity: 0.3 
    }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.2;
  floor.receiveShadow = true;
  scene.add(floor);

  function animate() {
    rafId = requestAnimationFrame(animate);
    if (disposed) return;
    ctrls.update();
    renderer.render(scene, camera);
  }

  animate();

  function setContent(mesh) {
    const prev = scene.getObjectByName('content');
    if (prev) {
      scene.remove(prev);
      disposeObject3D(prev);
    }
    mesh.name = 'content';
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
  }

  function addPlaceholderCube() {
    const geom = new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.2, metalness: 0.8 });
    setContent(new THREE.Mesh(geom, mat));
  }

  function onResize() {
    if (disposed || !container) return;
    const w = Math.max(container.clientWidth, 320);
    const h = Math.max(container.clientHeight, 400);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  window.addEventListener('resize', onResize);

  const loader = new STLLoader();
  loader.load(
    stlUrl,
    (geometry) => {
      if (disposed) {
        geometry.dispose();
        return;
      }

      geometry.center();
      geometry.computeBoundingBox();
      const size = new THREE.Vector3();
      geometry.boundingBox.getSize(size);
      const maxSize = Math.max(size.x, size.y, size.z) || 1;
      const scale = 2.0 / maxSize;
      geometry.scale(scale, scale, scale);
      geometry.computeVertexNormals();

      // Premium medical material: white, clean, slightly glossy
      const mesh = new THREE.Mesh(
        geometry,
        new THREE.MeshStandardMaterial({ 
          color: 0xffffff, 
          roughness: 0.15, 
          metalness: 0.05,
          emissive: 0x111111,
          emissiveIntensity: 0.1
        }),
      );
      setContent(mesh);
    },
    undefined,
    () => {
      if (!disposed) addPlaceholderCube();
    },
  );

  return () => {
    disposed = true;
    cancelAnimationFrame(rafId);
    window.removeEventListener('resize', onResize);
    ctrls.dispose();
    if (renderer.domElement.parentElement) {
      renderer.domElement.parentElement.removeChild(renderer.domElement);
    }

    disposeObject3D(scene);
    renderer.dispose();
  };
}

function mountViewer() {
  teardown();
  const el = root.value;
  if (!el) return;
  teardown = createViewer(el, props.src);
}

watch(
  () => props.src,
  () => mountViewer(),
);

onMounted(() => mountViewer());

onBeforeUnmount(() => {
  teardown();
  teardown = () => {};
});
</script>

<template>
  <div ref="root" class="stl-view-root" aria-label="Visor 3D de modelo dental" />
</template>

<style scoped>
.stl-view-root {
  width: 100%;
  height: 100%;
  min-height: 400px;
}
</style>
