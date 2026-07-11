"use client";

import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-col justify-center items-center w-full h-full p-6 md:p-8">
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full max-w-md p-8 sm:p-10 border border-white/50 relative z-10"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold font-serif text-foreground mb-2">Bienvenue</h2>
          <p className="text-gray-500 text-sm">Connectez-vous pour accéder au tableau de bord.</p>
        </div>

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Adresse e-mail</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail className="h-5 w-5" />
              </div>
              <input
                type="email"
                placeholder="chercheur@aphrc.org"
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-gray-50/50 text-foreground"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Mot de passe</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="h-5 w-5" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full pl-11 pr-11 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-gray-50/50 text-foreground"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm pt-2">
            <label className="flex items-center gap-2.5 text-gray-600 cursor-pointer group">
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary focus:ring-offset-0 transition-all cursor-pointer" 
              />
              <span className="group-hover:text-gray-800 transition-colors">Se souvenir de moi</span>
            </label>
            <a href="#" className="font-semibold text-primary hover:text-primary/80 transition-colors">
              Mot de passe oublié ?
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 active:scale-[0.98] text-white font-semibold py-3.5 rounded-xl transition-all mt-4 shadow-md shadow-primary/20"
          >
            Se connecter
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          Besoin d'un compte ?{" "}
          <a href="#" className="font-semibold text-primary hover:text-primary/80 transition-colors">
            Demander un accès
          </a>
        </div>
      </motion.div>
    </div>
  );
}
