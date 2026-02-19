/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: Option
 * Kind: type
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.082Z
 *
 * Overview:
 * The `Option` data type represents optional values. An `Option<A>` is either `Some<A>`, containing a value of type `A`, or `None`, representing absence.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 *
 * const someValue: Option.Option<number> = Option.some(42)
 * const noneValue: Option.Option<number> = Option.none()
 *
 * const result = Option.match(someValue, {
 *   onNone: () => "No value",
 *   onSome: (value) => `Value is ${value}`
 * })
 *
 * console.log(result)
 * // Output: "Value is 42"
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Option";
const exportKind = "type";
const moduleImportPath = "effect/Option";
const sourceSummary =
  "The `Option` data type represents optional values. An `Option<A>` is either `Some<A>`, containing a value of type `A`, or `None`, representing absence.";
const sourceExample =
  'import { Option } from "effect"\n\nconst someValue: Option.Option<number> = Option.some(42)\nconst noneValue: Option.Option<number> = Option.none()\n\nconst result = Option.match(someValue, {\n  onNone: () => "No value",\n  onSome: (value) => `Value is ${value}`\n})\n\nconsole.log(result)\n// Output: "Value is 42"';
const moduleRecord = O as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("`Option` is a compile-time type and is erased at runtime.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleModuleContextInspection = Effect.gen(function* () {
  yield* Console.log("Companion runtime APIs are exported from the `Option` module.");
  yield* inspectNamedExport({ moduleRecord, exportName: "some" });
});

const exampleSourceAlignedCompanionFlow = Effect.gen(function* () {
  yield* Console.log("Bridge: use runtime constructors/combinators to work with `Option` values.");

  const someValue = O.some(42);
  const noneValue = O.none<number>();

  const someMessage = O.match(someValue, {
    onNone: () => "No value",
    onSome: (value) => `Value is ${value}`,
  });
  const noneMessage = O.match(noneValue, {
    onNone: () => "No value",
    onSome: (value) => `Value is ${value}`,
  });

  yield* Console.log(`Option.some(42) -> ${someMessage}`);
  yield* Console.log(`Option.none() -> ${noneMessage}`);
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧠",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck,
    },
    {
      title: "Companion Export Inspection",
      description: "Inspect a runtime companion export that constructs `Option` values.",
      run: exampleModuleContextInspection,
    },
    {
      title: "Source-Aligned Companion Flow",
      description: "Run `some`, `none`, and `match` to mirror the source JSDoc behavior.",
      run: exampleSourceAlignedCompanionFlow,
    },
  ],
});

BunRuntime.runMain(program);
