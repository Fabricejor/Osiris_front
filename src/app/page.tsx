"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Globe, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";

export default function Home() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLangOpen, setIsLangOpen] = useState(false);
  const router = useRouter();
  const { language, setLanguage, t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-primary/15 via-background to-[#E1F2D9] relative overflow-hidden">
      {/* Blurred Splash Screen background watermark */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-15 blur-3xl pointer-events-none scale-105"
        style={{ backgroundImage: 'url("/images/Osiris Splash Screen.PNG")' }}
      />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#8080800d_1px,transparent_1px),linear-gradient(to_bottom,#8080800d_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Decorative ambient blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/25 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[60%] h-[60%] rounded-full bg-tertiary/15 blur-[140px] pointer-events-none" />

      {/* Floating Animated Geometric Shapes (Quantum/Healthcare theme) */}
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 360, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute top-[10%] right-[8%] w-48 h-48 rounded-full border-4 border-dashed border-primary/20 pointer-events-none hidden lg:block"
      />
      
      <motion.div
        animate={{ y: [0, 15, 0], x: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[12%] left-[6%] w-40 h-40 bg-gradient-to-tr from-tertiary/20 to-transparent border border-tertiary/30 rounded-[40%_60%_70%_30%_/_40%_50%_60%_50%] backdrop-blur-xs pointer-events-none hidden lg:block"
      />

      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[35%] left-[45%] w-6 h-6 rounded-full bg-primary/40 pointer-events-none blur-xs"
      />

      <motion.div
        animate={{ y: [0, -12, 0], rotate: [0, 45, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[35%] right-[42%] w-10 h-10 border border-primary/30 rounded-xl pointer-events-none hidden md:block"
      />

      {/* Main Split Container */}
      <div className="w-full max-w-6xl h-[85vh] min-h-[580px] max-h-[750px] bg-white/95 backdrop-blur-md rounded-[2.5rem] shadow-[0_24px_64px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col md:flex-row border border-white/60 relative z-10">
        
        {/* LEFT COLUMN: Login Form */}
        <div className="w-full md:w-[40%] p-8 md:p-12 flex flex-col justify-between h-full bg-white">
          
          {/* Header */}
          <div className="flex items-center justify-between shrink-0">
            <div className="flex items-center">
              <Image
                src="/images/Osiris  icon+text.PNG"
                alt="OSIRIS Logo"
                width={120}
                height={36}
                className="object-contain"
                priority
              />
            </div>

            {/* Language Switcher Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsLangOpen(!isLangOpen)}
                type="button"
                className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 border border-gray-200 rounded-full hover:bg-gray-100 transition-colors text-xs font-semibold text-gray-700 shadow-sm"
              >
                <Globe className="w-3.5 h-3.5 text-gray-500" />
                <span className="uppercase">{language}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>
              
              {isLangOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsLangOpen(false)} />
                  <div className="absolute right-0 mt-1.5 w-28 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-20 overflow-hidden animate-in fade-in-0 slide-in-from-top-1 duration-150">
                    <button
                      onClick={() => {
                        setLanguage("en");
                        setIsLangOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-semibold hover:bg-emerald-50 hover:text-emerald-700 transition-colors flex items-center justify-between ${language === 'en' ? 'text-emerald-600 bg-emerald-50/40' : 'text-gray-700'}`}
                    >
                      English
                      {language === 'en' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                    </button>
                    <button
                      onClick={() => {
                        setLanguage("fr");
                        setIsLangOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-semibold hover:bg-emerald-50 hover:text-emerald-700 transition-colors flex items-center justify-between ${language === 'fr' ? 'text-emerald-600 bg-emerald-50/40' : 'text-gray-700'}`}
                    >
                      Français
                      {language === 'fr' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Form Content */}
          <div className="my-auto max-w-sm w-full mx-auto py-6">
            <h2 className="text-3xl font-bold font-serif text-gray-900 mb-2">{t("hello")}</h2>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              {t("login_subtitle")}
            </p>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Email */}
              <div className="space-y-1.5">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder={t("email_placeholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all bg-gray-50/50 text-gray-800 text-sm placeholder:text-gray-400"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("password_placeholder")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all bg-gray-50/50 text-gray-800 text-sm placeholder:text-gray-400"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Forgot password */}
              <div className="text-left pt-1">
                <button type="button" className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
                  {t("forgot_password")}
                </button>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="w-full bg-[#08704F] hover:bg-[#065c41] active:scale-[0.99] text-white font-semibold py-3.5 rounded-full transition-all mt-6 shadow-md shadow-emerald-900/10 text-sm tracking-wide"
              >
                {t("next_step")}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="shrink-0 flex flex-col items-center gap-4 text-center">
            <div className="text-xs text-gray-500">
              {t("need_account")}{" "}
              <a href="mailto:support@aphrc.org" className="font-semibold text-primary hover:underline">
                {t("request_access")}
              </a>
            </div>
            <div className="text-[10px] text-gray-400 tracking-wider flex flex-col items-center gap-0.5">
              <span>All rights reserved Osiris Healthcare © 2025</span>
              <span className="font-semibold uppercase tracking-widest text-[9px] text-gray-400/80">
                {t("produced_by")}{" "}
                <a
                  href="https://quantum-soul-ten.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors underline decoration-dotted"
                >
                  Quantum Soul
                </a>
              </span>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Image & Glassmorphism Card */}
        <div className="hidden md:block md:w-[60%] relative h-full bg-gray-50">
          {/* Background image */}
          <Image
            src="/images/Login pic.png"
            alt="Osiris Healthcare Platform"
            fill
            className="object-cover"
            priority
          />

          {/* Ambient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/40 via-transparent to-transparent pointer-events-none" />

          {/* Glassmorphism Floating Card */}
          <div className="absolute left-8 bottom-12 right-8 p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white shadow-xl max-w-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded bg-white flex items-center justify-center p-0.5 shadow-sm">
                <Image
                  src="/images/Osiris Icon.PNG"
                  alt="Osiris Icon"
                  width={20}
                  height={20}
                  className="object-contain"
                />
              </div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-white/90">
                OSIRIS HEALTHCARE
              </span>
            </div>
            
            <h3 className="text-lg font-bold text-primary mb-2 leading-snug">
              {t("glass_title")}
            </h3>
            
            <p className="text-xs text-white/80 leading-relaxed">
              {t("glass_desc")}
            </p>
          </div>

        </div>

      </div>
    </main>
  );
}
