"use client";

import React, { useState } from 'react';
import { 
  ChevronRight, 
  Download, 
  Play, 
  LayoutGrid, 
  List as ListIcon, 
  Filter, 
  Pencil,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import Image from 'next/image';
import ValidationPopup from '@/components/features/data-validation/ValidationPopup';

const timelineSteps = [
  { id: 1, title: 'Batch Received', time: 'Oct 25, 2023 • 09:41 AM', status: 'completed' },
  { id: 2, title: 'OCR Processing', subtitle: 'Completed in 2m 14s', details: 'Extracted 1,240 data points across 42 pages.', status: 'completed' },
  { id: 3, title: 'Ready for Validation', subtitle: 'Awaiting clinical review.', action: 'Assign Reviewer', status: 'current' },
  { id: 4, title: 'Validated', subtitle: 'Pending completion.', status: 'upcoming' },
  { id: 5, title: 'Exported to DHIS2', subtitle: 'Pending completion.', status: 'upcoming' },
];

const scannedPages = [
  { id: 1, name: 'Page 01', status: 'pending', statusText: 'Pending', confidence: 94, image: '/registres/Image (1).png' },
  { id: 2, name: 'Page 02', status: 'pending', statusText: 'Pending', confidence: 98, image: '/registres/Image (2).png' },
  { id: 3, name: 'Page 03', status: 'review', statusText: 'Review Required', confidence: 72, image: '/registres/Image (3).png' },
  { id: 4, name: 'Page 04', status: 'validated', statusText: 'Validated', confidence: 99, image: '/registres/Image (5).png' },
  { id: 5, name: 'Page 05', status: 'pending', statusText: 'Pending', confidence: 91, image: '/registres/Image (6).png' },
  { id: 6, name: 'Page 06', status: 'validated', statusText: 'Validated', confidence: 97, image: '/registres/Image (7).png' },
  { id: 7, name: 'Page 07', status: 'validated', statusText: 'Validated', confidence: 95, image: '/registres/Image (8).png' },
  { id: 8, name: 'Page 08', status: 'pending', statusText: 'Pending', confidence: 89, image: '/registres/Image (9).png' },
  { id: 9, name: 'Page 09', status: 'review', statusText: 'Review Required', confidence: 45, image: '/registres/Image (1).png' },
  { id: 10, name: 'Page 10', status: 'validated', statusText: 'Validated', confidence: 98, image: '/registres/Image (2).png' },
  { id: 11, name: 'Page 11', status: 'validated', statusText: 'Validated', confidence: 96, image: '/registres/Image (5).png' },
  { id: 12, name: 'Page 12', status: 'pending', statusText: 'Pending', confidence: 88, image: '/registres/Image (6).png' },
  { id: 13, name: 'Page 13', status: 'validated', statusText: 'Validated', confidence: 99, image: '/registres/Image (7).png' },
  { id: 14, name: 'Page 14', status: 'validated', statusText: 'Validated', confidence: 94, image: '/registres/Image (8).png' },
];

export default function BatchDetailsPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const unwrappedParams = React.use(params);
  const [pageViewMode, setPageViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedPageIndex, setSelectedPageIndex] = useState<number | null>(null);
  // Use mock ID if dynamic routing isn't fully set up, or the passed one
  const batchId = unwrappedParams.id || '2026-0035';

  const getStatusColorClass = (status: string) => {
    if (status === 'review') return 'text-red-500';
    if (status === 'validated') return 'text-[#65b741]';
    return 'text-gray-500';
  };

  const renderStatusDot = (status: string, isGrid: boolean) => {
    if (status === 'validated') {
      return <CheckCircle2 className={`${isGrid ? 'w-4 h-4' : 'w-6 h-6'} text-[#65b741]`} />;
    }
    if (status === 'review') {
      return <div className={`${isGrid ? 'w-2.5 h-2.5 mt-0.5' : 'w-3 h-3 mx-1.5'} rounded-full bg-red-500`} />;
    }
    return <div className={`${isGrid ? 'w-2.5 h-2.5 mt-0.5' : 'w-3 h-3 mx-1.5'} rounded-full bg-amber-400`} />;
  };

  const getStepTextColorClass = (isCompleted: boolean, isCurrent: boolean) => {
    if (isCompleted) return 'text-gray-700';
    if (isCurrent) return 'text-[#65b741]';
    return 'text-gray-400';
  };

  const getStepNode = (isCompleted: boolean, isCurrent: boolean) => {
    if (isCompleted) {
      return (
        <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
          <CheckCircle2 className="w-5 h-5 text-[#65b741] bg-white rounded-full" />
        </div>
      );
    }
    if (isCurrent) {
      return <div className="w-5 h-5 rounded-full border-2 border-[#65b741] bg-white" />;
    }
    return <div className="w-5 h-5 rounded-full bg-gray-100 border-2 border-white" />;
  };

  return (
    <div className="h-full flex flex-col p-6 bg-gray-50/50 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
      {/* Header */}
      <div className="shrink-0 mb-6">
        <div className="flex items-center text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          <span>Batches</span>
          <ChevronRight className="w-3.5 h-3.5 mx-1" />
          <span className="text-gray-900">Batch Details</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Batch #{batchId}</h1>
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-green-100 text-green-700">
              Ready for Validation
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm">
              <Download className="w-4 h-4" /> Export
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#65b741] hover:bg-[#5aa43a] text-white rounded-lg text-sm font-semibold transition-colors shadow-sm">
              <Play className="w-4 h-4" /> Start Validation
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex gap-6">
        {/* Left Column: Metadata & Scanned Pages */}
        <div className="flex-1 flex flex-col gap-6" style={{ scrollbarWidth: 'none' }}>
          
          {/* Metadata Bento Grid */}
          <div className="grid grid-cols-3 gap-4 shrink-0">
            {/* Document Type */}
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Document Type</span>
              <span className="text-xl font-bold text-gray-800 leading-tight">ANC<br/>Register</span>
            </div>
            
            {/* Total Pages */}
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Total Pages</span>
              <span className="text-3xl font-bold text-gray-800">42</span>
            </div>
            
            {/* Overall Confidence */}
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Overall Confidence</span>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-gray-800">92%</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#65b741] rounded-full" style={{ width: '92%' }} />
                </div>
              </div>
            </div>
            
            {/* Upload Date */}
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Upload Date</span>
              <span className="text-base font-bold text-gray-800">Oct 25, 2023</span>
            </div>
            
            {/* Operator */}
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Operator</span>
              <span className="text-base font-bold text-gray-800">Dr. Amina Diallo</span>
            </div>
            
            {/* Clinic */}
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Clinic</span>
              <span className="text-base font-bold text-gray-800">St. Jude's Medical</span>
            </div>
          </div>

          {/* Scanned Pages */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex-1 flex flex-col min-h-0">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h3 className="text-sm font-bold text-gray-800 tracking-wide uppercase">Scanned Pages</h3>
              <div className="flex items-center gap-1.5 text-gray-500 bg-gray-100 p-0.5 rounded-lg">
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
                <button className="p-1.5 hover:bg-gray-200 rounded-md transition-colors ml-2">
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className={`p-5 overflow-y-auto flex-1 grid gap-4 max-h-[640px] ${pageViewMode === 'grid' ? 'grid-cols-4' : 'grid-cols-1'}`} style={{ scrollbarWidth: 'thin', gridAutoRows: 'max-content' }}>
              {scannedPages.map((page, index) => (
                <div 
                  key={page.id} 
                  className={`group relative flex bg-white rounded-lg border-2 transition-all ${
                    pageViewMode === 'grid' ? 'flex-col' : 'flex-row items-center p-2'
                  } ${
                    page.status === 'review' ? 'border-red-500 shadow-sm shadow-red-100' : 'border-transparent shadow-sm hover:shadow-md'
                  }`}
                >
                  {/* Image Container */}
                  <div className={`relative bg-gray-100 overflow-hidden ${
                    pageViewMode === 'grid' ? 'aspect-3/4 w-full rounded-t-md' : 'w-24 h-32 rounded-md shrink-0'
                  }`}>
                    <Image 
                      src={page.image} 
                      alt={page.name}
                      fill
                      className="object-cover"
                    />
                    
                    {/* Confidence Badge (only in grid mode on image) */}
                    {pageViewMode === 'grid' && (
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded shadow-sm text-xs font-bold">
                        <span className={page.confidence < 80 ? 'text-red-500' : 'text-[#65b741]'}>
                          {page.confidence}%
                        </span>
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <button 
                      type="button"
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer border-none"
                      onClick={() => setSelectedPageIndex(index)}
                    >
                      <div className="w-10 h-10 bg-[#65b741] rounded-full flex items-center justify-center text-white shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                        <Pencil className="w-4 h-4" />
                      </div>
                    </button>
                  </div>
                  
                  {/* Card Footer / Details */}
                  <div className={`flex items-start justify-between bg-white ${
                    pageViewMode === 'grid' ? 'p-3 flex-row rounded-b-md border border-t-0 border-gray-100 w-full' : 'p-4 flex-row flex-1 ml-4 items-center border-none'
                  }`}>
                    <div className="flex flex-col">
                      <span className={`font-bold text-gray-900 mb-1 ${pageViewMode === 'grid' ? 'text-sm' : 'text-base'}`}>{page.name}</span>
                      <span className={`font-medium ${pageViewMode === 'grid' ? 'text-xs' : 'text-sm'} ${getStatusColorClass(page.status)}`}>
                        {page.statusText}
                      </span>
                    </div>
                    
                    {/* Right side info for list mode, or status dot for grid */}
                    <div className={`flex items-center ${pageViewMode === 'list' ? 'gap-6' : 'mt-1'}`}>
                      {/* Confidence (List mode) */}
                      {pageViewMode === 'list' && (
                        <div className="flex flex-col items-end">
                          <span className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Confidence</span>
                          <span className={`text-sm font-bold ${page.confidence < 80 ? 'text-red-500' : 'text-[#65b741]'}`}>
                            {page.confidence}%
                          </span>
                        </div>
                      )}

                      {/* Status Dot/Icon */}
                      {renderStatusDot(page.status, pageViewMode === 'grid')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Processing Timeline */}
        <div className="w-[340px] shrink-0 bg-white border border-gray-100 rounded-xl shadow-sm p-6 self-start sticky top-6">
          <h2 className="text-xl font-bold text-gray-900 mb-8">Processing Timeline</h2>
          
          <div className="relative pl-3">
            {/* Vertical Line */}
            <div className="absolute top-2 bottom-6 left-[1.1rem] w-0.5 bg-gray-100" />
            
            <div className="space-y-8 relative">
              {timelineSteps.map((step, index) => {
                const isCompleted = step.status === 'completed';
                const isCurrent = step.status === 'current';
                const isUpcoming = step.status === 'upcoming';
                
                return (
                  <div key={step.id} className="relative flex gap-4 items-start">
                    {/* Timeline Node */}
                    <div className="relative z-10 shrink-0 mt-1">
                      {getStepNode(isCompleted, isCurrent)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-col pb-2">
                      <h4 className={`text-sm font-bold mb-1 ${getStepTextColorClass(isCompleted, isCurrent)}`}>
                        {step.title}
                      </h4>
                      
                      {step.time && (
                        <p className="text-xs text-gray-500">{step.time}</p>
                      )}
                      
                      {step.subtitle && (
                        <p className={`text-xs ${isUpcoming ? 'text-gray-400' : 'text-gray-500'}`}>
                          {step.subtitle}
                        </p>
                      )}
                      
                      {step.details && (
                        <div className="mt-2 p-3 bg-gray-50 border border-gray-100 rounded-md">
                          <p className="text-xs text-gray-500 leading-relaxed">
                            {step.details}
                          </p>
                        </div>
                      )}
                      
                      {step.action && (
                        <button className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#65b741] hover:text-[#5aa43a] transition-colors">
                          {step.action} <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <ValidationPopup 
        isOpen={selectedPageIndex !== null} 
        onClose={() => setSelectedPageIndex(null)} 
        pages={scannedPages} 
        initialPageIndex={selectedPageIndex || 0} 
      />
    </div>
  );
}
