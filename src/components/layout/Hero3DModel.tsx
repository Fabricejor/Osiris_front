"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

// Preload 3D Model outside component lifecycle
useGLTF.preload("/3D-model/green_leaf_compressed.glb");

function GreenLeafModel() {
  const { scene } = useGLTF("/3D-model/green_leaf_compressed.glb");
  return <primitive object={scene} scale={3.2} position={[0, -1.6, 0]} />;
}

function ModelLoader() {
  return (
    <mesh>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial color="#7BC148" wireframe transparent opacity={0.3} />
    </mesh>
  );
}

export default function Hero3DModel() {
  return (
    <Canvas
      camera={{ position: [0, 0.5, 5.5], fov: 42 }}
      dpr={[1, 1]}
      gl={{ powerPreference: "high-performance", antialias: false, alpha: true }}
      style={{ width: "100%", height: "100%" }}
    >
      {/* Lighting: Optimized for performance - only two lights */}
      <ambientLight intensity={0.5} color="#e0ffe0" />

      <directionalLight
        position={[2, 10, 5]}
        intensity={3}
        color="#ffffff"
      />

      {/* 3D Model */}
      <Suspense fallback={<ModelLoader />}>
        <GreenLeafModel />
      </Suspense>

      {/* Orbit Controls — horizontal auto rotate */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.8}
        minPolarAngle={Math.PI / 2.2}
        maxPolarAngle={Math.PI / 2.2}
      />
    </Canvas>
  );
}
