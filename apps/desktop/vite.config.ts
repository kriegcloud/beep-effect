import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const desktopManualChunks = (id: string): string | undefined => {
  if (id.includes("/node_modules/react-dom/") || id.includes("/node_modules/react/")) {
    return "react";
  }

  if (id.includes("/node_modules/@tanstack/")) {
    return "router";
  }

  if (id.includes("/node_modules/effect/") || id.includes("/node_modules/@effect/")) {
    return "effect";
  }

  if (id.includes("/packages/common/") || id.includes("/packages/repo-memory/") || id.includes("/packages/runtime/")) {
    return "beep-runtime";
  }

  return undefined;
};

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: desktopManualChunks,
      },
    },
  },
  server: {
    host: "127.0.0.1",
    port: 4173,
    proxy: {
      "/api": {
        target: "https://repo-memory-sidecar.localhost:1355",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
