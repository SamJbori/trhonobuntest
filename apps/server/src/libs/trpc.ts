import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import z, { ZodError } from "zod/v4";

import type { AuthData } from "./auth.js";
import { postRouter } from "../routers/posts.js";
import { auth } from "./auth.js";
import { collection, fromDBToRecord, fromDBToRecords } from "./db.js";
import { env } from "./env.js";
import { storage } from "./s3.js";

export const createTRPCContext = async ({
  headers,
  // resHeaders,
}: {
  headers: Headers;
}) => {
  const session = (await auth.api.getSession({ headers })) as AuthData;

  return {
    user: session?.user,
    collection,
    storage,
    fromDBToRecord,
    fromDBToRecords,
    headers,
    // resHeaders,
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
  const start = Date.now();

  const result = await next();

  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});

/**
 * Public (unauthed) procedure
 */
export const publicProcedure = t.procedure.use(trpcMiddleware);

/**
 * Protected (anonymous authentication) procedure
 */
export const anonymousProcedure = publicProcedure.use(({ ctx, next }) => {
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
export const loggedinProcedure = publicProcedure.use(({ ctx, next }) => {
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
 * Coming from server
 */
export const serverProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const headerToken = ctx.headers.get("X-Hamem-Token");
  if (!headerToken) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  if (env.SERVER_TOKEN !== headerToken) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next();
});

/**
 * Platform Admins Only
 */
export const adminProcedure = publicProcedure.use(({ ctx, next }) => {
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

export const appRouter = createTRPCRouter({
  post: postRouter(publicProcedure),
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
