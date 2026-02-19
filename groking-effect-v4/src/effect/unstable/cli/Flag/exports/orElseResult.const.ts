/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/Flag
 * Export: orElseResult
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/Flag.ts
 * Generated: 2026-02-19T04:50:46.274Z
 *
 * Overview:
 * Tries to parse with the first flag, then the second, returning a Result that indicates which succeeded.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Result } from "effect"
 * import { Flag } from "effect/unstable/cli"
 *
 * // Try file path, fallback to URL
 * const sourceFlag = Flag.orElseResult(
 *   Flag.file("source"),
 *   () => Flag.string("source-url")
 * )
 *
 * const program = Effect.gen(function*() {
 *   const [leftover, source] = yield* sourceFlag.parse({
 *     arguments: [],
 *     flags: { "source-url": ["https://google.com"] }
 *   })
 *   if (Result.isSuccess(source)) {
 *     console.log("Using file:", source.success)
 *   } else {
 *     console.log("Using URL:", source.failure)
 *   }
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
import * as FlagModule from "effect/unstable/cli/Flag";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "orElseResult";
const exportKind = "const";
const moduleImportPath = "effect/unstable/cli/Flag";
const sourceSummary =
  "Tries to parse with the first flag, then the second, returning a Result that indicates which succeeded.";
const sourceExample =
  'import { Effect, Result } from "effect"\nimport { Flag } from "effect/unstable/cli"\n\n// Try file path, fallback to URL\nconst sourceFlag = Flag.orElseResult(\n  Flag.file("source"),\n  () => Flag.string("source-url")\n)\n\nconst program = Effect.gen(function*() {\n  const [leftover, source] = yield* sourceFlag.parse({\n    arguments: [],\n    flags: { "source-url": ["https://google.com"] }\n  })\n  if (Result.isSuccess(source)) {\n    console.log("Using file:", source.success)\n  } else {\n    console.log("Using URL:", source.failure)\n  }\n})';
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
