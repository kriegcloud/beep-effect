import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "")
      }
    }
  },
  resolve: {
    alias: {
      "@": "/src"
    }
  },
  // Optimize dependencies - include Effect packages for proper bundling
  optimizeDeps: {
    include: [
      "effect",
      "@effect/platform",
      "@effect/platform-browser",
      "@effect/experimental"
    ]
  },
  // Build configuration
  build: {
    rollupOptions: {
      // Mark node-only modules as external to avoid bundling
      external: [
        /^node:/,
        "crypto"
      ]
    }
  },
  // Define globals for node polyfills
  define: {
    // Provide crypto.createHash shim for modules that import it
    // In browser, these should not be called - they're only in server-side code paths
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development")
  }
})
