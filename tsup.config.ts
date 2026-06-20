import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    clean: true,
    minify: true,
    target: "es2020",
  },
  {
    entry: ["src/index.ts"],
    format: ["iife"],
    globalName: "DOMElemJS",
    outExtension: () => ({ js: ".browser.js" }),
    sourcemap: true,
    minify: true,
    target: "es2020",
  },
]);
