import "bun";

import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { appRouter, auth, createTRPCContext } from "@repo/api";

import type { env } from "./libs/env";

export const trpc = trpcServer({
  router: appRouter,
  createContext: async (_, c) => {
    return createTRPCContext({
      headers: c.req.raw.headers,
      auth,
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

app.get("/", (c) => c.text("OK"));

app.on(["POST", "GET"], "/auth/*", async (c) => {
  return auth.handler(c.req.raw);
});

app.use("/v0.1/*", trpc);

export default app;
