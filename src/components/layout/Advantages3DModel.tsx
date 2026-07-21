"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

// Preload 3D Model outside component lifecycle
useGLTF.preload("/3D-model/mother_baby_compressed.glb");

function MotherBabyModel() {
  const { scene } = useGLTF("/3D-model/mother_baby_compressed.glb");
  // Increased scale to make it fill the column height
  return <primitive object={scene} scale={3.8} position={[0, -1.5, 0]} />;
}

function ModelLoader() {
  return (
    <mesh>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial color="#7BC148" wireframe transparent opacity={0.3} />
    </mesh>
  );
}

export default function Advantages3DModel() {
  return (
    <Canvas
      camera={{ position: [0, 0.5, 4.5], fov: 45 }}
      dpr={[1, 1]}
      gl={{ powerPreference: "high-performance", antialias: false, alpha: true }}
      style={{ width: "100%", height: "100%" }}
    >
      <ambientLight intensity={1.2} color="#ffffff" />
      <directionalLight position={[5, 10, 5]} intensity={2.5} color="#ffffff" />
      
      <Suspense fallback={<ModelLoader />}>
        <MotherBabyModel />
      </Suspense>

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.8}
      />
    </Canvas>
  );
}
