import type { ReactNode } from "react";
import { useMemo } from "react";
import useAnonymousLogin from "@/src/hooks/useAnonymousLogin";
import { QueryClientProvider } from "@tanstack/react-query";

import { getQueryClient } from "../../libs/tquery";
import { api, getTRPCClient } from "../../libs/trpc";

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const isSession = useAnonymousLogin();

  const queryClient = useMemo(() => getQueryClient(), []);

  if (!isSession) return <div />;

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={getTRPCClient()} queryClient={queryClient}>
        {children}
      </api.Provider>
    </QueryClientProvider>
  );
};
