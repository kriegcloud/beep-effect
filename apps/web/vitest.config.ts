import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@beep/web": path.resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "node",
    include: ["apps/web/test/**/*.test.{ts,tsx}"],
  },
});
