import { createEnv } from "@t3-oss/env-core";
import { z } from "zod/v4";

import { apiSchema } from "@repo/api";

const appSchema = { ...apiSchema };

export const env = createEnv({
  shared: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
  },
  server: apiSchema.shape, // ← convert merged Zod object to shape for createEnv
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  skipValidation: false,
});
