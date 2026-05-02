import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Capacitor iOS: compiled Next.js bundle copy + framework vendor JS
    "ios/App/App/public/**",
    "ios/App/CapApp-SPM/**",
    // Root-level Gemini probe scripts (not part of the Next.js app)
    "list-models.js",
    "test-local.js",
    "test-models.js",
    "test-streaming.js",
  ]),
]);

export default eslintConfig;
