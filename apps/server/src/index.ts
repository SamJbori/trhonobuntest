import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import type { env } from "./libs/env.js";
import { auth } from "./libs/auth.js";
import { createTRPCContext } from "./libs/trpc.js";
import { appRouter } from "./routers/routers.js";

import "bun";

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
  return auth.handler(c.req.raw);
});

export default app;
