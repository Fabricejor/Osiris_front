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
  EyeOff,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { SessionsService } from '@/services/sessions.service';
import { DonneesExtraitesService } from '@/services/donnees-extraites.service';
import { PiiCellulesService } from '@/services/pii-cellules.service';

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
  pages: readonly any[];
  initialPageIndex: number;
  sessionId: string;
}

export default function ValidationPopup({ isOpen, onClose, pages, initialPageIndex, sessionId }: Readonly<ValidationPopupProps>) {
  const [currentIndex, setCurrentIndex] = useState(initialPageIndex);
  const [activeTab, setActiveTab] = useState<'clinical' | 'pii'>('clinical');

  // Load clinical data
  const { data: clinicalData = [], isLoading: isLoadingClinical } = useQuery({
    queryKey: ['clinical-data', sessionId],
    queryFn: async () => {
      const res = await DonneesExtraitesService.getDonneesAValider(50, 0, 'a_valider', sessionId);
      return res.items;
    },
    enabled: isOpen && activeTab === 'clinical',
  });

  // Load PII data
  const { data: piiData = [], isLoading: isLoadingPii } = useQuery({
    queryKey: ['pii-data', sessionId],
    queryFn: async () => {
      const res = await PiiCellulesService.getCellulesASaisir(50, 0, 'a_saisir', sessionId);
      return res.items;
    },
    enabled: isOpen && activeTab === 'pii',
  });

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
                              src={currentPage.url_image || currentPage.image}
                              alt={currentPage.nom_fichier || currentPage.name}
                              fill
                              className="object-contain p-4"
                              priority
                            />

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
                    <p className="text-sm text-gray-500">{currentPage.nom_fichier || currentPage.name} • {currentPage.id_session_scan || currentPage.batch}</p>
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

                {/* Tabs */}
                <div className="flex px-6 border-b border-gray-100 bg-gray-50/50">
                  <button 
                    onClick={() => setActiveTab('clinical')}
                    className={`px-4 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'clinical' ? 'border-[#65b741] text-[#65b741]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                  >
                    <Activity className="w-4 h-4" />
                    Clinical Data
                  </button>
                  <button 
                    onClick={() => setActiveTab('pii')}
                    className={`px-4 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'pii' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                  >
                    <ShieldAlert className="w-4 h-4" />
                    PII Data
                    {piiData.filter((p: any) => p.statut === 'A_SAISIR').length > 0 && (
                      <span className="ml-1 bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full text-[10px]">
                        {piiData.filter((p: any) => p.statut === 'A_SAISIR').length}
                      </span>
                    )}
                  </button>
                </div>

                {/* Form Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8" style={{ scrollbarWidth: 'thin' }}>
                  
                  {activeTab === 'pii' && (
                  <section>
                    <h3 className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                      <User className="w-4 h-4" /> Patient Information (PII)
                    </h3>
                    
                    <div className="space-y-4">
                      {isLoadingPii ? (
                        <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-purple-500" /></div>
                      ) : piiData.length > 0 ? (
                        piiData.map((pii) => (
                           <div key={pii.id} className="relative">
                            <label className="block text-xs font-bold text-gray-500 mb-1 ml-4">{pii.nom_champ || 'Champ'}</label>
                            <div className="flex items-center">
                              <div className={`w-1.5 h-10 ${pii.score_confiance && pii.score_confiance < 80 ? 'bg-yellow-400' : 'bg-[#65b741]'} rounded-r-md absolute left-0`} />
                              <input type="text" defaultValue={pii.valeur_saisie} className="w-full ml-4 pl-3 pr-4 py-2 border border-gray-200 rounded-lg text-gray-800 font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-500 text-center py-8">Aucune donnée PII extraite.</div>
                      )}
                    </div>
                  </section>
                  )}

                  {activeTab === 'clinical' && (
                  <section>
                    <h3 className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                      <Activity className="w-4 h-4" /> Clinical Data
                    </h3>
                    
                    <div className="space-y-6">
                      {isLoadingClinical ? (
                        <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-[#65b741]" /></div>
                      ) : clinicalData.length > 0 ? (
                        clinicalData.map((data) => (
                          <div key={data.id} className="relative">
                            <label className="block text-xs font-bold text-gray-500 mb-1 ml-4">Extracted Value</label>
                            <div className="flex items-center">
                              <div className={`w-1.5 h-10 ${(data.score_confiance ?? 0) < 80 ? 'bg-red-500' : 'bg-[#65b741]'} rounded-r-md absolute left-0`} />
                              <input type="text" defaultValue={data.valeur_extraite} className="w-full ml-4 pl-3 pr-4 py-2 border border-gray-200 rounded-lg text-gray-800 font-medium focus:ring-2 focus:ring-[#65b741] focus:border-transparent outline-none" />
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-500 text-center py-8">Aucune donnée clinique extraite.</div>
                      )}
                    </div>
                  </section>
                  )}
                  
                  {/* Padding for sticky footer */}
                  <div className="h-10" />

                </div>

                {/* Sticky Footer */}
                <div className="p-6 bg-white border-t border-gray-100 flex items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
                  <div className="flex items-center gap-3">
                    <Flag className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-bold text-gray-700">
                      {piiData.filter((p: any) => p.statut === 'A_SAISIR').length + clinicalData.filter((c: any) => c.statut === 'A_VALIDER').length} field(s) require review
                    </span>
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
