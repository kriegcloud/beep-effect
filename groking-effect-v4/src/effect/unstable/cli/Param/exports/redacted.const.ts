/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/Param
 * Export: redacted
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/Param.ts
 * Generated: 2026-02-19T04:14:24.510Z
 *
 * Overview:
 * Creates a redacted parameter for sensitive data like passwords. The value is masked in help output and logging.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as Param from "effect/unstable/cli/Param"
 *
 * // @internal - this module is not exported publicly
 *
 * // Create a password parameter
 * const password = Param.redacted(Param.flagKind, "password")
 *
 * // Create an API key argument
 * const apiKey = Param.redacted(Param.argumentKind, "api-key")
 *
 * // Usage: --password (value will be hidden in help/logs)
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
import * as ParamModule from "effect/unstable/cli/Param";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "redacted";
const exportKind = "const";
const moduleImportPath = "effect/unstable/cli/Param";
const sourceSummary =
  "Creates a redacted parameter for sensitive data like passwords. The value is masked in help output and logging.";
const sourceExample =
  'import * as Param from "effect/unstable/cli/Param"\n\n// @internal - this module is not exported publicly\n\n// Create a password parameter\nconst password = Param.redacted(Param.flagKind, "password")\n\n// Create an API key argument\nconst apiKey = Param.redacted(Param.argumentKind, "api-key")\n\n// Usage: --password (value will be hidden in help/logs)';
const moduleRecord = ParamModule as Record<string, unknown>;

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
