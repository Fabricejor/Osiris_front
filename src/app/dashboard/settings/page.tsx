"use client";

import React, { useState } from 'react';
import { 
  Pencil, 
  CheckCircle2, 
  Calendar, 
  Mail, 
  Phone, 
  User, 
  UserCircle, 
  Shield, 
  MapPin, 
  Building2, 
  Lock,
  Globe
} from 'lucide-react';

export default function SettingsPage() {
  const [newLoginAlerts, setNewLoginAlerts] = useState(true);

  return (
    <div className="h-full flex flex-col p-6 bg-[#f8f9fa] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
      
      {/* Main Container */}
      <div className="max-w-5xl w-full mx-auto space-y-8">
        
        {/* Banner & Header Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 pb-8">
          {/* Gradient Banner */}
          <div className="h-40 bg-linear-to-r from-emerald-100 via-[#65b741]/20 to-teal-50 rounded-t-3xl relative">
            {/* Avatar */}
            <div className="absolute -bottom-10 left-8">
              <div className="w-24 h-24 bg-white rounded-full p-1 shadow-sm">
                <img 
                  src="https://i.pravatar.cc/150?u=jane" 
                  alt="Dr. Jane Doe" 
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>
            {/* Edit Button overlay */}
            <div className="absolute bottom-4 right-6">
              <button className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-white/50 rounded-full text-sm font-semibold text-gray-700 hover:bg-white transition-colors shadow-sm">
                <Pencil className="w-4 h-4" /> Edit Profile
              </button>
            </div>
          </div>
          
          {/* Header Info */}
          <div className="pt-14 px-8 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">Dr. Jane Doe</h1>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-xs font-bold text-emerald-700">Verified Profile</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">Start Date: 25 Oct 2023</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-gray-900">Profile details</h2>
            <button className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
              <Pencil className="w-4 h-4" /> Edit
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-8">
            {/* Row 1 */}
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-gray-400 mb-1">Full Name</p>
                <p className="text-sm font-bold text-gray-900">Dr. Jane Doe</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-gray-400 mb-1">Email</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-gray-900">jane.doe@osirishealth.com</p>
                  <div className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 rounded-md">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span className="text-[10px] font-bold text-emerald-600">Email Verified</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-gray-400 mb-1">Date of birth</p>
                <p className="text-sm font-bold text-gray-900">05/02/1985</p>
              </div>
            </div>

            {/* Row 2 */}
            <div className="flex items-start gap-3">
              <UserCircle className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-gray-400 mb-1">Username</p>
                <p className="text-sm font-bold text-gray-900">janedoe_val</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-gray-400 mb-1">Number</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-gray-900">+1 (555) 123-4567</p>
                  <div className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 rounded-md">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span className="text-[10px] font-bold text-emerald-600">Number Verified</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-gray-400 mb-1">Role</p>
                <p className="text-sm font-bold text-gray-900">Lead Validator</p>
              </div>
            </div>

            {/* Row 3 */}
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-gray-400 mb-1">Department</p>
                <p className="text-sm font-bold text-gray-900">Clinical Data Team</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-gray-400 mb-1">Location</p>
                <p className="text-sm font-bold text-gray-900">New York, USA</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Globe className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-gray-400 mb-1">Language</p>
                <p className="text-sm font-bold text-gray-900">English (US)</p>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Factor Authentication Section */}
        <div className="bg-linear-to-r from-emerald-50 via-teal-50 to-[#65b741]/10 rounded-3xl p-6 border border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-emerald-500">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">2-Factor Authentication</h3>
              <p className="text-sm text-gray-600 mt-0.5">Add an extra layer of security to your account with two-Factor authentication.</p>
            </div>
          </div>
          <button className="px-6 py-2.5 bg-[#14b8a6] hover:bg-teal-600 text-white font-bold rounded-lg transition-colors shadow-sm">
            Manage
          </button>
        </div>

        {/* Access History Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Access History</h2>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600">New Login Alerts</span>
                <button 
                  onClick={() => setNewLoginAlerts(!newLoginAlerts)}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 ${newLoginAlerts ? 'bg-[#14b8a6]' : 'bg-gray-300'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform transform ${newLoginAlerts ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              
              <button className="px-4 py-2 border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg text-sm font-bold transition-colors">
                Logout of all others sessions
              </button>
            </div>
          </div>
          
          {/* Table Header Placeholder */}
          <div className="border-t border-gray-100 pt-6">
            <div className="grid grid-cols-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              <div>Location</div>
              <div>Device</div>
              <div>IP Address</div>
              <div>Time</div>
            </div>
            <div className="grid grid-cols-4 text-sm text-gray-800 font-medium py-3 border-b border-gray-50">
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" /> New York, USA</div>
              <div>MacBook Pro (Chrome)</div>
              <div>192.168.1.104</div>
              <div>Active Now</div>
            </div>
            <div className="grid grid-cols-4 text-sm text-gray-500 font-medium py-3">
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" /> Boston, USA</div>
              <div>iPhone 13 (Safari)</div>
              <div>192.168.1.205</div>
              <div>Yesterday, 14:32</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
