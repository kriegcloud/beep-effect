import * as nodePath from "node:path";
import { codegenCommand } from "@beep/repo-cli/commands/codegen";
import { FsUtilsLive } from "@beep/repo-utils";
import { NodeFileSystem, NodePath, NodeTerminal } from "@effect/platform-node";
import { describe, expect, it } from "@effect/vitest";
import { FileSystem, Path } from "effect";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Str from "effect/String";
import { TestConsole } from "effect/testing";
import { Command } from "effect/unstable/cli";
import { ChildProcessSpawner } from "effect/unstable/process";

// ---------------------------------------------------------------------------
// Test layers
// ---------------------------------------------------------------------------

const BaseLayers = Layer.mergeAll(
  NodeFileSystem.layer,
  NodePath.layer,
  NodeTerminal.layer,
  TestConsole.layer,
  Layer.mock(ChildProcessSpawner.ChildProcessSpawner)({})
);

const TestLayers = FsUtilsLive.pipe(Layer.provideMerge(BaseLayers));
const withTestLayers =
  <A, E, R, Args extends ReadonlyArray<unknown>>(fn: (...args: Args) => Effect.Effect<A, E, R>) =>
  (...args: Args) =>
    fn(...args).pipe(Effect.provide(TestLayers));

const run = Command.runWith(codegenCommand, { version: "0.0.0" });
const REPO_UTILS_DIR = nodePath.resolve(__dirname, "../../repo-utils");

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("codegen command", () => {
  it.effect(
    "should dry-run barrel generation for repo-utils",
    withTestLayers(
      Effect.fn(function* () {
        yield* run(["--package", REPO_UTILS_DIR, "--dry-run"]);

        const logs = yield* TestConsole.logLines;
        const output = logs.map(String);

        // Should discover the known modules
        expect(output.some((l) => l.includes("FsUtils.ts"))).toBe(true);
        expect(output.some((l) => l.includes("Graph.ts"))).toBe(true);
        expect(output.some((l) => l.includes("Root.ts"))).toBe(true);
        expect(output.some((l) => l.includes("schemas/PackageJson.ts"))).toBe(true);

        // Dry run output should contain generated barrel content
        expect(output.some((l) => l.includes("--- Dry run: would generate the following ---"))).toBe(true);
        expect(output.some((l) => l.includes("export * from"))).toBe(true);
        expect(output.some((l) => l.includes("@since 0.0.0"))).toBe(true);
      })
    )
  );

  it.effect(
    "should discover modules in subdirectories",
    withTestLayers(
      Effect.fn(function* () {
        yield* run(["--package", REPO_UTILS_DIR, "--dry-run"]);

        const logs = yield* TestConsole.logLines;
        const output = logs.map(String);

        // Should find modules in errors/ and schemas/ subdirectories
        expect(output.some((l) => l.includes("errors/CyclicDependencyError.ts"))).toBe(true);
        expect(output.some((l) => l.includes("schemas/PackageJson.ts"))).toBe(true);
        expect(output.some((l) => l.includes("schemas/WorkspaceDeps.ts"))).toBe(true);
      })
    )
  );

  it.effect(
    "should generate barrel file in a temp package",
    withTestLayers(
      Effect.fn(function* () {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;

        // Create a temp directory with some .ts files
        const tmpDir = path.join(path.resolve("."), `_test-codegen-${Date.now()}`);

        try {
          yield* fs.makeDirectory(path.join(tmpDir, "src"), { recursive: true });

          // Write a minimal package.json
          yield* fs.writeFileString(
            path.join(tmpDir, "package.json"),
            JSON.stringify({ name: "@beep/test-codegen" }, null, 2)
          );

          // Write some TypeScript modules
          yield* fs.writeFileString(path.join(tmpDir, "src", "Foo.ts"), "export const foo = 42\n");
          yield* fs.writeFileString(path.join(tmpDir, "src", "Bar.ts"), "export const bar = 'hello'\n");

          // Run codegen (non-dry-run)
          yield* run(["--package", tmpDir]);

          // Verify the generated index.ts
          const indexContent = yield* fs.readFileString(path.join(tmpDir, "src", "index.ts"));

          expect(indexContent).toContain("Re-exports for @beep/test-codegen");
          expect(indexContent).toContain("@since 0.0.0");
          expect(indexContent).toContain('export * from "./Bar.js"');
          expect(indexContent).toContain('export * from "./Foo.js"');

          // Bar should come before Foo (alphabetical)
          const barIdx = O.getOrElse(O.fromUndefinedOr(Str.indexOf("./Bar.js")(indexContent)), () => -1);
          const fooIdx = O.getOrElse(O.fromUndefinedOr(Str.indexOf("./Foo.js")(indexContent)), () => -1);
          expect(barIdx).toBeLessThan(fooIdx);
        } finally {
          yield* fs.remove(tmpDir, { recursive: true }).pipe(Effect.orElseSucceed(() => void 0));
        }
      })
    )
  );

  it.effect(
    "should skip internal directories and test files",
    withTestLayers(
      Effect.fn(function* () {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;

        const tmpDir = path.join(path.resolve("."), `_test-codegen-skip-${Date.now()}`);

        try {
          yield* fs.makeDirectory(path.join(tmpDir, "src", "internal"), { recursive: true });

          yield* fs.writeFileString(
            path.join(tmpDir, "package.json"),
            JSON.stringify({ name: "@beep/test-skip" }, null, 2)
          );

          // Regular module
          yield* fs.writeFileString(path.join(tmpDir, "src", "Visible.ts"), "export const visible = true\n");

          // Internal module (should be skipped)
          yield* fs.writeFileString(path.join(tmpDir, "src", "internal", "secret.ts"), "export const secret = true\n");

          // Test file (should be skipped)
          yield* fs.writeFileString(path.join(tmpDir, "src", "Visible.test.ts"), "import { describe } from 'vitest'\n");

          // Run codegen (non-dry-run)
          yield* run(["--package", tmpDir]);

          const indexContent = yield* fs.readFileString(path.join(tmpDir, "src", "index.ts"));

          expect(indexContent).toContain('export * from "./Visible.js"');
          expect(indexContent).not.toContain("internal");
          expect(indexContent).not.toContain("secret");
          expect(indexContent).not.toContain(".test.");
        } finally {
          yield* fs.remove(tmpDir, { recursive: true }).pipe(Effect.orElseSucceed(() => void 0));
        }
      })
    )
  );

  it.effect(
    "should report when no exportable modules are found",
    withTestLayers(
      Effect.fn(function* () {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;

        const tmpDir = path.join(path.resolve("."), `_test-codegen-empty-${Date.now()}`);

        try {
          yield* fs.makeDirectory(path.join(tmpDir, "src"), { recursive: true });
          yield* fs.writeFileString(path.join(tmpDir, "src", "index.ts"), "// keep existing barrel\n");

          yield* fs.writeFileString(
            path.join(tmpDir, "package.json"),
            JSON.stringify({ name: "@beep/test-empty" }, null, 2)
          );

          yield* run(["--package", tmpDir]);

          const logs = (yield* TestConsole.logLines).map(String);
          expect(logs.some((line) => line.includes("No modules found to export."))).toBe(true);

          const indexContent = yield* fs.readFileString(path.join(tmpDir, "src", "index.ts"));
          expect(indexContent).toBe("// keep existing barrel\n");
        } finally {
          yield* fs.remove(tmpDir, { recursive: true }).pipe(Effect.orElseSucceed(() => void 0));
        }
      })
    )
  );

  it.effect(
    "should report error for missing src/ directory",
    withTestLayers(
      Effect.fn(function* () {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;

        const tmpDir = path.join(path.resolve("."), `_test-codegen-nosrc-${Date.now()}`);

        try {
          yield* fs.makeDirectory(tmpDir, { recursive: true });

          yield* run(["--package", tmpDir]);

          const errors = yield* TestConsole.errorLines;
          const errorOutput = errors.map(String);

          expect(errorOutput.some((l) => l.includes("No src/ directory found"))).toBe(true);
        } finally {
          yield* fs.remove(tmpDir, { recursive: true }).pipe(Effect.orElseSucceed(() => void 0));
        }
      })
    )
  );
});
