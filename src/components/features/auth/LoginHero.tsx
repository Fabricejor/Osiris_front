"use client";

import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginHero() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-8 relative">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8 flex flex-col items-center"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-primary font-serif mb-3 tracking-tight">
          OSIRIS HEALTHCARE
        </h1>
        <p className="text-gray-600 font-medium text-lg">
          Validation sécurisée des données de santé maternelle
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative w-full max-w-[500px] aspect-square mb-16"
      >
        <Image
          src="/images/Login pic.png"
          alt="Osiris Healthcare Platform"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain drop-shadow-2xl"
          priority
        />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="flex items-center gap-2 text-gray-500 text-sm absolute bottom-8 md:bottom-12"
      >
        <ShieldCheck className="w-5 h-5 text-primary" />
        <span className="font-semibold uppercase tracking-wider text-xs">Produit par Quantum Soul</span>
      </motion.div>
    </div>
  );
}
