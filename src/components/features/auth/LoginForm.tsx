"use client";

import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { AuthService } from "@/services/auth.service";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requirePasswordChange, setRequirePasswordChange] = useState(false);
  const [tempCredentials, setTempCredentials] = useState({ email: '', password: '' });
  const router = useRouter();
  
  // Directly get the login action from our zustand store
  // We avoid using useAuthStore hook to prevent hydration issues on initial load, but for actions it's fine.
  const { login } = require('@/store/authStore').useAuthStore.getState();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setIsLoading(true);
    setError(null);
    
    if (requirePasswordChange) {
      const newPassword = formData.get('newPassword') as string;
      const confirmPassword = formData.get('confirmPassword') as string;

      if (newPassword !== confirmPassword) {
        setError('Les mots de passe ne correspondent pas.');
        setIsLoading(false);
        return;
      }
      
      try {
        await AuthService.changePassword(tempCredentials.email, tempCredentials.password, newPassword);
        // Automatically login with the new password
        const { user } = await AuthService.login(tempCredentials.email, newPassword);
        login(user);
        router.push('/dashboard');
      } catch (err: any) {
        setError(err.message || 'Erreur lors du changement de mot de passe.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      // Appelle le service d'authentification web (FastAPI /session)
      const { user } = await AuthService.login(email, password);
      
      // Stocke le user dans Zustand (et donc dans le localStorage)
      login(user);
      
      // Redirige vers le tableau de bord
      router.push('/dashboard');
    } catch (err: any) {
      if (err.message && (err.message.includes("mot de passe temporaire") || err.message.includes("change-password"))) {
        setRequirePasswordChange(true);
        setTempCredentials({ email, password });
        setError(null); // On clear l'erreur pour ne pas l'afficher, l'UI change
      } else {
        setError(err.message || 'Identifiants invalides ou erreur de connexion.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center w-full h-full p-6 md:p-8">
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full max-w-md p-8 sm:p-10 border border-white/50 relative z-10"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold font-serif text-foreground mb-2">
            {requirePasswordChange ? "Nouveau mot de passe" : "Bienvenue"}
          </h2>
          <p className="text-gray-500 text-sm">
            {requirePasswordChange 
              ? "Veuillez définir un mot de passe définitif pour votre compte."
              : "Connectez-vous pour accéder au tableau de bord."}
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm border border-red-100 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {requirePasswordChange ? (
            <>
              <div className="space-y-2">
                <label htmlFor="newPassword" className="text-sm font-semibold text-gray-700">Nouveau mot de passe</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 12 caractères"
                    className="w-full pl-11 pr-11 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-gray-50/50 text-foreground disabled:opacity-50"
                    required
                    disabled={isLoading}
                    minLength={12}
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

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">Confirmer le mot de passe</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    className="w-full pl-11 pr-11 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-gray-50/50 text-foreground disabled:opacity-50"
                    required
                    disabled={isLoading}
                    minLength={12}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-semibold text-gray-700">Adresse e-mail</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="chercheur@aphrc.org"
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-gray-50/50 text-foreground disabled:opacity-50"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-semibold text-gray-700">Mot de passe</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-11 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-gray-50/50 text-foreground disabled:opacity-50"
                    required
                    disabled={isLoading}
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
            </>
          )}

          {!requirePasswordChange && (
            <div className="flex items-center justify-between text-sm pt-2">
              <label className="flex items-center gap-2.5 text-gray-600 cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary focus:ring-offset-0 transition-all cursor-pointer" 
                />
                <span className="group-hover:text-gray-800 transition-colors">Se souvenir de moi</span>
              </label>
              <button type="button" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                Mot de passe oublié ?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 active:scale-[0.98] text-white font-semibold py-3.5 rounded-xl transition-all mt-4 shadow-md shadow-primary/20 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {requirePasswordChange ? "Modification..." : "Connexion..."}
              </>
            ) : (
              requirePasswordChange ? "Définir mon mot de passe" : "Se connecter"
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          Besoin d'un compte ?{" "}
          <button type="button" className="font-semibold text-primary hover:text-primary/80 transition-colors">
            Demander un accès
          </button>
        </div>
      </motion.div>
    </div>
  );
}
