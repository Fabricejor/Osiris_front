"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function Providers({ children }: { readonly children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // Les données sont fraîches pendant 1 minute
            refetchOnWindowFocus: false, // Ne pas refetch quand on revient sur la fenêtre (moins agressif)
            // Réessayer une fois les erreurs réseau / 5xx, jamais les 4xx :
            // un 401/403/404 donnera la même réponse (cf. apiClient : `error.status`).
            retry: (failureCount, error) => {
              const status = (error as { status?: number } | null)?.status;
              if (status !== undefined && status >= 400 && status < 500) return false;
              return failureCount < 1;
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
