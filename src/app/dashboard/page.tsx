"use client";

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
  return (
    <div className="h-full flex flex-col gap-4 p-5 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
      {/* Header */}
      <PageHeader title="Dashboard" />

      {/* Stats Cards */}
      <div className="flex-shrink-0">
        <StatsCards />
      </div>

      {/* Row 2: Processing Efficiency (left) + OCR Performance & Confidence (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-shrink-0">
        <div className="h-[300px]">
          <ProcessingEfficiencyChart />
        </div>
        <div className="grid grid-cols-2 gap-4 h-[300px]">
          <OcrPerformanceChart />
          <OcrConfidenceChart />
        </div>
      </div>

      {/* Row 3: Data Processing Volumes + Activity Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-shrink-0">
        <div className="lg:col-span-2 h-[280px]">
          <DataProcessingVolumes />
        </div>
        <div className="h-[280px]">
          <ActivityHeatmap />
        </div>
      </div>

      {/* Row 4: Operator Comparison + Validation Status + Operator Activity Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-shrink-0">
        <div className="h-[300px]">
          <OperatorPerformanceComparison />
        </div>
        <div className="h-[300px]">
          <ValidationStatusDistribution />
        </div>
        <div className="h-[300px]">
          <OperatorActivityHeatmap />
        </div>
      </div>

      {/* Row 5: Operator Efficiency Table */}
      <div className="flex-shrink-0 min-h-[320px]">
        <OperatorEfficiencyTable />
      </div>
    </div>
  );
}
