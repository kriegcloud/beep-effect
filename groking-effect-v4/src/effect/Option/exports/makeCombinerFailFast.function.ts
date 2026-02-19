/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: makeCombinerFailFast
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:14:15.453Z
 *
 * Overview:
 * Creates a `Combiner` for `Option<A>` with fail-fast semantics: returns `None` if either operand is `None`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Number, Option } from "effect"
 *
 * const combiner = Option.makeCombinerFailFast(Number.ReducerSum)
 * console.log(combiner.combine(Option.some(1), Option.some(2)))
 * // Output: { _id: 'Option', _tag: 'Some', value: 3 }
 *
 * console.log(combiner.combine(Option.some(1), Option.none()))
 * // Output: { _id: 'Option', _tag: 'None' }
 * ```
 *
 * Focus:
 * - Function export exploration with focused runtime examples.
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
import * as OptionModule from "effect/Option";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "makeCombinerFailFast";
const exportKind = "function";
const moduleImportPath = "effect/Option";
const sourceSummary =
  "Creates a `Combiner` for `Option<A>` with fail-fast semantics: returns `None` if either operand is `None`.";
const sourceExample =
  "import { Number, Option } from \"effect\"\n\nconst combiner = Option.makeCombinerFailFast(Number.ReducerSum)\nconsole.log(combiner.combine(Option.some(1), Option.some(2)))\n// Output: { _id: 'Option', _tag: 'Some', value: 3 }\n\nconsole.log(combiner.combine(Option.some(1), Option.none()))\n// Output: { _id: 'Option', _tag: 'None' }";
const moduleRecord = OptionModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleFunctionDiscovery = Effect.gen(function* () {
  yield* Console.log("Inspect runtime metadata before attempting invocation.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleFunctionInvocation = Effect.gen(function* () {
  yield* Console.log("Execute a safe zero-arg invocation probe.");
  yield* probeNamedExportFunction({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧪",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Function Discovery",
      description: "Inspect runtime shape and preview callable details.",
      run: exampleFunctionDiscovery,
    },
    {
      title: "Zero-Arg Invocation Probe",
      description: "Attempt invocation and report success/failure details.",
      run: exampleFunctionInvocation,
    },
  ],
});

BunRuntime.runMain(program);
