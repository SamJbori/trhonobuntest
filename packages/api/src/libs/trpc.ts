import type { DBCollections } from "@repo/validators/db";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { MongoClient } from "mongodb";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import z, { ZodError } from "zod/v4";

import type { AuthData } from "./auth";
import { postRouter } from "../routers/posts";
import { dbCollection, fromDBToMany, fromDBToSingle } from "./db";
import { env } from "./env";
import { storage } from "./s3";

export const createTRPCContext = ({
  headers,
  authData,
  dbClient,
}: {
  headers: Headers;
  authData: AuthData;
  dbClient: MongoClient;
}) => {
  const collection = (collectionName: DBCollections) =>
    dbCollection(dbClient, collectionName);
  return {
    user: authData?.user,
    headers,
    dbClient,
    collection,
    fromDBToSingle,
    fromDBToMany,
    storage,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter: ({ shape, error }) => ({
    ...shape,
    data: {
      ...shape.data,
      zodError:
        error.cause instanceof ZodError
          ? z.flattenError(error.cause as ZodError<Record<string, unknown>>)
          : null,
    },
  }),
});

export const createTRPCRouter = t.router;

const trpcMiddleware = t.middleware(async ({ next, path }) => {
  if (env.NODE_ENV === "development") {
    const start = Date.now();
    const result = await next();
    const end = Date.now();
    console.log(`[TRPC] ${path} took ${end - start}ms to execute`);
    return result;
  }

  const result = await next();
  return result;
});

/**
 * Public (unauthed) procedure
 */
const publicProcedure = t.procedure.use(trpcMiddleware);

/**
 * Protected (anonymous authentication) procedure
 */
const anonymousProcedure = publicProcedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      // infers the `session` as non-nullable
      user: ctx.user,
      userId: ctx.user.id,
    },
  });
});

/**
 * Protected (LoggedIn users) procedure
 */
const loggedinProcedure = publicProcedure.use(({ ctx, next }) => {
  if (!ctx.user || ctx.user.isAnonymous) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      // infers the `session` as non-nullable
      user: ctx.user,
      userId: ctx.user.id,
    },
  });
});

/**
 * Platform Admins Only
 */
const adminProcedure = publicProcedure.use(({ ctx, next }) => {
  if (!ctx.user?.isAdmin) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      // infers the `session` and `token`  as non-nullable
      user: { ...ctx.user },
      userId: ctx.user.id,
    },
  });
});

/**
 * Coming from server
 */
const serverProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const headerToken = ctx.headers.get("X-Hamem-Token");
  if (!headerToken) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  if (env.SERVER_TOKEN !== headerToken) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next();
});

const procedures = {
  router: t.router,
  publicProcedure,
  anonymousProcedure,
  loggedinProcedure,
  adminProcedure,
  serverProcedure,
};

export type TRPCProcedures = typeof procedures;

export const appRouter = createTRPCRouter({
  post: postRouter(procedures),
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Inference helpers for input types
 * @example
 * type PostByIdInput = RouterInputs['post']['byId']
 *      ^? { id: number }
 **/
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helpers for output types
 * @example
 * type AllPostsOutput = RouterOutputs['post']['all']
 *      ^? Post[]
 **/
export type RouterOutputs = inferRouterOutputs<AppRouter>;
