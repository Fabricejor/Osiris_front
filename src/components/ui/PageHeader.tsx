"use client";

import React, { useEffect } from 'react';
import { useTopBar } from './TopBarContext';
import { useTranslation } from '@/hooks/useTranslation';

interface PageHeaderProps {
  title: string;
  children?: React.ReactNode;
}

export default function PageHeader({ title, children }: Readonly<PageHeaderProps>) {
  const { setBreadcrumb } = useTopBar();
  const { t } = useTranslation();
  const translationKey = title.toLowerCase().replace(' ', '_') as any;
  const translatedTitle = t(translationKey) || title;

  useEffect(() => {
    setBreadcrumb(
      <div className="flex items-center gap-2 min-w-0">
        <h1 className="text-sm font-bold text-gray-900 tracking-tight whitespace-nowrap">{translatedTitle}</h1>
        {children}
      </div>
    );
    return () => setBreadcrumb(null);
  }, [translatedTitle, children, setBreadcrumb]);

  // No longer renders anything inline — content is in the TopBar
  return null;
}
