/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/Primitive
 * Export: PathType
 * Kind: type
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/Primitive.ts
 * Generated: 2026-02-19T04:14:24.523Z
 *
 * Overview:
 * Specifies the type of path validation to perform.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Primitive } from "effect/unstable/cli"
 *
 * // Only accept files
 * const filePath = Primitive.path("file", true)
 *
 * // Only accept directories
 * const dirPath = Primitive.path("directory", true)
 *
 * // Accept either files or directories
 * const anyPath = Primitive.path("either", false)
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as PrimitiveModule from "effect/unstable/cli/Primitive";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "PathType";
const exportKind = "type";
const moduleImportPath = "effect/unstable/cli/Primitive";
const sourceSummary = "Specifies the type of path validation to perform.";
const sourceExample =
  'import { Primitive } from "effect/unstable/cli"\n\n// Only accept files\nconst filePath = Primitive.path("file", true)\n\n// Only accept directories\nconst dirPath = Primitive.path("directory", true)\n\n// Accept either files or directories\nconst anyPath = Primitive.path("either", false)';
const moduleRecord = PrimitiveModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("Check runtime visibility for this type/interface export.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleModuleContextInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime module context around this type-like export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧠",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck,
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection,
    },
  ],
});

BunRuntime.runMain(program);
