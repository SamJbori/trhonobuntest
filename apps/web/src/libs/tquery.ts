import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from "@tanstack/react-query";
import SuperJSON from "superjson";

import { env } from "./env";

declare global {
  interface Window {
    __TANSTACK_QUERY_CLIENT__: // eslint-disable-next-line @typescript-eslint/consistent-type-imports
      import("@tanstack/query-core").QueryClient | undefined;
  }
}

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 1_800_1000, // Half hour
      },
      dehydrate: {
        serializeData: SuperJSON.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
      hydrate: {
        deserializeData: SuperJSON.deserialize,
      },
    },
  });

let clientQueryClientSingleton: QueryClient | undefined = undefined;

export const getQueryClient = () => {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return createQueryClient();
  }
  // Browser: use singleton pattern to keep the same query client
  clientQueryClientSingleton ??= createQueryClient();

  window.__TANSTACK_QUERY_CLIENT__ =
    env.NODE_ENV === "development" ? clientQueryClientSingleton : undefined;
  return clientQueryClientSingleton;
};
