import type { IPost } from "@repo/validators/post";

import { publicProcedure } from "../libs/trpc";

export const postRouter = (x: typeof publicProcedure) => ({
  getPost: x.query(
    () =>
      ({
        id: "1",
        title: "Greatness",
        body: "With Bun + NextJS + Hono + tRPC, comes great responsibility",
        likes: 999,
      }) satisfies IPost,
  ),
});
