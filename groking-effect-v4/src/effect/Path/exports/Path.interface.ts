/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Path
 * Export: Path
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Path.ts
 * Generated: 2026-02-19T04:14:15.671Z
 *
 * Overview:
 * No summary found in JSDoc.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Path } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const path = yield* Path.Path
 *
 *   // Use various path operations
 *   const joined = path.join("home", "user", "documents")
 *   const normalized = path.normalize("./path/../to/file.txt")
 *   const basename = path.basename("/path/to/file.txt")
 *   const dirname = path.dirname("/path/to/file.txt")
 *   const extname = path.extname("file.txt")
 *   const isAbs = path.isAbsolute("/absolute/path")
 *   const parsed = path.parse("/path/to/file.txt")
 *   const relative = path.relative("/from/path", "/to/path")
 *   const resolved = path.resolve("relative", "path")
 *
 *   console.log({
 *     joined,
 *     normalized,
 *     basename,
 *     dirname,
 *     extname,
 *     isAbs,
 *     parsed,
 *     relative,
 *     resolved
 *   })
 * })
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
import * as PathModule from "effect/Path";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Path";
const exportKind = "interface";
const moduleImportPath = "effect/Path";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample =
  'import { Effect, Path } from "effect"\n\nconst program = Effect.gen(function*() {\n  const path = yield* Path.Path\n\n  // Use various path operations\n  const joined = path.join("home", "user", "documents")\n  const normalized = path.normalize("./path/../to/file.txt")\n  const basename = path.basename("/path/to/file.txt")\n  const dirname = path.dirname("/path/to/file.txt")\n  const extname = path.extname("file.txt")\n  const isAbs = path.isAbsolute("/absolute/path")\n  const parsed = path.parse("/path/to/file.txt")\n  const relative = path.relative("/from/path", "/to/path")\n  const resolved = path.resolve("relative", "path")\n\n  console.log({\n    joined,\n    normalized,\n    basename,\n    dirname,\n    extname,\n    isAbs,\n    parsed,\n    relative,\n    resolved\n  })\n})';
const moduleRecord = PathModule as Record<string, unknown>;

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
