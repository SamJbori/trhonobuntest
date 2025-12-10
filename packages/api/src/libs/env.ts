import { createEnv } from "@t3-oss/env-core";
import { z } from "zod/v4";

export const apiSchema = {
  MONGODB_URI: z.url(),
  CLOUDFLARE_TURNSTILE_SECRET_KEY: z.string().min(6),
  SERVER_TOKEN: z.string().min(32),
};

export const env = createEnv({
  shared: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
  },
  server: apiSchema,
  /**
   * What object holds the environment variables at runtime. This is usually
   * `Bun.env` or `process.env` or `import.meta.env`.
   *
   * Using `process.env` for Typecheck support with dotenv VS plugin
   */
  runtimeEnv: process.env, // or Bun.env, prefer process for Typecheck support with dotenv plugin
  /**
   * By default, this library will feed the environment variables directly to
   * the Zod validator.
   *
   * This means that if you have an empty string for a value that is supposed
   * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
   * it as a type mismatch violation. Additionally, if you have an empty string
   * for a value that is supposed to be a string with a default value (e.g.
   * `DOMAIN=` in an ".env" file), the default value will never be applied.
   *
   * In order to solve these issues, we recommend that all new projects
   * explicitly specify this option as true.
   */
  emptyStringAsUndefined: true,
  //   skipValidation: process.env.NODE_ENV === "development",
});
