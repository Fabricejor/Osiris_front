"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Activity, 
  AlertTriangle, 
  CheckCircle2,
  Flag,
  EyeOff
} from 'lucide-react';
import Image from 'next/image';

interface ScannedPage {
  id: number;
  name: string;
  status: string;
  statusText: string;
  confidence: number;
  image: string;
}

interface ValidationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  pages: readonly ScannedPage[];
  initialPageIndex: number;
}

export default function ValidationPopup({ isOpen, onClose, pages, initialPageIndex }: Readonly<ValidationPopupProps>) {
  const [currentIndex, setCurrentIndex] = useState(initialPageIndex);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialPageIndex);
    }
  }, [isOpen, initialPageIndex]);

  if (!isOpen) return null;

  const currentPage = pages[currentIndex];

  const handleNext = () => {
    if (currentIndex < pages.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white w-full h-full rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            <PanelGroup orientation="horizontal" className="flex-1 w-full h-full">
              
              {/* LEFT PANEL - IMAGE VIEWER */}
              <Panel defaultSize={40} minSize={30} className="bg-[#1e1e1e] flex flex-col relative">
                
                <div className="flex-1 overflow-hidden relative flex items-center justify-center">
                  <TransformWrapper
                    initialScale={1}
                    minScale={0.5}
                    maxScale={4}
                    centerOnInit={true}
                  >
                    {({ zoomIn, zoomOut, resetTransform, centerView }) => (
                      <>
                        <div className="absolute top-4 left-4 z-10 flex items-center bg-black/50 backdrop-blur-md rounded-lg p-1 text-gray-300 gap-1">
                          <button onClick={() => zoomIn()} className="p-2 hover:bg-white/20 rounded transition-colors" title="Zoom In"><ZoomIn className="w-4 h-4" /></button>
                          <button onClick={() => zoomOut()} className="p-2 hover:bg-white/20 rounded transition-colors" title="Zoom Out"><ZoomOut className="w-4 h-4" /></button>
                          <button onClick={() => centerView()} className="p-2 hover:bg-white/20 rounded transition-colors" title="Fit to Screen"><Maximize className="w-4 h-4" /></button>
                          <button onClick={() => resetTransform()} className="p-2 hover:bg-white/20 rounded transition-colors" title="Reset Zoom"><RotateCcw className="w-4 h-4" /></button>
                        </div>
                        
                        <div className="absolute top-4 right-4 z-10 bg-black/50 backdrop-blur-md rounded-lg px-3 py-1.5 text-gray-300 text-xs font-bold">
                          {currentPage.confidence}%
                        </div>

                        <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }} contentStyle={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div className="relative w-full h-full pointer-events-none p-4">
                            <Image
                              src={currentPage.image}
                              alt={currentPage.name}
                              fill
                              className="object-contain p-4"
                              priority
                            />
                            {/* Mock highlight bounding box */}
                            {currentPage.status === 'review' && (
                              <div className="absolute top-[40%] left-[30%] w-[20%] h-[5%] border-2 border-yellow-400 bg-yellow-400/20 rounded z-10" />
                            )}
                          </div>
                        </TransformComponent>
                      </>
                    )}
                  </TransformWrapper>
                </div>

                {/* Bottom Navigation */}
                <div className="h-16 bg-[#161616] border-t border-white/10 flex items-center justify-center gap-4 text-white p-4">
                  <button 
                    onClick={handlePrev} 
                    disabled={currentIndex === 0}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-sm font-semibold"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-bold text-gray-300">
                    Page {currentIndex + 1} of {pages.length}
                  </span>
                  <button 
                    onClick={handleNext} 
                    disabled={currentIndex === pages.length - 1}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-sm font-semibold"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </Panel>

              {/* RESIZE HANDLE */}
              <PanelResizeHandle className="w-2 bg-gray-100 hover:bg-gray-200 transition-colors flex flex-col justify-center items-center cursor-col-resize z-10">
                <div className="w-1 h-8 bg-gray-300 rounded-full" />
              </PanelResizeHandle>

              {/* RIGHT PANEL - FORM */}
              <Panel defaultSize={60} minSize={30} className="bg-white flex flex-col">
                
                {/* Right Panel Header */}
                <div className="p-6 border-b border-gray-100 flex items-start justify-between bg-white z-10 shadow-sm shrink-0">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Record Validation</h2>
                    <p className="text-sm text-gray-500">ANC Register Entry • Row 14</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Confidence</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-2xl font-bold ${currentPage.confidence < 80 ? 'text-red-500' : 'text-[#65b741]'}`}>
                          {currentPage.confidence}%
                        </span>
                        <div className="w-6 h-6 border-2 border-dashed border-red-200 rounded-sm flex items-center justify-center">
                          <div className={`w-3 h-3 rounded-full ${currentPage.confidence < 80 ? 'bg-red-500' : 'bg-[#65b741]'}`} />
                        </div>
                      </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Form Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8" style={{ scrollbarWidth: 'thin' }}>
                  
                  {/* Section 1: Patient Information */}
                  <section>
                    <h3 className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                      <User className="w-4 h-4" /> Patient Information
                    </h3>
                    
                    <div className="space-y-4">
                      {/* Valid Input - Green */}
                      <div className="relative">
                        <label htmlFor="anc-number" className="block text-xs font-bold text-gray-500 mb-1 ml-4">ANC Number</label>
                        <div className="flex items-center">
                          <div className="w-1.5 h-10 bg-[#65b741] rounded-r-md absolute left-0" />
                          <input id="anc-number" type="text" defaultValue="ANC-2023-8492" className="w-full ml-4 pl-3 pr-4 py-2 border border-gray-200 rounded-lg text-gray-800 font-medium focus:ring-2 focus:ring-[#65b741] focus:border-transparent outline-none" />
                        </div>
                      </div>

                      {/* Valid Input - Green */}
                      <div className="relative">
                        <label htmlFor="patient-name" className="block text-xs font-bold text-gray-500 mb-1 ml-4">Patient Name</label>
                        <div className="flex items-center">
                          <div className="w-1.5 h-10 bg-[#65b741] rounded-r-md absolute left-0" />
                          <input id="patient-name" type="text" defaultValue="Fatoumata Diallo" className="w-full ml-4 pl-3 pr-4 py-2 border border-gray-200 rounded-lg text-gray-800 font-medium focus:ring-2 focus:ring-[#65b741] focus:border-transparent outline-none" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Valid Input - Green */}
                        <div className="relative">
                          <label htmlFor="age" className="block text-xs font-bold text-gray-500 mb-1 ml-4">Age</label>
                          <div className="flex items-center">
                            <div className="w-1.5 h-10 bg-[#65b741] rounded-r-md absolute left-0" />
                            <input id="age" type="text" defaultValue="28" className="w-full ml-4 pl-3 pr-4 py-2 border border-gray-200 rounded-lg text-gray-800 font-medium focus:ring-2 focus:ring-[#65b741] focus:border-transparent outline-none" />
                          </div>
                        </div>

                        {/* Blurry Input - Yellow */}
                        <div className="relative">
                          <label htmlFor="parity" className="block text-xs font-bold text-gray-500 mb-1 ml-4">Parity</label>
                          <div className="flex items-center">
                            <div className="w-1.5 h-10 bg-yellow-400 rounded-r-md absolute left-0" />
                            <input id="parity" type="text" defaultValue="G3P2" className="w-full ml-4 pl-3 pr-4 py-2 border border-yellow-400 rounded-lg text-gray-800 font-medium focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Section 2: Clinical Data */}
                  <section>
                    <h3 className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                      <Activity className="w-4 h-4" /> Clinical Data
                    </h3>
                    
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        {/* Valid Input - Green */}
                        <div className="relative">
                          <label htmlFor="date-of-visit" className="block text-xs font-bold text-gray-500 mb-1 ml-4">Date of Visit</label>
                          <div className="flex items-center">
                            <div className="w-1.5 h-10 bg-[#65b741] rounded-r-md absolute left-0" />
                            <input id="date-of-visit" type="text" defaultValue="10/24/2023" className="w-full ml-4 pl-3 pr-4 py-2 border border-gray-200 rounded-lg text-gray-800 font-medium focus:ring-2 focus:ring-[#65b741] focus:border-transparent outline-none" />
                          </div>
                        </div>

                        {/* Valid Input - Green */}
                        <div className="relative">
                          <label htmlFor="gest-age" className="block text-xs font-bold text-gray-500 mb-1 ml-4">Gest. Age (Weeks)</label>
                          <div className="flex items-center">
                            <div className="w-1.5 h-10 bg-[#65b741] rounded-r-md absolute left-0" />
                            <input id="gest-age" type="text" defaultValue="24" className="w-full ml-4 pl-3 pr-4 py-2 border border-gray-200 rounded-lg text-gray-800 font-medium focus:ring-2 focus:ring-[#65b741] focus:border-transparent outline-none" />
                          </div>
                        </div>
                      </div>

                      {/* Error Input - Red */}
                      <div className="relative bg-red-50 p-4 rounded-xl border border-red-200 ml-4">
                        <div className="w-1.5 h-16 bg-red-500 rounded-r-md absolute left-0 top-1/2 -translate-y-1/2" />
                        <div className="flex items-center justify-between mb-2">
                          <label htmlFor="weight" className="flex items-center gap-1.5 text-xs font-bold text-red-600">
                            <AlertTriangle className="w-3.5 h-3.5" /> Weight (kg)
                          </label>
                          <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded uppercase">Review Needed</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input id="weight" type="text" defaultValue="6?" className="w-full px-3 py-2 border-2 border-red-500 rounded-lg text-gray-900 font-bold focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none shadow-sm" />
                          <button className="p-2 border border-red-200 bg-white text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <EyeOff className="w-5 h-5" />
                          </button>
                          <button className="flex items-center gap-1 px-3 py-2 bg-transparent text-red-500 hover:bg-red-50 rounded-lg transition-colors text-xs font-bold whitespace-nowrap">
                            <Maximize className="w-3.5 h-3.5" /> Locating...
                          </button>
                        </div>
                        <p className="text-[11px] text-red-500 mt-2 font-medium flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> System read "6?" - please verify against original scan.
                        </p>
                      </div>

                      {/* Blurry Input - Yellow */}
                      <div className="relative">
                        <label htmlFor="bp-systolic" className="block text-xs font-bold text-gray-500 mb-1 ml-4">Blood Pressure</label>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-10 bg-yellow-400 rounded-r-md absolute left-0" />
                          <input id="bp-systolic" type="text" defaultValue="120" className="w-1/3 ml-4 pl-3 pr-4 py-2 border border-yellow-400 rounded-lg text-gray-800 font-medium focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none" />
                          <span className="text-gray-400 font-bold text-lg">/</span>
                          <input type="text" aria-label="bp-diastolic" defaultValue="80" className="w-1/3 pl-3 pr-4 py-2 border border-gray-200 rounded-lg text-gray-800 font-medium focus:ring-2 focus:ring-[#65b741] focus:border-transparent outline-none" />
                        </div>
                      </div>

                    </div>
                  </section>
                  
                  {/* Padding for sticky footer */}
                  <div className="h-10" />

                </div>

                {/* Sticky Footer */}
                <div className="p-6 bg-white border-t border-gray-100 flex items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
                  <div className="flex items-center gap-3">
                    <Flag className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-bold text-gray-700">1 field requires review</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm">
                      Save Draft
                    </button>
                    <button 
                      onClick={onClose}
                      className="px-6 py-2.5 bg-[#65b741] hover:bg-[#5aa43a] text-white rounded-xl text-sm font-bold transition-colors shadow-md flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Validate Record
                    </button>
                  </div>
                </div>

              </Panel>
            </PanelGroup>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
