import react from "@vitejs/plugin-react";
import * as P from "effect/Predicate";
import { defineConfig } from "vite";

// cspell:words onwarn

export default defineConfig({
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      onwarn(warning, defaultHandler) {
        if (
          warning.code === "INVALID_ANNOTATION" &&
          P.isString(warning.id) &&
          warning.id.includes("node_modules/effect/dist/unstable/http/HttpRouter.js")
        ) {
          return;
        }
        defaultHandler(warning);
      },
    },
  },
  clearScreen: false,
  plugins: [react()],
  server: {
    port: 1420,
    strictPort: false,
  },
});
