import path from "path"
import { defineConfig } from "vitest/config"

/**
 * Root-level vitest config (currently unused - tests run in packages)
 * 
 * Note: This config is kept for reference but not actively used.
 * Tests should be run from within packages/@core-v2 using its vitest.config.ts
 * 
 * To run tests: cd packages/@core-v2 && bun run test
 */
export default defineConfig({
  plugins: [],
  test: {
    setupFiles: [path.join(__dirname, "setupTests.ts")],
    include: ["./packages/*/test/**/*.test.ts"],
    globals: true,
    
    // Process pool configuration
    // Use threads with Bun for better performance and cleanup
    pool: "threads",
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: 4,
        minThreads: 1,
        isolate: true,
        useAtomics: true
      }
    },
    
    // Timeouts
    testTimeout: 30_000,
    hookTimeout: 10_000,
    teardownTimeout: 10_000,
    
    // Cleanup
    restoreMocks: true,
    clearMocks: true,
    mockReset: true
  },
  resolve: {
    alias: {}
  }
})
