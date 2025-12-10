import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import "bun";

import { auth } from "@repo/api";

import type { env } from "./env.js";

// import { trpc } from "./libs/trpc.js";

const app = new Hono<{ Bindings: typeof env }>();

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

// app.use("/v0.1/*", trpc);

app.on(["POST", "GET"], "/auth/*", (c) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  return auth.handler(c.req.raw);
});

export default app;
