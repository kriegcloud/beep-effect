/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: acquireRelease
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.385Z
 *
 * Overview:
 * This function constructs a scoped resource from an `acquire` and `release` `Effect` value.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Exit } from "effect"
 * 
 * // Simulate a resource that needs cleanup
 * interface FileHandle {
 *   readonly path: string
 *   readonly content: string
 * }
 * 
 * // Acquire a file handle
 * const acquire = Effect.gen(function*() {
 *   yield* Console.log("Opening file")
 *   return { path: "/tmp/file.txt", content: "file content" }
 * })
 * 
 * // Release the file handle
 * const release = (handle: FileHandle, exit: Exit.Exit<unknown, unknown>) =>
 *   Console.log(
 *     `Closing file ${handle.path} with exit: ${
 *       Exit.isSuccess(exit) ? "success" : "failure"
 *     }`
 *   )
 * 
 * // Create a scoped resource
 * const resource = Effect.acquireRelease(acquire, release)
 * 
 * // Use the resource within a scope
 * const program = Effect.scoped(
 *   Effect.gen(function*() {
 *     const handle = yield* resource
 *     yield* Console.log(`Using file: ${handle.path}`)
 *     return handle.content
 *   })
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
import * as EffectModule from "effect/Effect";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "acquireRelease";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "This function constructs a scoped resource from an `acquire` and `release` `Effect` value.";
const sourceExample = "import { Console, Effect, Exit } from \"effect\"\n\n// Simulate a resource that needs cleanup\ninterface FileHandle {\n  readonly path: string\n  readonly content: string\n}\n\n// Acquire a file handle\nconst acquire = Effect.gen(function*() {\n  yield* Console.log(\"Opening file\")\n  return { path: \"/tmp/file.txt\", content: \"file content\" }\n})\n\n// Release the file handle\nconst release = (handle: FileHandle, exit: Exit.Exit<unknown, unknown>) =>\n  Console.log(\n    `Closing file ${handle.path} with exit: ${\n      Exit.isSuccess(exit) ? \"success\" : \"failure\"\n    }`\n  )\n\n// Create a scoped resource\nconst resource = Effect.acquireRelease(acquire, release)\n\n// Use the resource within a scope\nconst program = Effect.scoped(\n  Effect.gen(function*() {\n    const handle = yield* resource\n    yield* Console.log(`Using file: ${handle.path}`)\n    return handle.content\n  })\n)";
const moduleRecord = EffectModule as Record<string, unknown>;

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
