import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const manualChunks = (id: string): string | undefined => {
  if (id.includes("/node_modules/react-dom/") || id.includes("/node_modules/react/")) {
    return "react";
  }

  if (id.includes("/node_modules/@tanstack/")) {
    return "router";
  }

  if (id.includes("/node_modules/effect/") || id.includes("/node_modules/@effect/")) {
    return "effect";
  }

  return undefined;
};

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks,
      },
    },
  },
  server: {
    host: "127.0.0.1",
    port: 4173,
    proxy: {
      "/api": {
        target: "https://editor-sidecar.localhost:1355",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
