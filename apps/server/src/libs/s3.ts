import type { S3Options } from "bun";
import { s3 } from "bun";

export const storage = {
  delete: (file: string, options: S3Options) => s3.delete(file, options),
  // add other operations as needed
};
