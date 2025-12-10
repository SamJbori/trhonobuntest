import { createEnv } from "@t3-oss/env-core";
import { z } from "zod/v4";

export const env = createEnv({
  shared: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
  },
  server: {
    MONGODB_URI: z.url(),
    CLOUDFLARE_TURNSTILE_SECRET_KEY: z.string().min(6),
    SERVER_TOKEN: z.string().min(32),
  }, // ← convert merged Zod object to shape for createEnv
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  skipValidation: false,
});
