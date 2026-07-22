"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Loader2 } from "lucide-react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Petit délai pour permettre à Zustand de rehydrater l'état depuis le localStorage
    const timeout = setTimeout(() => {
      if (!isAuthenticated && pathname.startsWith('/dashboard')) {
        router.replace('/');
      }
      setIsChecking(false);
    }, 100); // 100ms est suffisant pour l'hydratation

    return () => clearTimeout(timeout);
  }, [isAuthenticated, router, pathname]);

  if (isChecking) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-gray-500 font-medium animate-pulse">Vérification de l'accès...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, we return null to avoid flashing protected content before redirect completes
  if (!isAuthenticated && pathname.startsWith('/dashboard')) {
    return null;
  }

  return <>{children}</>;
}
