import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  target: "esnext",
  outDir: "dist",
  external: [
    "effect",
    "@effect/platform",
    "@effect/platform-bun",
    "@effect/cli",
    "@effect/experimental",
    "@effect/rpc",
    "@anthropic-ai/claude-agent-sdk",
    "zod"
  ]
})
