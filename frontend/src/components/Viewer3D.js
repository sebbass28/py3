import React, { Suspense, useMemo } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Center, Environment, ContactShadows } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import * as THREE from 'three';

function Model({ url }) {
  const geom = useLoader(STLLoader, url);
  // Normalizamos escala y centro para que el modelo salga encuadrado al cargar.
  const normalizedGeometry = useMemo(() => {
    const clonedGeometry = geom.clone();
    clonedGeometry.computeBoundingBox();
    const boundingBox = clonedGeometry.boundingBox;
    if (!boundingBox) return clonedGeometry;

    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    boundingBox.getSize(size);
    boundingBox.getCenter(center);

    const maxSize = Math.max(size.x, size.y, size.z) || 1;
    const targetSize = 2.2;
    const scale = targetSize / maxSize;

    clonedGeometry.translate(-center.x, -center.y, -center.z);
    clonedGeometry.scale(scale, scale, scale);
    clonedGeometry.computeVertexNormals();
    return clonedGeometry;
  }, [geom]);

  return (
    <mesh geometry={normalizedGeometry} castShadow receiveShadow>
      <meshStandardMaterial color="#f1f5f9" roughness={0.3} metalness={0.2} />
    </mesh>
  );
}

function ModelPlaceholder() {
  return (
    <mesh castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#0ea5e9" roughness={0.2} metalness={0.8} />
    </mesh>
  );
}

const Viewer3D = ({ stlUrl = null }) => {
  return (
    <div className="w-full h-full min-h-[400px] bg-slate-50 rounded-2xl border border-gray-200 overflow-hidden relative group">
      <Canvas shadows camera={{ position: [0, 1.5, 4], fov: 42 }}>
        <color attach="background" args={['#f8fafc']} />
        <ambientLight intensity={0.6} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        
        <Suspense fallback={null}>
          <Center>
            {stlUrl ? (
              <Model url={stlUrl} /> 
            ) : (
              <ModelPlaceholder />
            )}
          </Center>
          <Environment preset="city" />
          <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={10} blur={2} far={4} color="#1e293b" />
        </Suspense>
        
        <OrbitControls makeDefault autoRotate autoRotateSpeed={1.0} enablePan={false} minDistance={2.3} maxDistance={7} />
      </Canvas>
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-800 shadow-sm pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        <i className="bi bi-box mr-1"></i> Visor 3D Interactivo
      </div>
      <div className="absolute bottom-4 right-4 bg-medical-500/10 text-medical-700 px-3 py-1.5 rounded-lg border border-medical-200 text-xs font-bold shadow-sm pointer-events-none">
        Prototipo Beta
      </div>
    </div>
  );
};

export default Viewer3D;
