import { fileURLToPath, URL } from "node:url";
import { theme } from "@beep/ui/themes/theme";
import { pigment } from "@pigment-css/vite-plugin";
import react from "@vitejs/plugin-react";
import * as P from "effect/Predicate";
import * as Str from "effect/String";
import { defineConfig } from "vite";

const pigmentConfig = {
  theme,
  transformLibraries: ["@mui/material"],
};
const manualChunks = (id: string): string | undefined => {
  if (P.or(Str.includes("/node_modules/react-dom/"), Str.includes("/node_modules/react/"))(id)) {
    return "react";
  }

  if (Str.includes("/node_modules/@tanstack/")(id)) {
    return "router";
  }

  if (P.or(Str.includes("/node_modules/effect/"), Str.includes("/node_modules/@effect/"))(id)) {
    return "effect";
  }

  return undefined;
};

export default defineConfig({
  plugins: [pigment(pigmentConfig), react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    rolldownOptions: {
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
