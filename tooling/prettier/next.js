/** @typedef {import("prettier-plugin-tailwindcss").PluginOptions} TailwindConfig */
/** @typedef {import("@ianvs/prettier-plugin-sort-imports").PluginConfig} SortImportsConfig */
/** @typedef {import("prettier").Config} PrettierConfig */

import baseConfig from "./base.js";

/** @type { PrettierConfig | SortImportsConfig | TailwindConfig } */
const config = {
  ...baseConfig,
  plugins: [...(baseConfig.plugins ?? []), "prettier-plugin-tailwindcss"],
  tailwindFunctions: ["cn", "cva"],
};

export default config;
