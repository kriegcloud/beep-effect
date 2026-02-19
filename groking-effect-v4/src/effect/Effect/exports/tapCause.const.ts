/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: tapCause
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.395Z
 *
 * Overview:
 * The `tapCause` function allows you to inspect the complete cause of an error, including failures and defects.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause, Console, Effect } from "effect"
 *
 * const task = Effect.fail("Something went wrong")
 *
 * const program = Effect.tapCause(
 *   task,
 *   (cause) => Console.log(`Logging cause: ${Cause.squash(cause)}`)
 * )
 *
 * Effect.runPromiseExit(program).then(console.log)
 * // Output: "Logging cause: Error: Something went wrong"
 * // Then: { _id: 'Exit', _tag: 'Failure', cause: ... }
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
import * as EffectModule from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "tapCause";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary =
  "The `tapCause` function allows you to inspect the complete cause of an error, including failures and defects.";
const sourceExample =
  'import { Cause, Console, Effect } from "effect"\n\nconst task = Effect.fail("Something went wrong")\n\nconst program = Effect.tapCause(\n  task,\n  (cause) => Console.log(`Logging cause: ${Cause.squash(cause)}`)\n)\n\nEffect.runPromiseExit(program).then(console.log)\n// Output: "Logging cause: Error: Something went wrong"\n// Then: { _id: \'Exit\', _tag: \'Failure\', cause: ... }';
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
