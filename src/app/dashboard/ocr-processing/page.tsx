"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Filter, 
  Search, 
  LayoutGrid, 
  List as ListIcon, 
  MoreVertical, 
  CheckCircle2, 
  XCircle, 
  Pencil,
  AlertTriangle,
  Clock
} from 'lucide-react';
import Image from 'next/image';
import ValidationPopup from '@/components/features/data-validation/ValidationPopup';

// Mock data for the OCR Processing Queue
const initialQueuePages = [
  { id: 1, name: 'Page 5 - ANC Register', status: 'anomaly', statusText: 'Anomaly', confidence: 45, image: '/registres/Image (1).png', uploadDate: 'Oct 26, 2023', batch: '2026-0035' },
  { id: 2, name: 'Page 8 - Delivery Log', status: 'pending', statusText: 'Pending', confidence: 62, image: '/registres/Image (2).png', uploadDate: 'Oct 26, 2023', batch: '2026-0036' },
  { id: 3, name: 'Page 12 - OPD Register', status: 'anomaly', statusText: 'Anomaly', confidence: 38, image: '/registres/Image (3).png', uploadDate: 'Oct 25, 2023', batch: '2026-0032' },
  { id: 4, name: 'Page 3 - ANC Register', status: 'pending', statusText: 'Pending', confidence: 71, image: '/registres/Image (4).png', uploadDate: 'Oct 25, 2023', batch: '2026-0031' },
  { id: 5, name: 'Page 1 - Delivery Log', status: 'pending', statusText: 'Pending', confidence: 78, image: '/registres/Image (6).png', uploadDate: 'Oct 25, 2023', batch: '2026-0031' },
  { id: 6, name: 'Page 7 - OPD Register', status: 'anomaly', statusText: 'Anomaly', confidence: 22, image: '/registres/Image (9).png', uploadDate: 'Oct 24, 2023', batch: '2026-0028' },
];

export default function OCRProcessingPage() {
  const [pageViewMode, setPageViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  
  const [queuePages, setQueuePages] = useState(initialQueuePages);
  
  // State for Dropdown and Popup
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [selectedPageIndex, setSelectedPageIndex] = useState<number | null>(null);

  // Close dropdown when clicking outside
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAction = (action: string, id: number, index: number) => {
    setActiveDropdown(null);
    if (action === 'Edit') {
      setSelectedPageIndex(index);
    } else if (action === 'Validate') {
      // Mock validation
      setQueuePages(prev => prev.filter(p => p.id !== id));
    } else if (action === 'Reject') {
      // Mock rejection
      setQueuePages(prev => prev.filter(p => p.id !== id));
    }
  };

  const filteredPages = queuePages.filter(page => {
    const matchSearch = page.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        page.batch.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = filterType === 'All' || 
                        (filterType === 'Anomalies' && page.status === 'anomaly') ||
                        (filterType === 'Low Confidence' && page.confidence < 50);
    return matchSearch && matchFilter;
  });

  return (
    <div className="h-full flex flex-col p-6 bg-gray-50/50 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">OCR Processing Hub</h1>
        <p className="text-gray-500 text-sm">Manage and review pages that require human intervention.</p>
        
        {/* Quick Stats */}
        <div className="flex gap-4 mt-6">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex-1 flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase">Pending Review</p>
              <p className="text-2xl font-black text-gray-900">{queuePages.filter(p => p.status === 'pending').length}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex-1 flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase">Anomalies Detected</p>
              <p className="text-2xl font-black text-gray-900">{queuePages.filter(p => p.status === 'anomaly').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-6">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by name or batch..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#65b741] focus:border-transparent text-gray-700 font-medium"
            />
          </div>
          <div className="h-6 w-px bg-gray-200" />
          <div className="flex items-center gap-2">
             <button onClick={() => setFilterType('All')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${filterType === 'All' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>All</button>
             <button onClick={() => setFilterType('Anomalies')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${filterType === 'Anomalies' ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-700 hover:bg-rose-200'}`}>Anomalies</button>
             <button onClick={() => setFilterType('Low Confidence')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${filterType === 'Low Confidence' ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}>Conf &lt; 50%</button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-gray-500 bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => setPageViewMode('grid')}
            className={`p-1.5 rounded-md transition-colors ${pageViewMode === 'grid' ? 'bg-white text-gray-800 shadow-sm' : 'hover:bg-gray-200'}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setPageViewMode('list')}
            className={`p-1.5 rounded-md transition-colors ${pageViewMode === 'list' ? 'bg-white text-gray-800 shadow-sm' : 'hover:bg-gray-200'}`}
          >
            <ListIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content: Queue Pages */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
        {filteredPages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
            <CheckCircle2 className="w-12 h-12 opacity-50 text-emerald-500" />
            <p className="text-lg font-medium text-gray-600">The queue is empty!</p>
            <p className="text-sm">All pages have been processed.</p>
          </div>
        ) : (
          <div className={`grid gap-6 ${pageViewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`} ref={dropdownRef}>
            {filteredPages.map((page, index) => (
              <div 
                key={page.id} 
                className={`relative flex bg-white rounded-xl border-2 transition-all border-transparent shadow-sm hover:shadow-md ${
                  pageViewMode === 'grid' ? 'flex-col' : 'flex-row items-center p-3'
                }`}
              >
                {/* Image Section */}
                <div className={`relative bg-gray-100 overflow-hidden ${
                  pageViewMode === 'grid' ? 'aspect-[4/3] w-full rounded-t-xl' : 'w-32 h-24 rounded-lg flex-shrink-0'
                }`}>
                  <Image src={page.image} alt={page.name} fill className="object-cover" />
                  
                  {/* Status Badge Over Image */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-sm ${
                      page.status === 'anomaly' ? 'bg-rose-500/90 text-white' : 'bg-amber-400/90 text-amber-900'
                    }`}>
                      {page.statusText}
                    </span>
                  </div>
                </div>

                {/* Card Details */}
                <div className={`flex flex-col flex-1 ${pageViewMode === 'grid' ? 'p-4' : 'ml-6 py-2'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900 leading-tight">{page.name}</h3>
                      <p className="text-xs font-medium text-gray-500 mt-0.5">Batch: {page.batch}</p>
                    </div>
                    
                    {/* Actions Dropdown Trigger */}
                    <div className="relative">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === page.id ? null : page.id); }}
                        className="p-1 text-gray-400 hover:bg-gray-100 rounded-md transition-colors"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      
                      {/* Dropdown Menu */}
                      {activeDropdown === page.id && (
                        <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-100 rounded-xl shadow-lg z-20 py-1 overflow-hidden">
                          <button onClick={() => handleAction('Validate', page.id, index)} className="w-full text-left px-4 py-2 text-sm font-bold text-emerald-600 hover:bg-emerald-50 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" /> Validate
                          </button>
                          <button onClick={() => handleAction('Edit', page.id, index)} className="w-full text-left px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                            <Pencil className="w-4 h-4" /> Edit
                          </button>
                          <div className="h-px bg-gray-100 my-1" />
                          <button onClick={() => handleAction('Reject', page.id, index)} className="w-full text-left px-4 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2">
                            <XCircle className="w-4 h-4" /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={`flex items-center justify-between mt-auto ${pageViewMode === 'grid' ? 'pt-4 border-t border-gray-50' : ''}`}>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Confidence</span>
                      <span className={`text-sm font-black ${page.confidence < 50 ? 'text-rose-500' : 'text-amber-500'}`}>
                        {page.confidence}%
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Uploaded</span>
                      <span className="text-xs font-bold text-gray-600">{page.uploadDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full-Screen Validation Popup */}
      <ValidationPopup 
        isOpen={selectedPageIndex !== null}
        onClose={() => setSelectedPageIndex(null)}
        pages={filteredPages}
        initialPageIndex={selectedPageIndex || 0}
      />
    </div>
  );
}
