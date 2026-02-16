import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [TanStackRouterVite({ autoCodeSplitting: true }), react(), tailwindcss(), tsconfigPaths()],
  server: {
    port: 5173,
  },
  build: {
    target: "esnext",
    minify: "esbuild",
    sourcemap: true,
    rollupOptions: {
      external: ["crypto"],
      output: {
        sourcemapIgnoreList: (relativeSourcePath) => relativeSourcePath.includes("node_modules"),
        manualChunks: {
          react: ["react", "react-dom", "react/jsx-runtime"],
          effect: ["effect", "@effect/platform", "@effect/rpc", "@effect/platform-browser"],
          ui: [
            "@radix-ui/react-checkbox",
            "@radix-ui/react-collapsible",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-label",
            "@radix-ui/react-scroll-area",
            "@radix-ui/react-slot",
            "class-variance-authority",
            "clsx",
            "tailwind-merge",
            "sonner",
          ],
          tanstack: ["@tanstack/react-router"],
          lucide: ["lucide-react"],
        },
      },
    },
  },
  envDir: "../../",
});
