import { describe, expect, it } from "@effect/vitest"
import { FileSystem, Path } from "effect"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import { NodeFileSystem, NodePath, NodeTerminal } from "@effect/platform-node"
import { ChildProcessSpawner } from "effect/unstable/process"
import { TestConsole } from "effect/testing"
import { Command } from "effect/unstable/cli"
import { FsUtilsLive, findRepoRoot } from "@beep/repo-utils"
import { createPackageCommand } from "../src/commands/create-package.js"

// ---------------------------------------------------------------------------
// Test layers
// ---------------------------------------------------------------------------

const BaseLayers = Layer.mergeAll(
  NodeFileSystem.layer,
  NodePath.layer,
  NodeTerminal.layer,
  TestConsole.layer,
  Layer.mock(ChildProcessSpawner.ChildProcessSpawner)({}),
)

const TestLayers = FsUtilsLive.pipe(Layer.provideMerge(BaseLayers))

const run = Command.runWith(createPackageCommand, { version: "0.0.0" })

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("create-package command", () => {
  it.effect("should dry-run a library package", () =>
    Effect.gen(function* () {
      yield* run(["test-lib", "--dry-run"])

      const logs = yield* TestConsole.logLines
      const output = logs.map(String)

      expect(output).toContain("[dry-run] Would create package @beep/test-lib (type: library)")
      expect(output.some((l) => l.includes("package.json"))).toBe(true)
      expect(output.some((l) => l.includes("tsconfig.json"))).toBe(true)
      expect(output.some((l) => l.includes("src/index.ts"))).toBe(true)
      expect(output.some((l) => l.includes("test/.gitkeep"))).toBe(true)
    }).pipe(Effect.provide(TestLayers)),
  )

  it.effect("should dry-run a tool package", () =>
    Effect.gen(function* () {
      yield* run(["test-tool", "--type", "tool", "--dry-run"])

      const logs = yield* TestConsole.logLines
      const output = logs.map(String)

      expect(output).toContain("[dry-run] Would create package @beep/test-tool (type: tool)")
    }).pipe(Effect.provide(TestLayers)),
  )

  it.effect("should dry-run an app package", () =>
    Effect.gen(function* () {
      yield* run(["test-app", "--type", "app", "--dry-run"])

      const logs = yield* TestConsole.logLines
      const output = logs.map(String)

      expect(output).toContain("[dry-run] Would create package @beep/test-app (type: app)")
      // App packages go in apps/ directory
      expect(output.some((l) => l.includes("/apps/test-app"))).toBe(true)
    }).pipe(Effect.provide(TestLayers)),
  )

  it.effect("should create package files in a temp directory", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem
      const path = yield* Path.Path

      // Create a unique temp package name to avoid collisions
      const pkgName = `_test-pkg-${Date.now()}`
      const repoRoot = yield* findRepoRoot()
      const outputDir = path.join(repoRoot, "tooling", pkgName)

      try {
        yield* run([pkgName])

        const logs = yield* TestConsole.logLines
        const output = logs.map(String)

        expect(output.some((l) => l.includes(`Created package @beep/${pkgName}`))).toBe(true)
        expect(output.some((l) => l.includes("package.json"))).toBe(true)

        // Verify files were actually created
        const pkgJsonExists = yield* fs.exists(path.join(outputDir, "package.json"))
        expect(pkgJsonExists).toBe(true)

        const tsconfigExists = yield* fs.exists(path.join(outputDir, "tsconfig.json"))
        expect(tsconfigExists).toBe(true)

        const indexExists = yield* fs.exists(path.join(outputDir, "src", "index.ts"))
        expect(indexExists).toBe(true)

        // Read and verify package.json content
        const pkgJsonContent = yield* fs.readFileString(path.join(outputDir, "package.json"))
        const pkgJson = JSON.parse(pkgJsonContent)
        expect(pkgJson.name).toBe(`@beep/${pkgName}`)
        expect(pkgJson.dependencies.effect).toBe("catalog:")

        // Read and verify index.ts content
        const indexContent = yield* fs.readFileString(path.join(outputDir, "src", "index.ts"))
        expect(indexContent).toContain(`@beep/${pkgName}`)
        expect(indexContent).toContain("@since 0.0.0")
        expect(indexContent).toContain("VERSION")
      } finally {
        // Cleanup: remove the temp package directory
        yield* fs.remove(outputDir, { recursive: true }).pipe(
          Effect.orElseSucceed(() => void 0),
        )
      }
    }).pipe(Effect.provide(TestLayers)),
  )

  it.effect("should fail when directory already exists", () =>
    Effect.gen(function* () {
      // "cli" already exists in tooling/
      const result = yield* Effect.exit(run(["cli"]))
      // The command should fail
      expect(result._tag).toBe("Failure")
    }).pipe(Effect.provide(TestLayers)),
  )
})
