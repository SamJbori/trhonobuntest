import type { IPost } from "@repo/validators/post";

import { createTRPCRouter, publicProcedure } from "../libs/trpc";

export const postRouter = createTRPCRouter({
  getPost: publicProcedure.query(
    () =>
      ({
        id: "1",
        title: "Greatness",
        body: "With Bun + NextJS + Hono + tRPC, comes great responsibility",
        likes: 999,
      }) satisfies IPost,
  ),
});
