/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/SubscriptionRef
 * Export: modifySome
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/SubscriptionRef.ts
 * Generated: 2026-02-19T04:14:21.694Z
 *
 * Overview:
 * Atomically modifies the `SubscriptionRef` with a function that computes a return value and optionally a new value, notifying subscribers only if the value changes.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Option, SubscriptionRef } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   const ref = yield* SubscriptionRef.make(10)
 * 
 *   const result = yield* SubscriptionRef.modifySome(
 *     ref,
 *     (n) =>
 *       n > 5 ? ["Updated", Option.some(n * 2)] : ["Not updated", Option.none()]
 *   )
 *   console.log(result)
 * 
 *   const newValue = yield* SubscriptionRef.get(ref)
 *   console.log("New value:", newValue)
 * })
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
import * as SubscriptionRefModule from "effect/SubscriptionRef";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "modifySome";
const exportKind = "const";
const moduleImportPath = "effect/SubscriptionRef";
const sourceSummary = "Atomically modifies the `SubscriptionRef` with a function that computes a return value and optionally a new value, notifying subscribers only if the value changes.";
const sourceExample = "import { Effect, Option, SubscriptionRef } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  const ref = yield* SubscriptionRef.make(10)\n\n  const result = yield* SubscriptionRef.modifySome(\n    ref,\n    (n) =>\n      n > 5 ? [\"Updated\", Option.some(n * 2)] : [\"Not updated\", Option.none()]\n  )\n  console.log(result)\n\n  const newValue = yield* SubscriptionRef.get(ref)\n  console.log(\"New value:\", newValue)\n})";
const moduleRecord = SubscriptionRefModule as Record<string, unknown>;

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
