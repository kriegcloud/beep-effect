/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: catchNoSuchElement
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.387Z
 *
 * Overview:
 * Catches `NoSuchElementError` failures and converts them to `Option.none`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Option } from "effect"
 *
 * const some = Effect.fromNullishOr(1).pipe(Effect.catchNoSuchElement)
 * const none = Effect.fromNullishOr(null).pipe(Effect.catchNoSuchElement)
 *
 * Effect.runPromise(some).then(console.log) // { _id: 'Option', _tag: 'Some', value: 1 }
 * Effect.runPromise(none).then(console.log) // { _id: 'Option', _tag: 'None' }
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
const exportName = "catchNoSuchElement";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Catches `NoSuchElementError` failures and converts them to `Option.none`.";
const sourceExample =
  "import { Effect, Option } from \"effect\"\n\nconst some = Effect.fromNullishOr(1).pipe(Effect.catchNoSuchElement)\nconst none = Effect.fromNullishOr(null).pipe(Effect.catchNoSuchElement)\n\nEffect.runPromise(some).then(console.log) // { _id: 'Option', _tag: 'Some', value: 1 }\nEffect.runPromise(none).then(console.log) // { _id: 'Option', _tag: 'None' }";
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
