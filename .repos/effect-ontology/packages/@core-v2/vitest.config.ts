import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    globals: true,
    setupFiles: ["./test/setup.ts"],

    // Process pool configuration to prevent orphaned processes
    // Use threads with Bun for better performance and cleanup
    pool: "threads",
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: 4,
        minThreads: 1,
        isolate: true,
        useAtomics: true // Better for cleanup
      }
    },

    // Timeouts to prevent hanging processes
    testTimeout: 30_000, // 30 seconds per test
    hookTimeout: 10_000, // 10 seconds for hooks
    teardownTimeout: 10_000, // 10 seconds for teardown

    // Force cleanup of resources
    restoreMocks: true,
    clearMocks: true,
    mockReset: true,

    // Ensure tests exit cleanly
    forceRerunTriggers: [
      "**/vitest.config.*/**",
      "**/vite.config.*/**"
    ],

    // File watcher settings
    watchExclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/coverage/**"
    ]
  }
})
