import React, { Suspense } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Center, Environment, ContactShadows } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';

function Model({ url }) {
  const geom = useLoader(STLLoader, url);
  return (
    <mesh geometry={geom} castShadow receiveShadow>
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
      <Canvas shadows camera={{ position: [0, 2, 5], fov: 45 }}>
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
        
        <OrbitControls makeDefault autoRotate autoRotateSpeed={1.0} enablePan={false} />
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
