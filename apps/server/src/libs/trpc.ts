// import { trpcServer } from "@hono/trpc-server";

// import { appRouter, createTRPCContext } from "@repo/api";

// export const trpc = trpcServer({
//   // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
//   router: appRouter,
//   createContext: (_, c) => {
//     // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
//     return createTRPCContext({
//       headers: c.req.raw.headers,
//     });
//   },
//   onError: ({ path, error }) => {
//     console.error(`❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`);
//   },
// });
