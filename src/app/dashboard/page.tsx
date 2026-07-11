"use client";

import { useState } from "react";
import { Maximize, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import StatsCards from "@/components/features/dashboard/StatsCards";
import ProcessingEfficiencyChart from "@/components/features/dashboard/ProcessingEfficiencyChart";
import OcrPerformanceChart from "@/components/features/dashboard/OcrPerformanceChart";
import OcrConfidenceChart from "@/components/features/dashboard/OcrConfidenceChart";
import ActivityHeatmap from "@/components/features/dashboard/ActivityHeatmap";
import DataProcessingVolumes from "@/components/features/dashboard/DataProcessingVolumes";
import OperatorEfficiencyTable from "@/components/features/dashboard/OperatorEfficiencyTable";
import OperatorPerformanceComparison from "@/components/features/dashboard/OperatorPerformanceComparison";
import ValidationStatusDistribution from "@/components/features/dashboard/ValidationStatusDistribution";
import OperatorActivityHeatmap from "@/components/features/dashboard/OperatorActivityHeatmap";
import PageHeader from "@/components/ui/PageHeader";

export default function DashboardPage() {
  const [expandedWidget, setExpandedWidget] = useState<{ id: string, node: React.ReactNode } | null>(null);

  const wrapChart = (id: string, node: React.ReactNode) => (
    <motion.div layoutId={`chart-wrapper-${id}`} className="relative group h-full w-full">
      <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <div className="p-1.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-md text-gray-600 shadow-sm">
          <Maximize className="w-3.5 h-3.5" />
        </div>
      </div>
      <div 
        className="h-full w-full cursor-pointer transition-transform duration-300 hover:scale-[1.01] rounded-xl"
        onClick={() => setExpandedWidget({ id, node })}
      >
        <div className="h-full w-full pointer-events-auto">
          {node}
        </div>
      </div>
    </motion.div>
  );

  return (
    <>
      <div className="h-full flex flex-col gap-4 p-5 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
        {/* Header */}
        <PageHeader title="Dashboard" />

        {/* Stats Cards */}
        <div className="shrink-0">
          <StatsCards />
        </div>

        {/* Row 2: Processing Efficiency (left) + OCR Performance & Confidence (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 shrink-0">
          <div className="h-[300px]">
            {wrapChart('processing-efficiency', <ProcessingEfficiencyChart />)}
          </div>
          <div className="grid grid-cols-2 gap-4 h-[300px]">
            {wrapChart('ocr-performance', <OcrPerformanceChart />)}
            {wrapChart('ocr-confidence', <OcrConfidenceChart />)}
          </div>
        </div>

        {/* Row 3: Data Processing Volumes + Activity Heatmap */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 shrink-0">
          <div className="lg:col-span-2 h-[280px]">
            {wrapChart('data-volumes', <DataProcessingVolumes />)}
          </div>
          <div className="h-[280px]">
            {wrapChart('activity-heatmap', <ActivityHeatmap />)}
          </div>
        </div>

        {/* Row 4: Operator Comparison + Validation Status + Operator Activity Heatmap */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 shrink-0">
          <div className="h-[300px]">
            {wrapChart('operator-comparison', <OperatorPerformanceComparison />)}
          </div>
          <div className="h-[300px]">
            {wrapChart('validation-status', <ValidationStatusDistribution />)}
          </div>
          <div className="h-[300px]">
            {wrapChart('operator-activity', <OperatorActivityHeatmap />)}
          </div>
        </div>

        {/* Row 5: Operator Efficiency Table */}
        <div className="shrink-0 min-h-[320px]">
          <OperatorEfficiencyTable />
        </div>
      </div>

      <AnimatePresence>
        {expandedWidget && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-12">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm cursor-pointer"
              onClick={() => setExpandedWidget(null)}
            />
            <motion.div 
              layoutId={`chart-wrapper-${expandedWidget.id}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
              className="relative w-full h-full max-w-7xl max-h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col z-10 overflow-hidden"
            >
              <div className="p-3 border-b border-gray-100 flex justify-end bg-gray-50/50 shrink-0">
                <button 
                  onClick={() => setExpandedWidget(null)}
                  className="p-2 bg-white border border-gray-200 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-gray-500 shadow-sm transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 p-6 overflow-hidden [&>div]:!border-transparent [&>div]:!shadow-none [&>div]:!rounded-none">
                {expandedWidget.node}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
