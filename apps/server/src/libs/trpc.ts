import { trpcServer } from "@hono/trpc-server";

import { createTRPCContext } from "@repo/api";

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
const appRouterPromise = import("@repo/api").then((mod) => mod.appRouter);

export const trpc = trpcServer({
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  router: await appRouterPromise,
  createContext: (_, c) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return createTRPCContext({
      headers: c.req.raw.headers,
    });
  },
  onError: ({ path, error }) => {
    console.error(`❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`);
  },
});
