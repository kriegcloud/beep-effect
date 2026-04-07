import { fileURLToPath, URL } from "node:url";
import { theme } from "@beep/ui/themes/theme";
import { pigment } from "@pigment-css/vite-plugin";
import react from "@vitejs/plugin-react";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { defineConfig, type PluginOption } from "vite";

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

// Pigment currently resolves against its own Vite type tree, so we keep the
// plugin list boxed as a Vite PluginOption and let Vite flatten it at runtime.
const pigmentPluginOptions = O.some<unknown>(pigment(pigmentConfig)).pipe(
  O.filter((plugins): plugins is PluginOption => P.not(S.is(S.Array(S.Null)))(plugins)),
  O.match({
    onNone: A.empty<PluginOption>,
    onSome: (plugins) => [plugins],
  })
);

export default defineConfig({
  plugins: [...pigmentPluginOptions, react()],
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
