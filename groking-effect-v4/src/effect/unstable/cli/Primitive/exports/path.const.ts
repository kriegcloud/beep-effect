/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/Primitive
 * Export: path
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/Primitive.ts
 * Generated: 2026-02-19T04:50:46.367Z
 *
 * Overview:
 * Creates a primitive that validates and resolves file system paths.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import { Primitive } from "effect/unstable/cli"
 *
 * const program = Effect.gen(function*() {
 *   // Parse a file path that must exist
 *   const filePrimitive = Primitive.path("file", true)
 *   const filePath = yield* filePrimitive.parse("./package.json")
 *   console.log(filePath) // Absolute path to package.json
 *
 *   // Parse a directory path
 *   const dirPrimitive = Primitive.path("directory", false)
 *   const dirPath = yield* dirPrimitive.parse("./src")
 *   console.log(dirPath) // Absolute path to src directory
 *
 *   // Parse any path type
 *   const anyPrimitive = Primitive.path("either", false)
 *   const anyPath = yield* anyPrimitive.parse("./some/path")
 *   console.log(anyPath) // Absolute path
 * })
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as PrimitiveModule from "effect/unstable/cli/Primitive";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "path";
const exportKind = "const";
const moduleImportPath = "effect/unstable/cli/Primitive";
const sourceSummary = "Creates a primitive that validates and resolves file system paths.";
const sourceExample =
  'import { Effect } from "effect"\nimport { Primitive } from "effect/unstable/cli"\n\nconst program = Effect.gen(function*() {\n  // Parse a file path that must exist\n  const filePrimitive = Primitive.path("file", true)\n  const filePath = yield* filePrimitive.parse("./package.json")\n  console.log(filePath) // Absolute path to package.json\n\n  // Parse a directory path\n  const dirPrimitive = Primitive.path("directory", false)\n  const dirPath = yield* dirPrimitive.parse("./src")\n  console.log(dirPath) // Absolute path to src directory\n\n  // Parse any path type\n  const anyPrimitive = Primitive.path("either", false)\n  const anyPath = yield* anyPrimitive.parse("./some/path")\n  console.log(anyPath) // Absolute path\n})';
const moduleRecord = PrimitiveModule as Record<string, unknown>;

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
  examples: [
    {
      title: "Runtime Shape Inspection",
      description: "Inspect module export count, runtime type, and formatted preview.",
      run: exampleRuntimeInspection,
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe,
    },
  ],
});

BunRuntime.runMain(program);
