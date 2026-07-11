"use client";

import React, { useState } from 'react';
import { 
  Search, 
  Calendar, 
  ChevronDown, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import Image from 'next/image';

const groupedLogs = [
  {
    dateStr: 'Today - Oct 26, 2023',
    logs: [
      { id: 1, time: '10:45 AM', user: 'Dr. Anya Sharma', action: 'Accessed Patient Record (ID: PAT-123)', docId: 'DOC-554-23', status: 'Success', ip: '192.168.1.45', avatar: 'https://i.pravatar.cc/150?u=anya' },
      { id: 2, time: '09:30 AM', user: 'Nurse John Lee', action: 'Updated Vitals', docId: 'DOC-553-10', status: 'Pending', ip: '192.168.1.50', avatar: 'https://i.pravatar.cc/150?u=john' },
      { id: 3, time: '08:15 AM', user: 'Admin Sarah Chen', action: 'Document Upload Failed', docId: 'DOC-552-01', status: 'Error', ip: '192.168.1.20', avatar: 'https://i.pravatar.cc/150?u=sarah' },
    ]
  },
  {
    dateStr: 'Yesterday - Oct 25, 2023',
    logs: [
      { id: 4, time: '10:45 AM', user: 'Dr. Anya Sharma', action: 'Accessed Patient Record (ID: PAT-123)', docId: 'DOC-554-23', status: 'Success', ip: '192.168.1.45', avatar: 'https://i.pravatar.cc/150?u=anya' },
      { id: 5, time: '09:30 AM', user: 'Nurse John Lee', action: 'Updated Vitals', docId: 'DOC-553-10', status: 'Pending', ip: '192.168.1.50', avatar: 'https://i.pravatar.cc/150?u=john' },
      { id: 6, time: '08:15 AM', user: 'Admin Sarah Chen', action: 'Document Upload Failed', docId: 'DOC-552-01', status: 'Error', ip: '192.168.1.20', avatar: 'https://i.pravatar.cc/150?u=sarah' },
    ]
  }
];

export default function ActivityLogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [actionFilter, setActionFilter] = useState('All');

  const gridTemplate = "grid-cols-[100px_200px_minmax(250px,_1fr)_120px_100px_120px]";

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
        return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">Success</span>;
      case 'pending':
        return <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold border border-amber-200">Pending</span>;
      case 'error':
        return <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-bold border border-rose-200">Error</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold border border-gray-200">{status}</span>;
    }
  };

  const filteredGroups = groupedLogs.map(group => {
    return {
      ...group,
      logs: group.logs.filter(log => {
        const matchSearch = log.user.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            log.action.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            log.docId.toLowerCase().includes(searchQuery.toLowerCase());
        const matchStatus = statusFilter === 'All' || log.status.toLowerCase() === statusFilter.toLowerCase();
        
        let matchAction = true;
        if (actionFilter !== 'All') {
           matchAction = log.action.toLowerCase().includes(actionFilter.toLowerCase());
        }

        return matchSearch && matchStatus && matchAction;
      })
    };
  }).filter(group => group.logs.length > 0);

  return (
    <div className="h-full flex flex-col p-6 bg-gray-50/50 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Healthcare Activity Logs Timeline V2</h1>
        <p className="text-gray-500 text-sm">Healthcare analytics audit interface for tracking user activity and document processing logs.</p>
      </div>

      {/* Filters Bar */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-8 flex-wrap">
        
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold text-gray-700 mb-1.5">Search</label>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search logs..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#65b741] focus:border-transparent text-gray-700 font-medium"
            />
          </div>
        </div>

        {/* Date Range */}
        <div className="w-[240px]">
          <label className="block text-xs font-bold text-gray-700 mb-1.5">Date range</label>
          <button className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="font-medium">Oct 1, 2023 - Oct 31, 2023</span>
            </div>
          </button>
        </div>

        {/* Status */}
        <div className="flex flex-col">
          <label className="block text-xs font-bold text-gray-700 mb-1.5">Status</label>
          <div className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg bg-white h-[38px]">
             <button onClick={() => setStatusFilter('All')} className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${statusFilter === 'All' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>All</button>
             <button onClick={() => setStatusFilter('Success')} className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${statusFilter === 'Success' ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}>Success</button>
             <button onClick={() => setStatusFilter('Pending')} className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${statusFilter === 'Pending' ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}>Pending</button>
             <button onClick={() => setStatusFilter('Error')} className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${statusFilter === 'Error' ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-700 hover:bg-rose-200'}`}>Error</button>
          </div>
        </div>

        {/* Action Type */}
        <div className="flex flex-col">
          <label className="block text-xs font-bold text-gray-700 mb-1.5">Action Type</label>
          <div className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg bg-white h-[38px]">
             <button onClick={() => setActionFilter('All')} className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${actionFilter === 'All' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>All</button>
             <button onClick={() => setActionFilter('Access')} className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${actionFilter === 'Access' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}>Access</button>
             <button onClick={() => setActionFilter('Edit')} className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${actionFilter === 'Edit' ? 'bg-purple-500 text-white' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}>Edit</button>
             <button onClick={() => setActionFilter('Upload')} className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${actionFilter === 'Upload' ? 'bg-indigo-500 text-white' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}`}>Upload</button>
          </div>
        </div>

        {/* Filter Button */}
        <div className="flex items-end h-[58px]">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-bold hover:bg-slate-700 transition-colors h-[38px] shadow-sm">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
        
        {/* Table Headers */}
        <div className={`grid ${gridTemplate} gap-4 mb-6 ml-10 text-sm font-bold text-gray-500`}>
          <div>Timestamp</div>
          <div>User</div>
          <div>Action</div>
          <div>Document ID</div>
          <div>Status</div>
          <div>IP Address</div>
        </div>

        {/* Timeline List */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
          {filteredGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
              <Search className="w-8 h-8 opacity-50" />
              <p>No activity logs match your filters.</p>
            </div>
          ) : filteredGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="mb-10 last:mb-0">
              {/* Group Date Header */}
              <h2 className="text-lg font-bold text-gray-900 mb-4">{group.dateStr}</h2>
              
              <div className="relative pl-10 space-y-4">
                {/* Vertical Timeline Line */}
                <div className="absolute left-[19px] top-4 bottom-[-16px] w-[2px] bg-gray-200" />

                {group.logs.map((log) => (
                  <div key={log.id} className="relative group">
                    {/* Timeline Node */}
                    <div className="absolute -left-[26px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-[3px] border-gray-300 bg-white z-10 group-hover:border-[#65b741] transition-colors" />

                    {/* Row Card */}
                    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow hover:border-[#65b741]/30">
                      <div className={`grid ${gridTemplate} gap-4 items-center`}>
                        {/* Timestamp */}
                        <div className="text-sm font-bold text-gray-600">{log.time}</div>
                        
                        {/* User */}
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                            <img src={log.avatar} alt={log.user} width={32} height={32} className="object-cover w-full h-full" />
                          </div>
                          <span className="text-sm font-bold text-gray-800">{log.user}</span>
                        </div>
                        
                        {/* Action */}
                        <div className="text-sm font-semibold text-gray-700 truncate pr-4">{log.action}</div>
                        
                        {/* Document ID */}
                        <div className="text-sm font-bold text-gray-500">{log.docId}</div>
                        
                        {/* Status */}
                        <div>{getStatusBadge(log.status)}</div>
                        
                        {/* IP Address */}
                        <div className="text-sm font-medium text-gray-500">{log.ip}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-center gap-2 mt-8 border-t border-gray-100 pt-6">
          <button className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors disabled:opacity-50">
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors disabled:opacity-50">
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 border border-gray-300 text-gray-800 text-sm font-bold">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-transparent text-gray-500 hover:bg-gray-50 text-sm font-bold">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-transparent text-gray-500 hover:bg-gray-50 text-sm font-bold">3</button>
            <span className="px-1 text-gray-400">...</span>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-transparent text-gray-500 hover:bg-gray-50 text-sm font-bold">10</button>
          </div>

          <button className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
          <button className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
