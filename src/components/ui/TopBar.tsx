"use client";

import React, { useState } from 'react';
import { Moon, Sun, Bell, ChevronDown, Globe, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { AuthService } from '@/services/auth.service';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';

export default function TopBar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const { language, setLanguage } = useTranslation();

  const handleLogout = async () => {
    // 1. Déconnexion côté backend (révoque la session et vide les cookies)
    await AuthService.logout();

    // 2. Déconnexion côté frontend (vide le store Zustand)
    logout();

    // 3. Redirection vers la page de login
    router.push('/');
  };

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-6 shrink-0 z-40 sticky top-0">

      <div className="flex-1" /> {/* Spacer */}

      <div className="flex items-center gap-4">

        {/* Theme Toggle */}
        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full p-0.5">
          <button className="p-1 text-gray-400 hover:text-gray-600 rounded-full transition-colors">
            <Moon className="w-3.5 h-3.5" />
          </button>
          <button className="p-1 bg-white text-gray-800 shadow-sm rounded-full transition-colors">
            <Sun className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Language Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsLangOpen(!isLangOpen)}
            type="button"
            className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-gray-600" />
            <span className="text-xs font-bold text-gray-700 uppercase">{language}</span>
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

        {/* Notifications */}
        <button className="relative p-1.5 text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-full transition-colors">
          <Bell className="w-3.5 h-3.5" />
          <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-rose-500 border-[1.5px] border-white rounded-full"></span>
        </button>

        <div className="w-px h-5 bg-gray-200" />

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 pl-1 pr-3 py-1 bg-white hover:bg-gray-50 rounded-full transition-colors"
          >
            <img
              src={user?.avatarUrl || "https://ui-avatars.com/api/?name=" + (user?.firstName || 'A') + "+" + (user?.lastName || 'U') + "&background=random"}
              alt="User"
              className="w-8 h-8 rounded-full object-cover border border-gray-200"
            />
            <span className="text-sm font-bold text-gray-700 hidden md:block">
              {user?.firstName ? `${user.firstName} ${user.lastName}` : (user?.email || "Utilisateur")}
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-400 hidden md:block transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-50 mb-2">
                <p className="text-sm font-bold text-gray-800 truncate">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium transition-colors"
              >
                <LogOut className="w-4 h-4" /> Déconnexion
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
