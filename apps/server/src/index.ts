import "bun";

import type { Auth } from "@repo/api";
import { trpcServer } from "@hono/trpc-server";
import { env } from "~libs/env";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { createMiddleware } from "hono/factory";
import { logger } from "hono/logger";
import { MongoClient } from "mongodb";

import { appRouter, createTRPCContext, initAuth } from "@repo/api";

let DBClientPromise: Promise<MongoClient> | undefined;

const getDBClientPromise = () => {
  DBClientPromise ??= new MongoClient(env.MONGODB_URI).connect();
  return DBClientPromise;
};

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
    ],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length", "X-Kuma-Revision"],
    maxAge: 86_400,
    credentials: true,
  }),
);

const middleware = createMiddleware<{
  Variables: {
    auth: Auth;
    dbClient: MongoClient;
  };
}>(async (c, next) => {
  const DBClient = await getDBClientPromise();
  const auth = initAuth(DBClient);
  c.set("auth", auth);
  c.set("dbClient", DBClient);
  await next();
});

app.use("/v0.1/*", middleware, async (c, n) => {
  const { auth, dbClient } = c.var;
  const trpc = trpcServer({
    router: appRouter,
    createContext: async (_, c) => {
      const headers = c.req.raw.headers;
      return createTRPCContext({
        headers,
        authData: await auth.api.getSession({ headers }),
        dbClient,
      });
    },
    onError: ({ path, error }) => {
      console.error(
        `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
      );
    },
  });
  return trpc(c, n);
});

app.on(["POST", "GET"], "/auth/*", middleware, async (c) => {
  return c.var.auth.handler(c.req.raw);
});

export default app;
