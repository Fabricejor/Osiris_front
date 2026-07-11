import React from 'react';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface PageHeaderProps {
  title: string;
}

export default function PageHeader({ title }: PageHeaderProps) {
  const currentDate = format(new Date(), 'MMM d, yyyy');

  return (
    <div className="flex items-center justify-between flex-shrink-0">
      <h1 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h1>
      <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 shadow-sm cursor-default">
        <Calendar className="w-3.5 h-3.5 text-gray-500" />
        <span className="font-medium">{currentDate}</span>
      </div>
    </div>
  );
}
