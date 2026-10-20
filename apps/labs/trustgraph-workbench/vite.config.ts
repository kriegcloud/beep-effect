import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { appViteConfig } from "../../../vite.shared.ts";

export default defineConfig({
  ...appViteConfig(import.meta.url),
  plugins: [react()],
});
