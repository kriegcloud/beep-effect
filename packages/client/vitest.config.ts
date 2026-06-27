import * as path from "node:path";
import { mergeConfig } from "vitest/config";
import shared from "../../vitest.shared.js";

export default mergeConfig(shared, {
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    alias: {
      "@/": path.resolve(__dirname, "./src") + "/",
    },
  },
});
