import "bun";

import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import type { env } from "./libs/env";
import { auth } from "./libs/auth";
import { appRouter, createTRPCContext } from "./libs/trpc";

// const authPromise = import("./libs/auth.js").then((mod) => mod.auth);

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

app.use(
  "/v0.1/*",
  trpcServer({
    router: appRouter,
    createContext: async (_, c) => {
      const headers = c.req.raw.headers;
      return createTRPCContext({
        headers,
        authData: await auth.api.getSession({ headers }),
      });
    },
    onError: ({ path, error }) => {
      console.error(
        `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
      );
    },
  }),
);

app.on(["POST", "GET"], "/auth/*", async (c) => {
  return auth.handler(c.req.raw);
});

export default app;
