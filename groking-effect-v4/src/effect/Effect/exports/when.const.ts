/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: when
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.396Z
 *
 * Overview:
 * Conditionally executes an effect based on a boolean condition.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect } from "effect"
 * 
 * const shouldLog = true
 * 
 * const program = Effect.when(
 *   Console.log("Condition is true!"),
 *   Effect.succeed(shouldLog)
 * )
 * 
 * Effect.runPromise(program).then(console.log)
 * // Output: "Condition is true!"
 * // { _id: 'Option', _tag: 'Some', value: undefined }
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
const exportName = "when";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Conditionally executes an effect based on a boolean condition.";
const sourceExample = "import { Console, Effect } from \"effect\"\n\nconst shouldLog = true\n\nconst program = Effect.when(\n  Console.log(\"Condition is true!\"),\n  Effect.succeed(shouldLog)\n)\n\nEffect.runPromise(program).then(console.log)\n// Output: \"Condition is true!\"\n// { _id: 'Option', _tag: 'Some', value: undefined }";
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
