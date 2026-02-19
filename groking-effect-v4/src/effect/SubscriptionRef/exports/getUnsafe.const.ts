/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/SubscriptionRef
 * Export: getUnsafe
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/SubscriptionRef.ts
 * Generated: 2026-02-19T04:14:21.694Z
 *
 * Overview:
 * Unsafely retrieves the current value of the `SubscriptionRef`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, SubscriptionRef } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   const ref = yield* SubscriptionRef.make(42)
 * 
 *   const value = SubscriptionRef.getUnsafe(ref)
 *   console.log(value)
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
const exportName = "getUnsafe";
const exportKind = "const";
const moduleImportPath = "effect/SubscriptionRef";
const sourceSummary = "Unsafely retrieves the current value of the `SubscriptionRef`.";
const sourceExample = "import { Effect, SubscriptionRef } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  const ref = yield* SubscriptionRef.make(42)\n\n  const value = SubscriptionRef.getUnsafe(ref)\n  console.log(value)\n})";
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
