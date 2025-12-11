"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";
import useAnonymousLogin from "@hooks/useAnonymousLogin";
import { env } from "@libs/env";
import { getQueryClient } from "@libs/tquery";
import { api, getTRPCClient } from "@libs/trpc";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const isSession = useAnonymousLogin();

  const queryClient = useMemo(() => getQueryClient(), []);

  if (!isSession) return <div />;

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={getTRPCClient()} queryClient={queryClient}>
        {children}
        {env.NODE_ENV === "development" && <ReactQueryDevtools />}
      </api.Provider>
    </QueryClientProvider>
  );
};
