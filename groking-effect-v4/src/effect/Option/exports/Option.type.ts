/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: Option
 * Kind: type
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:14:15.454Z
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as OptionModule from "effect/Option";

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
const moduleRecord = OptionModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("Check runtime visibility for this type/interface export.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleModuleContextInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime module context around this type-like export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
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
  bunContext: BunContext,
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck,
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection,
    },
  ],
});

BunRuntime.runMain(program);
