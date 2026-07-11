"use client";

import React from 'react';
import PageHeader from '@/components/ui/PageHeader';

export default function DataValidationPage() {
  return (
    <div className="h-full flex flex-col gap-4 p-5 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
      {/* Dynamic Header */}
      <PageHeader title="Data Validation" />

      {/* Placeholder content */}
      <div className="flex-1 bg-white rounded-xl border border-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-medium text-gray-800 mb-2">Data Validation Module</h2>
          <p className="text-sm text-gray-500">Interface de validation des données à venir...</p>
        </div>
      </div>
    </div>
  );
}
