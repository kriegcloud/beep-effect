/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: none
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.082Z
 *
 * Overview:
 * Creates an `Option` representing the absence of a value.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 *
 * //      ┌─── Option<never>
 * //      ▼
 * const noValue = Option.none()
 *
 * console.log(noValue)
 * // Output: { _id: 'Option', _tag: 'None' }
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { createPlaygroundProgram, formatUnknown, inspectNamedExport } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "none";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary = "Creates an `Option` representing the absence of a value.";
const sourceExample =
  "import { Option } from \"effect\"\n\n//      ┌─── Option<never>\n//      ▼\nconst noValue = Option.none()\n\nconsole.log(noValue)\n// Output: { _id: 'Option', _tag: 'None' }";
const moduleRecord = O as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect Option.none as a runtime export before behavior checks.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedNoneValue = Effect.gen(function* () {
  const noValue = O.none<number>();

  yield* Console.log(`O.none<number>() => ${formatUnknown(noValue)}`);
  yield* Console.log(`O.isNone(noValue) => ${O.isNone(noValue)}`);
});

const exampleNoneBranchBehavior = Effect.gen(function* () {
  const left = O.none<string>();
  const right = O.none<number>();
  const sameReference = Object.is(left, right);
  const fallback = O.getOrElse(() => "fallback")(left);
  const asArray = O.toArray(right);

  yield* Console.log(`Object.is(O.none(), O.none()) => ${sameReference}`);
  yield* Console.log(`O.getOrElse(() => "fallback")(none) => ${fallback}`);
  yield* Console.log(`O.toArray(none) => ${formatUnknown(asArray)}`);
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
      title: "Source JSDoc Behavior",
      description: "Call none() and confirm it yields an Option tagged as None.",
      run: exampleSourceAlignedNoneValue,
    },
    {
      title: "None Branch Handling",
      description: "Show None singleton behavior and how fallback/array projections behave.",
      run: exampleNoneBranchBehavior,
    },
  ],
});

BunRuntime.runMain(program);
