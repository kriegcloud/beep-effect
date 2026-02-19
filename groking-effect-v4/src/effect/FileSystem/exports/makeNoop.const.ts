/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/FileSystem
 * Export: makeNoop
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/FileSystem.ts
 * Generated: 2026-02-19T04:14:13.237Z
 *
 * Overview:
 * Creates a no-op FileSystem implementation for testing purposes.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, FileSystem, PlatformError } from "effect"
 * 
 * // Create a test filesystem that only allows reading specific files
 * const testFs = FileSystem.makeNoop({
 *   readFileString: (path) => {
 *     if (path === "test-config.json") {
 *       return Effect.succeed("{\"test\": true}")
 *     }
 *     return Effect.fail(
 *       PlatformError.systemError({
 *         module: "FileSystem",
 *         method: "readFileString",
 *         kind: "NotFound",
 *         description: "File not found",
 *         pathOrDescriptor: path
 *       })
 *     )
 *   },
 *   exists: (path) => Effect.succeed(path === "test-config.json")
 * })
 * 
 * // Use in tests
 * const program = Effect.gen(function*() {
 *   const content = yield* testFs.readFileString("test-config.json")
 *   // Will succeed with mocked content
 * })
 * 
 * // Test with the no-op filesystem
 * const testProgram = Effect.provideService(
 *   program,
 *   FileSystem.FileSystem,
 *   testFs
 * )
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as FileSystemModule from "effect/FileSystem";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "makeNoop";
const exportKind = "const";
const moduleImportPath = "effect/FileSystem";
const sourceSummary = "Creates a no-op FileSystem implementation for testing purposes.";
const sourceExample = "import { Effect, FileSystem, PlatformError } from \"effect\"\n\n// Create a test filesystem that only allows reading specific files\nconst testFs = FileSystem.makeNoop({\n  readFileString: (path) => {\n    if (path === \"test-config.json\") {\n      return Effect.succeed(\"{\\\"test\\\": true}\")\n    }\n    return Effect.fail(\n      PlatformError.systemError({\n        module: \"FileSystem\",\n        method: \"readFileString\",\n        kind: \"NotFound\",\n        description: \"File not found\",\n        pathOrDescriptor: path\n      })\n    )\n  },\n  exists: (path) => Effect.succeed(path === \"test-config.json\")\n})\n\n// Use in tests\nconst program = Effect.gen(function*() {\n  const content = yield* testFs.readFileString(\"test-config.json\")\n  // Will succeed with mocked content\n})\n\n// Test with the no-op filesystem\nconst testProgram = Effect.provideService(\n  program,\n  FileSystem.FileSystem,\n  testFs\n)";
const moduleRecord = FileSystemModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleCallableProbe = Effect.gen(function* () {
  yield* Console.log("If the value is callable, run a zero-arg probe to observe behavior.");
  yield* probeNamedExportFunction({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🔎",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Runtime Shape Inspection",
      description: "Inspect module export count, runtime type, and formatted preview.",
      run: exampleRuntimeInspection
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe
    }
  ]
});

BunRuntime.runMain(program);
