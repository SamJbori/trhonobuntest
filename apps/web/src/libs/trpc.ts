import type { AppRouter } from "@repo/api";
import {
  createTRPCReact,
  httpBatchStreamLink,
  loggerLink,
} from "@trpc/react-query";
import SuperJSON from "superjson";

import { env } from "./env";

export const api = createTRPCReact<AppRouter>();

let trpcClientSingleton: ReturnType<typeof api.createClient> | undefined =
  undefined;

const createTRPCClient = () =>
  api.createClient({
    links: [
      loggerLink({
        enabled: (op) =>
          env.NODE_ENV === "development" ||
          (op.direction === "down" && op.result instanceof Error),
      }),
      httpBatchStreamLink({
        transformer: SuperJSON,
        url: `${env.NEXT_PUBLIC_API_URL}/v0.1`,
        fetch: (url: URL | RequestInfo, options: RequestInit | undefined) => {
          return fetch(url, {
            ...options,
            credentials: "include",
          });
        },
        headers: () => {
          const headers = new Headers();
          headers.set("x-trpc-source", "nextjs-react");
          return headers;
        },
      }),
    ],
  });

export const getTRPCClient = () => {
  // Server: always make a new query client
  if (typeof window === "undefined") {
    return createTRPCClient();
  }
  // Browser: use singleton pattern to keep the same query client
  trpcClientSingleton ??= createTRPCClient();

  return trpcClientSingleton;
};
