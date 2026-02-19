/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: option
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:50:35.912Z
 *
 * Overview:
 * Convert success to `Option.some` and failure to `Option.none`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Option } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const someValue = yield* Effect.option(Effect.succeed(1))
 *   const noneValue = yield* Effect.option(Effect.fail("missing"))
 *
 *   yield* Console.log(Option.isSome(someValue))
 *   yield* Console.log(Option.isNone(noneValue))
 * })
 *
 * Effect.runPromise(program)
 * // true
 * // true
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
import * as EffectModule from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "option";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Convert success to `Option.some` and failure to `Option.none`.";
const sourceExample =
  'import { Console, Effect, Option } from "effect"\n\nconst program = Effect.gen(function*() {\n  const someValue = yield* Effect.option(Effect.succeed(1))\n  const noneValue = yield* Effect.option(Effect.fail("missing"))\n\n  yield* Console.log(Option.isSome(someValue))\n  yield* Console.log(Option.isNone(noneValue))\n})\n\nEffect.runPromise(program)\n// true\n// true';
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
