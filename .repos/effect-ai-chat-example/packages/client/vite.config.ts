import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import * as path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [TanStackRouterVite({ autoCodeSplitting: true }), tailwindcss(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
