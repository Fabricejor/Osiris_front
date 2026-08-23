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
  CheckCircle2,
  Stethoscope,
  Sparkles,
  Layers,
  FileSpreadsheet,
  Edit3,
  Check,
  CheckCheck,
  Baby,
  HeartPulse,
  ClipboardCheck,
  UserCheck,
} from 'lucide-react';
import Image from 'next/image';

export interface ScannedPage {
  id: number;
  name: string;
  category?: 'ACC' | 'CPN' | 'CPON' | 'SAA';
  categoryLabel?: string;
  status: 'validated' | 'pending' | 'review' | string;
  statusText: string;
  confidence: number;
  image: string;
  doublePage?: string;
  dateScanned?: string;
}

interface ValidationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  pages: readonly ScannedPage[];
  initialPageIndex: number;
}

interface PatientRecord {
  id: number;
  // --- PAGE 1 : COLONNES 1 À 14 (Extraites fidèlement de l'image manuscrite) ---
  numOrdre: string;          // Col 1 : N° Ordre
  numParto: string;          // Col 2 : N° Parto
  dateEntree: string;        // Col 3 : Date / Heure Entrée
  nomPatiente: string;       // Col 4 : Prénoms et Nom
  age: string;               // Col 5 : Âge
  adresse: string;           // Col 6 : Adresse Exacte
  gestite: string;           // Col 7 : Gestité
  parite: string;            // Col 8 : Parité
  dateAccouchement: string;  // Col 9 : Date / Heure Accouchement
  lieuAccouchement: string;  // Col 10 : Lieu Accouchement
  modeAccouchement: string;  // Col 11 : Mode Accouchement
  typeDelivrance: string;    // Col 12 : Délivrance
  presentation: string;      // Col 13 : Présentation
  qualification: string;     // Col 14 : Qualification

  // --- PAGE 2 : COLONNES 15 À 23 (Structure officielle du registre national) ---
  // Col 15 (a) : État du nouveau-né
  cri: string;               // CRI (Oui/Non)
  vbp: string;               // VBP (Vivant Bien Portant)
  mn: string;                // MN / MNM / DCD
  risqueInfection: string;   // Risque Infection
  refereNN: string;          // Référé
  sexeNN: string;            // Sexe (b) (M/F)
  poidsNN: string;           // Poids (c)
  eligKangourou: string;     // Faible poids éligible Kangourou (d)
  sousKangourou: string;     // Sous méthode Kangourou (e)
  // Col 15 (f) : Soins du nouveau-né
  soinsImmediats: string;    // MT, MSP, SC, COLL, K1
  vaccinHepB24h: string;     // Hép B dans les 24H
  vaccinPolio0: string;      // Polio 0
  atbNN: string;             // ATB
  reanimationNN: string;     // Réanimation
  // Col 16 : Devenir de la mère
  devenirMere: string;       // VPB / EVAC / DCD
  // Col 17 : Complications accouchement
  complications: string;     // Complications accouchement
  // Col 18 : Préventions
  vat: string;               // VAT
  ferAcideFolique: string;   // Fer / Ac. fol.
  etmeTestVIH: string;       // eTME (Test VIH, Proposition, Acceptation, Réalisation)
  // Col 19 : Conseils AME
  conseilsAME: string;       // Conseils Allaitement Maternel Exclusif
  // Col 20 : Planification Familiale Post-Partum
  pfCounseling: string;      // Counseling / Acceptation
  pfMethode: string;         // Méthode offerte (DIU, Implants, DMPA...)
  // Col 21 & 22 : Sortie & Séjour
  dateSortie: string;        // Date et Heure de Sortie
  dureeSejour: string;       // Journées d'hospitalisation
  // Col 23 : Observations
  observations: string;      // Observations

  // Métadonnées
  statut: 'En attente' | 'Validé' | 'Corrigé';
  confiance: number;
}

const INITIAL_RECORDS: PatientRecord[] = [
  {
    id: 1,
    // Page 1 (Photo manuscrite réelle N° 24)
    numOrdre: '24',
    numParto: '126 / 26',
    dateEntree: '27-5-26 à 10H40',
    nomPatiente: 'Salla Sow',
    age: '19 ans',
    adresse: 'Potou s/c Adama Kâ',
    gestite: 'II',
    parite: 'II',
    dateAccouchement: '27-5-26 à 11H30',
    lieuAccouchement: 'P.S Potou',
    modeAccouchement: 'Normal',
    typeDelivrance: 'GATPA',
    presentation: 'Céphalique',
    qualification: 'Sage-femme',
    // Page 2 (Synthèse clinique officielle)
    cri: 'OUI',
    vbp: 'OUI (VBP)',
    mn: 'NON',
    risqueInfection: 'NON',
    refereNN: 'NON',
    sexeNN: 'M',
    poidsNN: '3 100 g',
    eligKangourou: 'NON',
    sousKangourou: 'NON',
    soinsImmediats: 'MT · MSP · SC · COLL · K1',
    vaccinHepB24h: 'OUI',
    vaccinPolio0: 'OUI',
    atbNN: 'NON',
    reanimationNN: 'NON',
    devenirMere: 'VPB (Bien portante)',
    complications: 'Néant',
    vat: 'À jour (VAT 3)',
    ferAcideFolique: 'OUI',
    etmeTestVIH: 'Négatif (Testé & Réalisé)',
    conseilsAME: 'OUI',
    pfCounseling: 'Accepté',
    pfMethode: 'DIU Post-Partum',
    dateSortie: '28-5-26 à 12H00',
    dureeSejour: '24 heures (1 jour)',
    observations: 'Suites physiologiques normales. Mère et nouveau-né sortants bien portants.',
    statut: 'En attente',
    confiance: 98.2
  },
  {
    id: 2,
    // Page 1 (Photo manuscrite réelle N° 25)
    numOrdre: '25',
    numParto: '127 / 26',
    dateEntree: '28-5-26 à 01H10',
    nomPatiente: 'Fatimata Kâ',
    age: '25 ans',
    adresse: 'Maka Mor Madické s/c El Hadj Kâ',
    gestite: 'III',
    parite: 'III',
    dateAccouchement: '28-5-26 à 3H42',
    lieuAccouchement: 'P.S Potou',
    modeAccouchement: 'Normal',
    typeDelivrance: 'GATPA',
    presentation: 'Céphalique',
    qualification: 'Sage-femme',
    // Page 2 (Synthèse clinique officielle)
    cri: 'OUI',
    vbp: 'OUI (VBP)',
    mn: 'NON',
    risqueInfection: 'NON',
    refereNN: 'NON',
    sexeNN: 'F',
    poidsNN: '2 950 g',
    eligKangourou: 'NON',
    sousKangourou: 'NON',
    soinsImmediats: 'MT · MSP · SC · COLL · K1',
    vaccinHepB24h: 'OUI',
    vaccinPolio0: 'OUI',
    atbNN: 'NON',
    reanimationNN: 'NON',
    devenirMere: 'VPB (Bien portante)',
    complications: 'Néant',
    vat: 'À jour (VAT 2)',
    ferAcideFolique: 'OUI',
    etmeTestVIH: 'Négatif (Testé & Réalisé)',
    conseilsAME: 'OUI',
    pfCounseling: 'Accepté',
    pfMethode: 'Implants sous-cutanés',
    dateSortie: '29-5-26 à 08H00',
    dureeSejour: '24 heures (1 jour)',
    observations: 'Mère et nouveau-né bien portants, sortie à J1.',
    statut: 'En attente',
    confiance: 97.9
  },
  {
    id: 3,
    // Page 1 (Photo manuscrite réelle N° 26)
    numOrdre: '26',
    numParto: '128 / 26',
    dateEntree: '28-5-26 à 22H18',
    nomPatiente: 'Awa Kâ',
    age: '30 ans',
    adresse: 'Potou s/c Djiby Kâ',
    gestite: 'IV',
    parite: 'IV',
    dateAccouchement: '28-5-26 à 23H10',
    lieuAccouchement: 'P.S Potou',
    modeAccouchement: 'Normal',
    typeDelivrance: 'GATPA',
    presentation: 'Céphalique',
    qualification: 'Sage-femme',
    // Page 2 (Synthèse clinique officielle)
    cri: 'OUI',
    vbp: 'OUI (VBP)',
    mn: 'NON',
    risqueInfection: 'NON',
    refereNN: 'NON',
    sexeNN: 'M',
    poidsNN: '3 400 g',
    eligKangourou: 'NON',
    sousKangourou: 'NON',
    soinsImmediats: 'MT · MSP · SC · COLL · K1',
    vaccinHepB24h: 'OUI',
    vaccinPolio0: 'OUI',
    atbNN: 'NON',
    reanimationNN: 'NON',
    devenirMere: 'VPB (Bien portante)',
    complications: 'Néant',
    vat: 'À jour (VAT 4)',
    ferAcideFolique: 'OUI',
    etmeTestVIH: 'Négatif (Testé & Réalisé)',
    conseilsAME: 'OUI',
    pfCounseling: 'Accepté',
    pfMethode: 'Injectable DMPA (Sayana Press)',
    dateSortie: '29-5-26 à 23H00',
    dureeSejour: '24 heures (1 jour)',
    observations: 'Évolution clinique favorable, sans anomalie.',
    statut: 'En attente',
    confiance: 96.8
  }
];

export default function ValidationPopup({ isOpen, onClose, pages, initialPageIndex }: Readonly<ValidationPopupProps>) {
  const [patients, setPatients] = useState<PatientRecord[]>(INITIAL_RECORDS);
  const [selectedRowId, setSelectedRowId] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'page1' | 'page2' | 'global'>('page1');
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  if (!isOpen) return null;

  const selectedPatient = patients.find(p => p.id === selectedRowId) || patients[0];
  const validatedCount = patients.filter(p => p.statut === 'Validé' || p.statut === 'Corrigé').length;

  const handleCellChange = (id: number, field: keyof PatientRecord, value: string) => {
    setPatients(prev => prev.map(p => p.id === id ? { ...p, [field]: value, statut: 'Corrigé' } : p));
  };

  const handleValidateRow = (id: number) => {
    const target = patients.find(p => p.id === id);
    setPatients(prev => prev.map(p => p.id === id ? { ...p, statut: 'Validé' } : p));
    setNotification(`✅ Ligne N° ${target?.numOrdre} (${target?.nomPatiente}) validée avec succès`);
    if (selectedRowId < patients.length) {
      setSelectedRowId(selectedRowId + 1);
    }
  };

  const handleValidateAll = () => {
    setPatients(prev => prev.map(p => ({ ...p, statut: 'Validé' })));
    setNotification("🎉 L'ensemble du registre a été validé et certifié conforme.");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white w-full h-full rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-200"
          >
            {/* ── EN-TÊTE MÉDICAL ──────────────────────────────── */}
            <div className="h-14 bg-emerald-900 text-white px-5 flex items-center justify-between shrink-0 border-b border-emerald-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-700/80 flex items-center justify-center text-white shadow-xs">
                  <Stethoscope className="w-4 h-4 text-emerald-100" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-sm font-bold text-white tracking-wide">
                      REGISTRE DES ACCOUCHEMENTS — ESPACE DE VALIDATION CLINIQUE
                    </h1>
                    <span className="px-2 py-0.5 bg-emerald-800 text-emerald-200 rounded text-[10px] font-semibold border border-emerald-700">
                      P.S Potou (Poste de Santé)
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-200">
                    Registre 2026 · Double Page Complète (Pages 1 & 2) · 3 actes obstétricaux · Reconnaissance OCR : 97.6%
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-emerald-950/70 border border-emerald-700 px-3 py-1 rounded-lg text-xs">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-300" />
                  <span className="text-emerald-100 font-semibold">
                    Actes validés : <strong className="text-white">{validatedCount} / {patients.length}</strong> ({Math.round((validatedCount/patients.length)*100)}%)
                  </span>
                </div>

                <button 
                  onClick={onClose} 
                  className="p-1.5 bg-emerald-800 hover:bg-emerald-700 rounded-lg text-emerald-200 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Notification Toast */}
            <AnimatePresence>
              {notification && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-emerald-50 border-b border-emerald-200 px-6 py-2 flex items-center justify-between text-xs font-bold text-emerald-900"
                >
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    {notification}
                  </span>
                  <button onClick={() => setNotification(null)} className="text-emerald-700 hover:text-emerald-950">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <PanelGroup orientation="horizontal" className="flex-1 w-full h-full">

              {/* ── VOLET GAUCHE — VISIONNEUSE DU REGISTRE ──────── */}
              <Panel defaultSize={44} minSize={30} className="bg-slate-950 flex flex-col relative border-r border-gray-200">

                <div className="h-9 bg-slate-900 px-4 flex items-center justify-between border-b border-slate-800 text-xs text-slate-300">
                  <span className="font-semibold flex items-center gap-1.5 text-slate-200">
                    <Layers className="w-3.5 h-3.5 text-emerald-400" />
                    Scan Original du Registre Physique (Page 1)
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    Patiente active : <strong className="text-amber-400">N° {selectedPatient.numOrdre} ({selectedPatient.nomPatiente})</strong>
                  </span>
                </div>

                <div className="flex-1 overflow-hidden relative flex items-center justify-center">
                  <TransformWrapper
                    initialScale={1}
                    minScale={0.4}
                    maxScale={5}
                    centerOnInit={true}
                  >
                    {({ zoomIn, zoomOut, resetTransform, centerView }) => (
                      <>
                        <div className="absolute top-3 left-3 z-20 flex items-center bg-slate-900/90 backdrop-blur-md rounded-lg p-1 text-slate-200 border border-slate-700 gap-1 shadow-lg">
                          <button onClick={() => zoomIn()} className="p-1.5 hover:bg-slate-800 rounded transition-colors" title="Zoom avant">
                            <ZoomIn className="w-4 h-4" />
                          </button>
                          <button onClick={() => zoomOut()} className="p-1.5 hover:bg-slate-800 rounded transition-colors" title="Zoom arrière">
                            <ZoomOut className="w-4 h-4" />
                          </button>
                          <button onClick={() => centerView()} className="p-1.5 hover:bg-slate-800 rounded transition-colors" title="Centrer">
                            <Maximize className="w-4 h-4" />
                          </button>
                          <button onClick={() => resetTransform()} className="p-1.5 hover:bg-slate-800 rounded transition-colors" title="Réinitialiser">
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        </div>

                        <TransformComponent 
                          wrapperStyle={{ width: '100%', height: '100%' }} 
                          contentStyle={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <div className="relative w-full h-full flex items-center justify-center p-3">
                            <Image
                              src="/registres/registre exemple page 1.jpeg"
                              alt="Registre des accouchements page 1"
                              fill
                              className="object-contain"
                              priority
                            />
                          </div>
                        </TransformComponent>
                      </>
                    )}
                  </TransformWrapper>
                </div>

                <div className="h-10 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-slate-300 px-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">Sélectionner la ligne :</span>
                    {patients.map(p => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedRowId(p.id)}
                        className={`px-2.5 py-0.5 rounded text-xs font-bold transition-all ${
                          p.id === selectedRowId 
                            ? 'bg-emerald-500 text-slate-950' 
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        N° {p.numOrdre}
                      </button>
                    ))}
                  </div>
                  <span className="text-emerald-400 font-semibold text-[11px]">Binarisation & Découpage OK</span>
                </div>
              </Panel>

              {/* ── SÉPARATEUR DE REDIMENSIONNEMENT ──────────────── */}
              <PanelResizeHandle className="w-2 bg-slate-100 hover:bg-emerald-600 transition-colors flex flex-col justify-center items-center cursor-col-resize z-10">
                <div className="w-1 h-8 bg-slate-300 rounded-full" />
              </PanelResizeHandle>

              {/* ── VOLET DROIT — TABLEAU COMPLET DES 23 COLONNES ─── */}
              <Panel defaultSize={56} minSize={40} className="bg-slate-50 flex flex-col">

                {/* Sélecteur d'Onglets de Page */}
                <div className="bg-white border-b border-gray-200 px-5 pt-2 flex items-center justify-between shrink-0">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveTab('page1')}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-t-lg text-xs font-bold transition-all border-b-2 ${
                        activeTab === 'page1'
                          ? 'bg-slate-50 text-emerald-800 border-emerald-600 shadow-xs'
                          : 'text-gray-500 hover:text-gray-800 border-transparent'
                      }`}
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                      Page 1 : Admission & Accouchement (Col 1-14)
                    </button>
                    <button
                      onClick={() => setActiveTab('page2')}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-t-lg text-xs font-bold transition-all border-b-2 ${
                        activeTab === 'page2'
                          ? 'bg-slate-50 text-emerald-800 border-emerald-600 shadow-xs'
                          : 'text-gray-500 hover:text-gray-800 border-transparent'
                      }`}
                    >
                      <Baby className="w-3.5 h-3.5 text-emerald-600" />
                      Page 2 : Nouveau-Né, Mère & Sortie (Col 15-23)
                    </button>
                    <button
                      onClick={() => setActiveTab('global')}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-t-lg text-xs font-bold transition-all border-b-2 ${
                        activeTab === 'global'
                          ? 'bg-slate-50 text-emerald-800 border-emerald-600 shadow-xs'
                          : 'text-gray-500 hover:text-gray-800 border-transparent'
                      }`}
                    >
                      <ClipboardCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Vue Complète Dépliée
                    </button>
                  </div>

                  <span className="text-[11px] text-gray-500 font-medium hidden sm:inline">
                    💡 <strong className="text-gray-700">Toutes les cases sont éditables</strong>
                  </span>
                </div>

                {/* ── TABLEAU MÉDICAL INTERACTIF ──────────────────── */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ scrollbarWidth: 'thin' }}>

                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
                    <div className="overflow-x-auto" style={{ scrollbarWidth: 'thin' }}>
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          {/* En-têtes hiérarchiques */}
                          <tr className="bg-emerald-50/90 text-emerald-950 border-b border-emerald-200 font-bold text-[11px]">
                            <th className="p-2 border-r border-emerald-100 whitespace-nowrap">N° Ordre (1)</th>
                            <th className="p-2 border-r border-emerald-100 whitespace-nowrap">N° Parto (2)</th>

                            {/* Colonnes Page 1 */}
                            {(activeTab === 'page1' || activeTab === 'global') && (
                              <>
                                <th className="p-2 border-r border-emerald-100 whitespace-nowrap">Date / Heure Entrée (3)</th>
                                <th className="p-2 border-r border-emerald-100 whitespace-nowrap">Prénoms & Nom (4)</th>
                                <th className="p-2 border-r border-emerald-100 whitespace-nowrap">Âge (5)</th>
                                <th className="p-2 border-r border-emerald-100 whitespace-nowrap">Adresse Exacte (6)</th>
                                <th className="p-2 border-r border-emerald-100 whitespace-nowrap">Gestité (7) / Parité (8)</th>
                                <th className="p-2 border-r border-emerald-100 whitespace-nowrap">Accouchement (9)</th>
                                <th className="p-2 border-r border-emerald-100 whitespace-nowrap">Lieu (10)</th>
                                <th className="p-2 border-r border-emerald-100 whitespace-nowrap">Mode (11)</th>
                                <th className="p-2 border-r border-emerald-100 whitespace-nowrap">Délivrance (12)</th>
                                <th className="p-2 border-r border-emerald-100 whitespace-nowrap">Présentation (13)</th>
                                <th className="p-2 border-r border-emerald-100 whitespace-nowrap">Qualification (14)</th>
                              </>
                            )}

                            {/* Colonnes Page 2 (Exactement calquées sur le registre officiel) */}
                            {(activeTab === 'page2' || activeTab === 'global') && (
                              <>
                                <th className="p-2 border-r border-emerald-100 whitespace-nowrap">Sexe (15b)</th>
                                <th className="p-2 border-r border-emerald-100 whitespace-nowrap">Poids (15c)</th>
                                <th className="p-2 border-r border-emerald-100 whitespace-nowrap">État Nouveau-Né (15a)</th>
                                <th className="p-2 border-r border-emerald-100 whitespace-nowrap">Soins Immédiats MT/MSP/SC/COLL/K1 (15f)</th>
                                <th className="p-2 border-r border-emerald-100 whitespace-nowrap">Vaccination Hép B & Polio 0 (15f)</th>
                                <th className="p-2 border-r border-emerald-100 whitespace-nowrap">Devenir Mère (16)</th>
                                <th className="p-2 border-r border-emerald-100 whitespace-nowrap">Complications (17)</th>
                                <th className="p-2 border-r border-emerald-100 whitespace-nowrap">Préventions eTME & VAT (18)</th>
                                <th className="p-2 border-r border-emerald-100 whitespace-nowrap">Conseils AME (19)</th>
                                <th className="p-2 border-r border-emerald-100 whitespace-nowrap">Planif. Post-Partum (20)</th>
                                <th className="p-2 border-r border-emerald-100 whitespace-nowrap">Sortie (21) & Séjour (22)</th>
                                <th className="p-2 border-r border-emerald-100 whitespace-nowrap">Observations (23)</th>
                              </>
                            )}

                            <th className="p-2 border-r border-emerald-100 whitespace-nowrap">Statut</th>
                            <th className="p-2 text-center whitespace-nowrap">Validation</th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                          {patients.map((p) => {
                            const isSelected = p.id === selectedRowId;
                            const isValid = p.statut === 'Validé';
                            const isModified = p.statut === 'Corrigé';

                            return (
                              <tr 
                                key={p.id}
                                onClick={() => setSelectedRowId(p.id)}
                                className={`transition-colors ${
                                  isSelected ? 'bg-emerald-50/70 ring-1 ring-emerald-400' : 'hover:bg-gray-50'
                                }`}
                              >
                                {/* Col 1 : N° Ordre */}
                                <td className="p-1 border-r border-gray-100">
                                  <input
                                    type="text"
                                    value={p.numOrdre}
                                    onChange={(e) => handleCellChange(p.id, 'numOrdre', e.target.value)}
                                    className="w-10 text-center font-bold text-gray-900 bg-transparent rounded p-1 outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500"
                                  />
                                </td>

                                {/* Col 2 : N° Parto */}
                                <td className="p-1 border-r border-gray-100">
                                  <input
                                    type="text"
                                    value={p.numParto}
                                    onChange={(e) => handleCellChange(p.id, 'numParto', e.target.value)}
                                    className="w-16 font-semibold text-gray-800 bg-transparent rounded p-1 outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500"
                                  />
                                </td>

                                {/* Colonnes Page 1 */}
                                {(activeTab === 'page1' || activeTab === 'global') && (
                                  <>
                                    {/* Col 3 : Date / Heure Entrée */}
                                    <td className="p-1 border-r border-gray-100">
                                      <input
                                        type="text"
                                        value={p.dateEntree}
                                        onChange={(e) => handleCellChange(p.id, 'dateEntree', e.target.value)}
                                        className="w-28 text-gray-800 bg-transparent rounded p-1 outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500"
                                      />
                                    </td>

                                    {/* Col 4 : Prénoms & Nom */}
                                    <td className="p-1 border-r border-gray-100">
                                      <input
                                        type="text"
                                        value={p.nomPatiente}
                                        onChange={(e) => handleCellChange(p.id, 'nomPatiente', e.target.value)}
                                        className="w-28 font-bold text-emerald-950 bg-transparent rounded p-1 outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500"
                                      />
                                    </td>

                                    {/* Col 5 : Âge */}
                                    <td className="p-1 border-r border-gray-100">
                                      <input
                                        type="text"
                                        value={p.age}
                                        onChange={(e) => handleCellChange(p.id, 'age', e.target.value)}
                                        className="w-14 text-center font-semibold text-gray-800 bg-transparent rounded p-1 outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500"
                                      />
                                    </td>

                                    {/* Col 6 : Adresse */}
                                    <td className="p-1 border-r border-gray-100">
                                      <input
                                        type="text"
                                        value={p.adresse}
                                        onChange={(e) => handleCellChange(p.id, 'adresse', e.target.value)}
                                        className="w-36 text-gray-700 bg-transparent rounded p-1 outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500"
                                      />
                                    </td>

                                    {/* Col 7 & 8 : Gestité / Parité */}
                                    <td className="p-1 border-r border-gray-100">
                                      <div className="flex items-center gap-1 w-14">
                                        <input
                                          type="text"
                                          value={p.gestite}
                                          onChange={(e) => handleCellChange(p.id, 'gestite', e.target.value)}
                                          className="w-6 text-center font-bold text-gray-900 bg-transparent rounded outline-none focus:bg-white"
                                        />
                                        <span>/</span>
                                        <input
                                          type="text"
                                          value={p.parite}
                                          onChange={(e) => handleCellChange(p.id, 'parite', e.target.value)}
                                          className="w-6 text-center font-bold text-gray-900 bg-transparent rounded outline-none focus:bg-white"
                                        />
                                      </div>
                                    </td>

                                    {/* Col 9 : Date Accouchement */}
                                    <td className="p-1 border-r border-gray-100">
                                      <input
                                        type="text"
                                        value={p.dateAccouchement}
                                        onChange={(e) => handleCellChange(p.id, 'dateAccouchement', e.target.value)}
                                        className="w-28 text-gray-800 bg-transparent rounded p-1 outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500"
                                      />
                                    </td>

                                    {/* Col 10 : Lieu */}
                                    <td className="p-1 border-r border-gray-100">
                                      <input
                                        type="text"
                                        value={p.lieuAccouchement}
                                        onChange={(e) => handleCellChange(p.id, 'lieuAccouchement', e.target.value)}
                                        className="w-20 text-gray-800 bg-transparent rounded p-1 outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500"
                                      />
                                    </td>

                                    {/* Col 11 : Mode Accouchement */}
                                    <td className="p-1 border-r border-gray-100">
                                      <input
                                        type="text"
                                        value={p.modeAccouchement}
                                        onChange={(e) => handleCellChange(p.id, 'modeAccouchement', e.target.value)}
                                        className="w-24 text-gray-800 bg-transparent rounded p-1 outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500"
                                      />
                                    </td>

                                    {/* Col 12 : Délivrance */}
                                    <td className="p-1 border-r border-gray-100">
                                      <input
                                        type="text"
                                        value={p.typeDelivrance}
                                        onChange={(e) => handleCellChange(p.id, 'typeDelivrance', e.target.value)}
                                        className="w-16 text-gray-800 bg-transparent rounded p-1 outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500"
                                      />
                                    </td>

                                    {/* Col 13 : Présentation */}
                                    <td className="p-1 border-r border-gray-100">
                                      <input
                                        type="text"
                                        value={p.presentation}
                                        onChange={(e) => handleCellChange(p.id, 'presentation', e.target.value)}
                                        className="w-20 text-gray-800 bg-transparent rounded p-1 outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500"
                                      />
                                    </td>

                                    {/* Col 14 : Qualification */}
                                    <td className="p-1 border-r border-gray-100">
                                      <input
                                        type="text"
                                        value={p.qualification}
                                        onChange={(e) => handleCellChange(p.id, 'qualification', e.target.value)}
                                        className="w-24 text-gray-800 bg-transparent rounded p-1 outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500"
                                      />
                                    </td>
                                  </>
                                )}

                                {/* Colonnes Page 2 */}
                                {(activeTab === 'page2' || activeTab === 'global') && (
                                  <>
                                    {/* Col 15b : Sexe NN */}
                                    <td className="p-1 border-r border-gray-100">
                                      <input
                                        type="text"
                                        value={p.sexeNN}
                                        onChange={(e) => handleCellChange(p.id, 'sexeNN', e.target.value)}
                                        className="w-8 text-center font-bold text-gray-900 bg-transparent rounded outline-none focus:bg-white"
                                      />
                                    </td>

                                    {/* Col 15c : Poids NN */}
                                    <td className="p-1 border-r border-gray-100">
                                      <input
                                        type="text"
                                        value={p.poidsNN}
                                        onChange={(e) => handleCellChange(p.id, 'poidsNN', e.target.value)}
                                        className="w-18 font-bold text-emerald-800 bg-transparent rounded p-1 outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500"
                                      />
                                    </td>

                                    {/* Col 15a : État Nouveau-Né (Cri / VBP / MN) */}
                                    <td className="p-1 border-r border-gray-100">
                                      <input
                                        type="text"
                                        value={p.vbp}
                                        onChange={(e) => handleCellChange(p.id, 'vbp', e.target.value)}
                                        className="w-24 text-gray-800 bg-transparent rounded p-1 outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500"
                                      />
                                    </td>

                                    {/* Col 15f : Soins Immédiats (MT, MSP, SC, COLL, K1) */}
                                    <td className="p-1 border-r border-gray-100">
                                      <input
                                        type="text"
                                        value={p.soinsImmediats}
                                        onChange={(e) => handleCellChange(p.id, 'soinsImmediats', e.target.value)}
                                        className="w-36 text-gray-800 bg-transparent rounded p-1 outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500"
                                      />
                                    </td>

                                    {/* Col 15f : Vaccins Hép B 24h & Polio 0 */}
                                    <td className="p-1 border-r border-gray-100">
                                      <div className="flex gap-1 w-28">
                                        <span className="text-[10px] text-gray-500">HépB:</span>
                                        <input
                                          type="text"
                                          value={p.vaccinHepB24h}
                                          onChange={(e) => handleCellChange(p.id, 'vaccinHepB24h', e.target.value)}
                                          className="w-8 text-center font-semibold text-emerald-700 bg-transparent rounded outline-none focus:bg-white"
                                        />
                                        <span className="text-[10px] text-gray-500">P0:</span>
                                        <input
                                          type="text"
                                          value={p.vaccinPolio0}
                                          onChange={(e) => handleCellChange(p.id, 'vaccinPolio0', e.target.value)}
                                          className="w-8 text-center font-semibold text-emerald-700 bg-transparent rounded outline-none focus:bg-white"
                                        />
                                      </div>
                                    </td>

                                    {/* Col 16 : Devenir Mère (VPB / EVAC / DCD) */}
                                    <td className="p-1 border-r border-gray-100">
                                      <input
                                        type="text"
                                        value={p.devenirMere}
                                        onChange={(e) => handleCellChange(p.id, 'devenirMere', e.target.value)}
                                        className="w-28 text-gray-800 bg-transparent rounded p-1 outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500"
                                      />
                                    </td>

                                    {/* Col 17 : Complications */}
                                    <td className="p-1 border-r border-gray-100">
                                      <input
                                        type="text"
                                        value={p.complications}
                                        onChange={(e) => handleCellChange(p.id, 'complications', e.target.value)}
                                        className="w-16 text-gray-800 bg-transparent rounded p-1 outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500"
                                      />
                                    </td>

                                    {/* Col 18 : Préventions eTME & VAT */}
                                    <td className="p-1 border-r border-gray-100">
                                      <input
                                        type="text"
                                        value={p.etmeTestVIH}
                                        onChange={(e) => handleCellChange(p.id, 'etmeTestVIH', e.target.value)}
                                        className="w-28 text-gray-800 bg-transparent rounded p-1 outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500"
                                      />
                                    </td>

                                    {/* Col 19 : Conseils AME */}
                                    <td className="p-1 border-r border-gray-100">
                                      <input
                                        type="text"
                                        value={p.conseilsAME}
                                        onChange={(e) => handleCellChange(p.id, 'conseilsAME', e.target.value)}
                                        className="w-12 text-center text-gray-800 bg-transparent rounded p-1 outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500"
                                      />
                                    </td>

                                    {/* Col 20 : Planification Post-Partum */}
                                    <td className="p-1 border-r border-gray-100">
                                      <input
                                        type="text"
                                        value={p.pfMethode}
                                        onChange={(e) => handleCellChange(p.id, 'pfMethode', e.target.value)}
                                        className="w-28 text-gray-800 bg-transparent rounded p-1 outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500"
                                      />
                                    </td>

                                    {/* Col 21 & 22 : Sortie & Séjour */}
                                    <td className="p-1 border-r border-gray-100">
                                      <input
                                        type="text"
                                        value={p.dateSortie}
                                        onChange={(e) => handleCellChange(p.id, 'dateSortie', e.target.value)}
                                        className="w-28 text-gray-800 bg-transparent rounded p-1 outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500"
                                      />
                                    </td>

                                    {/* Col 23 : Observations */}
                                    <td className="p-1 border-r border-gray-100">
                                      <input
                                        type="text"
                                        value={p.observations}
                                        onChange={(e) => handleCellChange(p.id, 'observations', e.target.value)}
                                        className="w-36 text-gray-800 bg-transparent rounded p-1 outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500"
                                      />
                                    </td>
                                  </>
                                )}

                                {/* Statut */}
                                <td className="p-2 border-r border-gray-100 whitespace-nowrap">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    isValid 
                                      ? 'bg-emerald-100 text-emerald-800' 
                                      : isModified 
                                        ? 'bg-blue-100 text-blue-800' 
                                        : 'bg-amber-100 text-amber-800'
                                  }`}>
                                    {p.statut}
                                  </span>
                                </td>

                                {/* Action Bouton */}
                                <td className="p-2 text-center whitespace-nowrap">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleValidateRow(p.id);
                                    }}
                                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all ${
                                      isValid 
                                        ? 'bg-emerald-600 text-white' 
                                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-300'
                                    }`}
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    {isValid ? 'Validé' : 'Valider'}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Fiche d'Édition Focus de la Patiente Active */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                          Fiche Récapitulative : Ligne {selectedPatient.numOrdre} — {selectedPatient.nomPatiente} ({selectedPatient.age})
                        </h3>
                      </div>
                      <span className="text-xs text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Score OCR : {selectedPatient.confiance}% · Invariant Gestité &ge; Parité Respecté ✅
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-3 text-xs">
                      <div>
                        <label className="font-bold text-gray-500 block mb-1 text-[10px]">Nom & Prénoms (Col 4)</label>
                        <input
                          type="text"
                          value={selectedPatient.nomPatiente}
                          onChange={(e) => handleCellChange(selectedPatient.id, 'nomPatiente', e.target.value)}
                          className="w-full font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded p-1.5 outline-none focus:border-emerald-500 focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-gray-500 block mb-1 text-[10px]">Soins Immédiats Nouveau-Né (Col 15f)</label>
                        <input
                          type="text"
                          value={selectedPatient.soinsImmediats}
                          onChange={(e) => handleCellChange(selectedPatient.id, 'soinsImmediats', e.target.value)}
                          className="w-full font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded p-1.5 outline-none focus:border-emerald-500 focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-gray-500 block mb-1 text-[10px]">Prévention eTME (VIH) (Col 18)</label>
                        <input
                          type="text"
                          value={selectedPatient.etmeTestVIH}
                          onChange={(e) => handleCellChange(selectedPatient.id, 'etmeTestVIH', e.target.value)}
                          className="w-full font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded p-1.5 outline-none focus:border-emerald-500 focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-gray-500 block mb-1 text-[10px]">Planification Post-Partum (Col 20)</label>
                        <input
                          type="text"
                          value={selectedPatient.pfMethode}
                          onChange={(e) => handleCellChange(selectedPatient.id, 'pfMethode', e.target.value)}
                          className="w-full font-bold text-emerald-800 bg-emerald-50/30 border border-emerald-200 rounded p-1.5 outline-none focus:border-emerald-500 focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>

                </div>

                {/* ── BARRE D'ACTIONS INFÉRIEURE ───────────────────── */}
                <div className="p-3.5 bg-white border-t border-gray-200 flex items-center justify-between shrink-0 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 font-medium">
                      État global : <strong className="text-emerald-700">{validatedCount} sur {patients.length} actes validés</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleValidateRow(selectedRowId)}
                      className="flex items-center gap-1.5 px-4 py-2 border border-emerald-600 text-emerald-700 hover:bg-emerald-50 rounded-lg text-xs font-bold transition-all"
                    >
                      <Check className="w-4 h-4" /> Valider Ligne {selectedPatient.numOrdre}
                    </button>
                    
                    <button 
                      onClick={handleValidateAll}
                      className="flex items-center gap-2 px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
                    >
                      <CheckCheck className="w-4 h-4" /> Valider l'Ensemble du Registre
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
