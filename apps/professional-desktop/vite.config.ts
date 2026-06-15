import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  clearScreen: false,
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 1421,
    strictPort: true,
    proxy: {
      // Same-origin rpc: the vite dev server is the single origin, so the
      // webview's `/rpc` calls (see @beep/agents-client Chat.atoms.ts SERVER_URL)
      // ride this proxy to the loopback bun sidecar on :3939 (server/main.ts
      // CHAT_SIDECAR_PORT default). Dev runs the sidecar via `bun run dev:sidecar`.
      "/rpc": {
        target: "http://127.0.0.1:3939",
        changeOrigin: true,
      },
      // Same-origin OTLP for the webview's effect-native exporter (the client
      // observability global layer in @beep/agents-client). Vite proxies it to
      // the standard OTel collector so the browser needs no CORS setup; without
      // a collector listening the export just fails silently.
      "/otlp": {
        target: "http://localhost:4318",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/otlp/, ""),
      },
    },
  },
  envPrefix: ["VITE_", "TAURI_"],
});
