"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';

interface TopBarContextType {
  breadcrumb: React.ReactNode | null;
  setBreadcrumb: (node: React.ReactNode | null) => void;
}

const TopBarContext = createContext<TopBarContextType>({
  breadcrumb: null,
  setBreadcrumb: () => {},
});

export function TopBarProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [breadcrumb, setBreadcrumbState] = useState<React.ReactNode | null>(null);
  const setBreadcrumb = useCallback((node: React.ReactNode | null) => {
    setBreadcrumbState(node);
  }, []);

  return (
    <TopBarContext.Provider value={{ breadcrumb, setBreadcrumb }}>
      {children}
    </TopBarContext.Provider>
  );
}

export function useTopBar() {
  return useContext(TopBarContext);
}
