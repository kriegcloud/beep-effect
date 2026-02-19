/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/Flag
 * Export: mapEffect
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/Flag.ts
 * Generated: 2026-02-19T04:14:24.461Z
 *
 * Overview:
 * Transforms the parsed value using an Effect that can perform IO operations.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, FileSystem } from "effect"
 * import { Flag } from "effect/unstable/cli"
 *
 * // Read file size from path flag
 * const fileSizeFlag = Flag.file("input").pipe(
 *   Flag.mapEffect(Effect.fnUntraced(function*(path) {
 *     const fs = yield* FileSystem.FileSystem
 *     const stats = yield* Effect.orDie(fs.stat(path))
 *     return stats.size
 *   }))
 * )
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as FlagModule from "effect/unstable/cli/Flag";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "mapEffect";
const exportKind = "const";
const moduleImportPath = "effect/unstable/cli/Flag";
const sourceSummary = "Transforms the parsed value using an Effect that can perform IO operations.";
const sourceExample =
  'import { Effect, FileSystem } from "effect"\nimport { Flag } from "effect/unstable/cli"\n\n// Read file size from path flag\nconst fileSizeFlag = Flag.file("input").pipe(\n  Flag.mapEffect(Effect.fnUntraced(function*(path) {\n    const fs = yield* FileSystem.FileSystem\n    const stats = yield* Effect.orDie(fs.stat(path))\n    return stats.size\n  }))\n)';
const moduleRecord = FlagModule as Record<string, unknown>;

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
