import { trpcServer } from "@hono/trpc-server";

import { appRouter, createTRPCContext } from "@repo/api";

export const trpc = trpcServer({
  router: appRouter,
  createContext: (_, c) => {
    return createTRPCContext({
      headers: c.req.raw.headers,
    });
  },
  onError: ({ path, error }) => {
    console.error(`❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`);
  },
});
