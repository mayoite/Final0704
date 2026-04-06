import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: [
      "apps/cad-suite/src/**/*.test.{ts,tsx}"
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["apps/cad-suite/src/**/*.ts", "apps/cad-suite/src/**/*.tsx"],
      exclude: ["**/__tests__/**", "**/*.test.tsx", "**/*.test.ts"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@cad": path.resolve(__dirname, "./apps/cad-suite/src")
    },
  },
});
