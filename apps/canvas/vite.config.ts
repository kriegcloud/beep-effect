import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  clearScreen: false,
  plugins: [react()],
  server: {
    port: 1422,
    strictPort: true,
  },
});
