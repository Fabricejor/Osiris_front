"use client";

import React, { useState } from 'react';
import { Moon, Sun, Bell, ChevronDown, Globe, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { useTopBar } from './TopBarContext';
import { useTranslation } from '@/hooks/useTranslation';

export default function TopBar() {
  const { breadcrumb } = useTopBar();
  const { language, setLanguage } = useTranslation();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const currentDate = format(new Date(), 'MMM d, yyyy');

  return (
    <header className="h-11 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-5 shrink-0 z-40 sticky top-0">

      {/* Left side: breadcrumb slot + date */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {breadcrumb}

        {/* Date badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 border border-gray-100 rounded-lg text-[11px] text-gray-500 cursor-default shrink-0">
          <Calendar className="w-3 h-3 text-gray-400" />
          <span className="font-medium">{currentDate}</span>
        </div>
      </div>

      {/* Right side: actions */}
      <div className="flex items-center gap-3">

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
        <button className="flex items-center gap-2 pl-0.5 pr-2 py-0.5 bg-white hover:bg-gray-50 rounded-full transition-colors">
          <img
            src="https://i.pravatar.cc/150?u=jane"
            alt="User"
            className="w-7 h-7 rounded-full object-cover border border-gray-200"
          />
          <span className="text-xs font-bold text-gray-700 hidden md:block">Dr. Jane Doe</span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden md:block" />
        </button>

      </div>
    </header>
  );
}
