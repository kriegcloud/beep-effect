/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: uninterruptibleMask
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.396Z
 *
 * Overview:
 * Disables interruption and provides a restore function to restore the interruptible state within the effect.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect } from "effect"
 * 
 * const program = Effect.uninterruptibleMask((restore) =>
 *   Effect.gen(function*() {
 *     yield* Console.log("Uninterruptible phase...")
 *     yield* Effect.sleep("1 second")
 * 
 *     // Restore interruptibility for this part
 *     yield* restore(
 *       Effect.gen(function*() {
 *         yield* Console.log("Interruptible phase...")
 *         yield* Effect.sleep("2 seconds")
 *       })
 *     )
 * 
 *     yield* Console.log("Back to uninterruptible")
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
const exportName = "uninterruptibleMask";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Disables interruption and provides a restore function to restore the interruptible state within the effect.";
const sourceExample = "import { Console, Effect } from \"effect\"\n\nconst program = Effect.uninterruptibleMask((restore) =>\n  Effect.gen(function*() {\n    yield* Console.log(\"Uninterruptible phase...\")\n    yield* Effect.sleep(\"1 second\")\n\n    // Restore interruptibility for this part\n    yield* restore(\n      Effect.gen(function*() {\n        yield* Console.log(\"Interruptible phase...\")\n        yield* Effect.sleep(\"2 seconds\")\n      })\n    )\n\n    yield* Console.log(\"Back to uninterruptible\")\n  })\n)";
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
