import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import type { env } from "./libs/env.js";

import "bun";

import { appRouter } from "./libs/trpc.js";

const authPromise = import("./libs/auth.js").then((mod) => mod.auth);
const ctrpcCtxPromise = import("./libs/trpc.js").then(
  (mod) => mod.createTRPCContext,
);

export const trpc = trpcServer({
  router: appRouter,
  createContext: async (_, c) => {
    const createTRPCContext = await ctrpcCtxPromise;
    return createTRPCContext({
      headers: c.req.raw.headers,
    });
  },
  onError: ({ path, error }) => {
    console.error(`❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`);
  },
});

const app = new Hono<{ Bindings: typeof env }>({ strict: false });

app.use(logger());

app.use(
  "/*",
  cors({
    origin: (o) => o,
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "x-trpc-source",
      "trpc-accept",
      "x-captcha-response",
      "x-hamem-cache",
    ],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length", "X-Kuma-Revision"],
    maxAge: 86_400,
    credentials: true,
  }),
);

app.get("/test", (c) => c.text("OK"));

app.use("/v0.1/*", trpc);

app.on(["POST", "GET"], "/auth/*", async (c) => {
  const auth = await authPromise;
  return auth.handler(c.req.raw);
});

export default app;
