import React from 'react';

export type FolderStatus = 'pending' | 'validated' | 'rejected' | 'anomaly';

interface FolderUIProps {
  name: string;
  filesCount: number;
  size: string;
  status: FolderStatus;
  isSelected?: boolean;
  onClick?: () => void;
}

const STATUS_CONFIG: Record<FolderStatus, {
  back: string;
  front: string;
  frontGradient: string;
  hoverShadow: string;
  tabBg: string;
  label: string;
  labelColor: string;
  labelBg: string;
}> = {
  pending: {
    back: 'bg-amber-600',
    front: 'bg-gradient-to-t from-amber-500 to-amber-400',
    frontGradient: 'group-hover:shadow-[inset_0_20px_40px_#fbbf24,_inset_0_-20px_40px_#d97706]',
    hoverShadow: 'group-hover:shadow-[0_20px_40px_rgba(217,119,6,.25)]',
    tabBg: 'bg-amber-600',
    label: 'Pending',
    labelColor: 'text-amber-700',
    labelBg: 'bg-amber-100',
  },
  validated: {
    back: 'bg-emerald-700',
    front: 'bg-gradient-to-t from-emerald-500 to-emerald-400',
    frontGradient: 'group-hover:shadow-[inset_0_20px_40px_#34d399,_inset_0_-20px_40px_#059669]',
    hoverShadow: 'group-hover:shadow-[0_20px_40px_rgba(5,150,105,.25)]',
    tabBg: 'bg-emerald-700',
    label: 'Validated',
    labelColor: 'text-emerald-700',
    labelBg: 'bg-emerald-100',
  },
  rejected: {
    back: 'bg-red-600',
    front: 'bg-gradient-to-t from-red-500 to-red-400',
    frontGradient: 'group-hover:shadow-[inset_0_20px_40px_#f87171,_inset_0_-20px_40px_#dc2626]',
    hoverShadow: 'group-hover:shadow-[0_20px_40px_rgba(220,38,38,.25)]',
    tabBg: 'bg-red-600',
    label: 'Rejected',
    labelColor: 'text-red-700',
    labelBg: 'bg-red-100',
  },
  anomaly: {
    back: 'bg-blue-600',
    front: 'bg-gradient-to-t from-blue-500 to-blue-400',
    frontGradient: 'group-hover:shadow-[inset_0_20px_40px_#60a5fa,_inset_0_-20px_40px_#2563eb]',
    hoverShadow: 'group-hover:shadow-[0_20px_40px_rgba(37,99,235,.25)]',
    tabBg: 'bg-blue-600',
    label: 'Anomaly',
    labelColor: 'text-blue-700',
    labelBg: 'bg-blue-100',
  },
};

export default function FolderUI({ name, filesCount, size, status, isSelected, onClick }: Readonly<FolderUIProps>) {
  const cfg = STATUS_CONFIG[status];

  return (
    <button
      type="button"
      className={`group flex flex-col items-center w-full cursor-pointer rounded-2xl p-4 transition-all duration-200 ${
        isSelected
          ? 'bg-gray-100 ring-2 ring-primary/40'
          : 'hover:bg-gray-50'
      }`}
      onClick={onClick}
    >
      {/* Folder visual */}
      <div className="file relative w-full max-w-[180px] h-[120px] origin-bottom perspective-[1500px]">
        {/* Back of folder */}
        <div
          className={`${cfg.back} w-full h-full origin-top rounded-xl rounded-tl-none ${cfg.hoverShadow} transition-all ease duration-300 relative
            after:absolute after:content-[''] after:bottom-[99%] after:left-0 after:w-14 after:h-3 after:${cfg.back} after:rounded-t-xl
            before:absolute before:content-[''] before:top-[-11px] before:left-[52px] before:w-3 before:h-3 before:${cfg.back} before:[clip-path:polygon(0_35%,0%_100%,50%_100%);]`}
          style={{ ['--tw-folder-back' as string]: 'true' }}
        ></div>
        {/* Inner sheets */}
        <div className="absolute inset-1 bg-zinc-400 rounded-xl transition-all ease duration-300 origin-bottom select-none group-hover:transform-[rotateX(-20deg)]"></div>
        <div className="absolute inset-1 bg-zinc-300 rounded-xl transition-all ease duration-300 origin-bottom group-hover:transform-[rotateX(-30deg)]"></div>
        <div className="absolute inset-1 bg-zinc-200 rounded-xl transition-all ease duration-300 origin-bottom group-hover:transform-[rotateX(-38deg)]"></div>
        {/* Front of folder */}
        <div
          className={`absolute bottom-0 ${cfg.front} w-full h-[calc(100%-4px)] rounded-xl rounded-tr-none
            after:absolute after:content-[''] after:bottom-[99%] after:right-0 after:w-[calc(100%-55px)] after:h-[12px] after:rounded-t-xl
            before:absolute before:content-[''] before:top-[-8px] before:right-[calc(100%-59px)] before:size-2.5 before:[clip-path:polygon(100%_14%,50%_100%,100%_100%);]
            transition-all ease duration-300 origin-bottom flex items-end
            ${cfg.frontGradient}
            group-hover:transform-[rotateX(-46deg)_translateY(1px)]`}
          style={{
            ['--tw-after-bg' as string]: 'inherit',
            ['--tw-before-bg' as string]: 'inherit',
          }}
        ></div>
      </div>

      {/* Folder info */}
      <div className="w-full mt-3 space-y-1">
        <p className="text-sm font-semibold text-gray-800 truncate">{name}</p>
        <p className="text-xs text-gray-500">{filesCount} files</p>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-gray-400">{size}</span>
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${cfg.labelBg} ${cfg.labelColor}`}>
            {cfg.label}
          </span>
        </div>
      </div>
    </button>
  );
}
