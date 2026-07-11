"use client";

import React from 'react';
import { Moon, Sun, Bell, ChevronDown, Globe } from 'lucide-react';

export default function TopBar() {
  return (
    <div className="h-[60px] w-full bg-white border-b border-gray-200 flex items-center justify-end px-6 flex-shrink-0 z-10">
      
      <div className="flex items-center gap-4">
        
        {/* Theme Toggle */}
        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full p-1">
          <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full transition-colors">
            <Moon className="w-4 h-4" />
          </button>
          <button className="p-1.5 bg-white text-gray-800 shadow-sm rounded-full transition-colors">
            <Sun className="w-4 h-4" />
          </button>
        </div>

        {/* Language Selector */}
        <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
          <Globe className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-bold text-gray-700">EN</span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </button>

        {/* Notifications */}
        <button className="relative p-2 text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-full transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 border-2 border-white rounded-full"></span>
        </button>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* User Profile */}
        <button className="flex items-center gap-3 pl-1 pr-3 py-1 bg-white hover:bg-gray-50 rounded-full transition-colors">
          <img 
            src="https://i.pravatar.cc/150?u=jane" 
            alt="User" 
            className="w-8 h-8 rounded-full object-cover border border-gray-200"
          />
          <span className="text-sm font-bold text-gray-700 hidden md:block">Dr. Jane Doe</span>
          <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
        </button>
        
      </div>
    </div>
  );
}
