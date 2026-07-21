"use client";

import { Suspense } from "react";
import Link from "next/link";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { ArrowRight, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";

function GreenLeafModel() {
  const { scene } = useGLTF("/3D-model/green leaf woman 3d model.glb");
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

export default function HeroBanner() {
  const { t } = useTranslation();

  return (
    <section
      id="home"
      className="relative w-full h-[100dvh] max-h-[100dvh] flex items-center overflow-hidden pt-16 lg:pt-24"
      style={{ backgroundColor: "var(--hero-background)" }}
    >
      {/* Aztec pattern overlay — LEFT edge */}
      <div
        className="hero-pattern absolute top-0 left-0 h-full w-[280px] opacity-[0.2] pointer-events-none"
        style={{
          maskImage: "linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 40%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 40%, transparent 100%)",
        }}
      />

      {/* Aztec pattern overlay — RIGHT edge */}
      <div
        className="hero-pattern absolute top-0 right-0 h-full w-[280px] opacity-[0.2] pointer-events-none"
        style={{
          maskImage: "linear-gradient(to left, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 40%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to left, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 40%, transparent 100%)",
        }}
      />


      {/* Content Container */}
      <div className="relative z-10 w-full h-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-6 lg:py-8 flex flex-col lg:flex-row items-stretch gap-4 lg:gap-8">

        {/* LEFT COLUMN: Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex-1 flex flex-col items-start justify-center gap-6 lg:gap-8 max-w-xl z-10"
        >
          {/* Title */}
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-[54px] font-bold leading-[1.15] tracking-tight"
            >
              <span className="text-white block whitespace-nowrap">{t("hero_title_line1")}</span>
              <span className="text-[#7BC148] block mt-1 whitespace-nowrap">{t("hero_title_line2")}</span>
              <span className="text-white block mt-1 whitespace-nowrap">{t("hero_title_line3")}</span>
            </motion.h1>
          </div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-gray-300/80 text-sm sm:text-base leading-relaxed max-w-md"
          >
            {t("hero_description")}
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="flex flex-wrap items-center gap-4"
          >
            {/* Get Started */}
            <Link
              href="/login"
              className="group flex items-center gap-2 bg-gradient-to-r from-[#7BC148] to-[#08704F] hover:from-[#8ce34a] hover:to-[#0a8961] text-white font-semibold text-sm px-7 py-3 rounded-full shadow-lg shadow-emerald-950/50 hover:shadow-emerald-700/30 active:scale-95 transition-all duration-200 border border-white/15"
            >
              {t("get_started")}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>

            {/* Learn More */}
            <a
              href="#features"
              className="group flex items-center gap-2 bg-transparent border border-white/25 hover:border-white/40 hover:bg-white/5 text-white font-medium text-sm px-7 py-3 rounded-full transition-all duration-200 backdrop-blur-sm"
            >
              {t("hero_learn_more")}
              <ChevronDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
            </a>
          </motion.div>
        </motion.div>

        {/* RIGHT COLUMN: 3D Model */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
          className="flex-1 w-full h-full min-h-[250px] relative flex items-center justify-center"
        >


          <Canvas
            camera={{ position: [0, 0.5, 5.5], fov: 42 }}
            style={{ width: "100%", height: "100%" }}
          >
            {/* Lighting: Strong fluorescent white-green from the top */}
            <ambientLight intensity={0.3} color="#e0ffe0" />

            {/* Main fluorescent green-white top light */}
            <directionalLight
              position={[0, 12, 2]}
              intensity={4}
              color="#b8ff80"
              castShadow
            />
            <directionalLight
              position={[0, 10, -1]}
              intensity={2.5}
              color="#ffffff"
            />

            {/* Fluorescent green spot from directly above */}
            <spotLight
              position={[0, 10, 0]}
              intensity={5}
              color="#7BFF48"
              angle={0.5}
              penumbra={0.8}
              distance={20}
              castShadow
            />

            {/* Supporting white fill from the sides */}
            <pointLight
              position={[3, 5, 3]}
              intensity={1}
              color="#ffffff"
              distance={15}
            />
            <pointLight
              position={[-3, 5, 3]}
              intensity={1}
              color="#ffffff"
              distance={15}
            />

            {/* 3D Model */}
            <Suspense fallback={<ModelLoader />}>
              <GreenLeafModel />
            </Suspense>

            {/* Orbit Controls — horizontal only */}
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              autoRotate
              autoRotateSpeed={1.5}
              minPolarAngle={Math.PI / 2.2}
              maxPolarAngle={Math.PI / 2.2}
            />
          </Canvas>
        </motion.div>
      </div>

      {/* Bottom subtle gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0f210e] to-transparent pointer-events-none" />
    </section>
  );
}