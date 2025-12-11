import "server-only";

import type { AppRouter } from "@repo/api";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import SuperJSON from "superjson";

import { env } from "./env";

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${env.NEXT_PUBLIC_API_URL}/v0.1`,
      transformer: SuperJSON,
      headers: () => {
        const headers = new Headers();
        headers.set("x-trpc-source", "rsc");
        headers.set("X-Server-Token", env.SERVER_TOKEN);
        return headers;
      },
    }),
  ],
});
