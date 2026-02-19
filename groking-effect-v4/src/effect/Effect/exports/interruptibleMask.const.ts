/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: interruptibleMask
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.389Z
 *
 * Overview:
 * This function behaves like {@link interruptible}, but it also provides a `restore` function. This function can be used to restore the interruptibility of any specific region of code.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect } from "effect"
 *
 * const program = Effect.interruptibleMask((restore) =>
 *   Effect.gen(function*() {
 *     yield* Console.log("Interruptible phase...")
 *     yield* Effect.sleep("1 second")
 *
 *     // Make this part uninterruptible
 *     yield* restore(
 *       Effect.gen(function*() {
 *         yield* Console.log("Uninterruptible phase...")
 *         yield* Effect.sleep("2 seconds")
 *       })
 *     )
 *
 *     yield* Console.log("Back to interruptible")
 *   })
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
import * as EffectModule from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "interruptibleMask";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary =
  "This function behaves like {@link interruptible}, but it also provides a `restore` function. This function can be used to restore the interruptibility of any specific region of ...";
const sourceExample =
  'import { Console, Effect } from "effect"\n\nconst program = Effect.interruptibleMask((restore) =>\n  Effect.gen(function*() {\n    yield* Console.log("Interruptible phase...")\n    yield* Effect.sleep("1 second")\n\n    // Make this part uninterruptible\n    yield* restore(\n      Effect.gen(function*() {\n        yield* Console.log("Uninterruptible phase...")\n        yield* Effect.sleep("2 seconds")\n      })\n    )\n\n    yield* Console.log("Back to interruptible")\n  })\n)';
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
